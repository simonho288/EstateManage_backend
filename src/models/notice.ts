import getCurrentLine from 'get-current-line'

import { Bindings } from '@/bindings'
import { nanoid } from 'nanoid'

import { Constant } from '../const'
import { Util } from '../util'
import { FirebaseUtil } from '../api/google'
import { ILoop } from './loop'

export interface INotice {
  id: string
  userId?: string
  dateCreated: string
  title: string
  issueDate: string
  audiences?: string
  folderId: string
  isNotifySent: number
  pdf?: string
}

// D1 doc: https://developers.cloudflare.com/d1/client-api
export const getById = async (env: Bindings, userId: string, id: string, fields?: string)
  : Promise<INotice | undefined> => {
  Util.logCurLine(getCurrentLine())
  if (id == null) throw new Error('Missing parameter: id')

  let field = fields || '*'
  const stmt = env.DB.prepare(`SELECT ${field} FROM Notices WHERE userId=? AND id=?`).bind(userId, id)
  const record: INotice = await stmt.first()
  return record
}

export const getAll = async (env: Bindings, userId: string, crit?: string, fields?: string, sort?: string, pageNo?: number, pageSize?: number)
  : Promise<INotice[] | undefined> => {
  Util.logCurLine(getCurrentLine())
  if (userId == null) throw new Error('Missing parameter: userId')

  let fs = fields || '*'
  let sql = `SELECT ${fs} FROM Notices WHERE userId='${userId}'`
  if (crit != null) sql += ` AND ${crit}`
  if (sort != null) sql += ` ORDER BY ${sort}`
  if (pageNo != null && pageSize != null) sql += ` LIMIT ${pageNo * pageSize},${pageSize}`
  const resp = await env.DB.prepare(sql).all()
  if (resp.error != null) throw new Error(resp.error)
  if (resp.results == null || resp.results.length === 0) return []

  let records = resp.results as [INotice]
  records.forEach(e => delete e.userId)
  return records
}

export const create = async (env: Bindings, userId: string, param: any)
  : Promise<INotice | undefined> => {
  Util.logCurLine(getCurrentLine())
  if (param == null) throw new Error('Missing parameters')
  if (userId == null) throw new Error('Missing parameter: userId')
  if (param.title == null) throw new Error('Missing parameter: title')
  if (param.issueDate == null) throw new Error('Missing parameter: issueDate')
  if (param.folderId == null) throw new Error('Missing parameter: folderId')
  if (param.isNotifySent == null) throw new Error('Missing parameter: isNotifySent')

  const count = await env.DB.prepare('SELECT COUNT(*) AS count FROM Users WHERE id=?').bind(userId).first()
  if (count == 0) throw new Error('UserId not found')

  const id: string = nanoid()
  const newRec: INotice = {
    id: id,
    userId: userId,
    dateCreated: new Date().toISOString(),
    title: param.title,
    issueDate: param.issueDate,
    audiences: param.audiences,
    folderId: param.folderId,
    isNotifySent: param.isNotifySent,
    pdf: param.pdf,
  }

  const result: any = await env.DB.prepare('INSERT INTO Notices(id,userId,dateCreated,title,issueDate,audiences,folderId,isNotifySent,pdf) VALUES(?,?,?,?,?,?,?,?,?)').bind(
    newRec.id,
    newRec.userId,
    newRec.dateCreated,
    newRec.title,
    newRec.issueDate,
    newRec.audiences,
    newRec.folderId,
    newRec.isNotifySent,
    newRec.pdf,
  ).run()
  if (!result.success) throw new Error(result)

  return newRec;
}

export const updateById = async (env: Bindings, id: string, param: any)
  : Promise<boolean> => {
  Util.logCurLine(getCurrentLine())
  if (id == null) throw new Error('Missing id')
  if (param == null) throw new Error('Missing parameters')

  const stmt = env.DB.prepare('SELECT * FROM Notices WHERE id=?').bind(id)
  const record: any = await stmt.first()
  if (record == null) throw new Error('Record not found')
  if (record.userId) delete record.userId

  let updValues: string[] = []
  const props = Object.getOwnPropertyNames(record)
  // let newRec: any = {}
  let values: any = []
  for (let i = 0; i < props.length; ++i) {
    let prop = props[i]
    if (param[prop] != undefined) {
      updValues.push(`${prop}=?`)
      values.push(param[prop])
    }
  }
  let sql = `UPDATE Notices SET ${updValues.join(',')} WHERE id=?`
  values.push(id)
  const result: any = await env.DB.prepare(sql).bind(...values).run()
  // console.log(result)
  if (!result.success) throw new Error(result)

  return true
}

export const deleteById = async (env: Bindings, id: string)
  : Promise<boolean> => {
  Util.logCurLine(getCurrentLine())
  if (id == null) throw new Error('Missing id')

  const result: any = await env.DB.prepare('DELETE FROM Notices WHERE id=?').bind(id).run()
  if (!result.success) throw new Error(result)

  return true
}

export const sendNoticeToAudiences = async (env: Bindings, notice: INotice, loop: ILoop): Promise<boolean> => {
  Util.logCurLine(getCurrentLine())

  if (notice.userId == null) throw new Error('error_no_userId')
  if (notice.audiences == null) throw new Error(`record_audiences_not_defined`)
  const audiences = JSON.parse(notice.audiences)
  const userId = notice.userId

  // Determine which topics (Firebase Messaging topic) to send notification
  let unitTopics: Array<String> = []
  if (audiences.res === true) {
    unitTopics.push('res')
  }
  if (audiences.car === true) {
    unitTopics.push('car')
  }
  if (audiences.shp === true) {
    unitTopics.push('shp')
  }
  if (unitTopics.length === 0) throw new Error(`no audience specified`)

  if (env.GOOGLE_SRVACC_EMAIL == null) throw new Error('Internal Error: GOOGLE_SRVACC_EMAIL not configured')
  if (env.GOOGLE_SRVACC_PRIVATE_KEY == null) throw new Error('Internal Error: GOOGLE_SRVACC_PRIVATE_KEY not configured')
  if (env.FIREBASE_PROJECT_ID == null) throw new Error('Internal Error: GOOGLE_SRVACC_PRIVATE_KEY not configured')
  if (env.NOTIFICATION_ICON_URL == null) throw new Error('Internal Error: NOTIFICATION_ICON_URL not configured')

  // Obtain the Google OAuth 2 token
  const scope = 'https://www.googleapis.com/auth/firebase.messaging'
  let accessToken = await FirebaseUtil.getGoogleAuthToken(env.GOOGLE_SRVACC_EMAIL, env.GOOGLE_SRVACC_PRIVATE_KEY, scope)
  if (accessToken) {
    // Building Google API request.
    // Ref: https://firebase.google.com/docs/cloud-messaging/js/topic-messaging#build_send_requests
    let unitConds = unitTopics.map(t => `'${t}' in topics`).join(' || ')
    let topicsCond = `'${userId}' in topics && (${unitConds})`
    // console.log('fcm topics condition:', topicsCond)
    let title = Util.intlStrFromJson(notice.title)

    // data send to client (flutter tenant app)
    let data = {
      type: 'loop',
      id: loop.id
    }
    // console.log(`topicsCond: ${topicsCond}`)
    // console.log(`title: ${title}`)
    // console.log(`data: ${JSON.stringify(data)}`)
    // console.log(`FCM project ID: ${env.FIREBASE_PROJECT_ID}`)
    await FirebaseUtil.fcmSendNotificationMessage(accessToken, env.FIREBASE_PROJECT_ID, Constant.NOTICE_NOTIFICATION_TITLE, title, env.NOTIFICATION_ICON_URL, topicsCond, data)
  }

  return true
}
