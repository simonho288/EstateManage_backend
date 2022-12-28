/**
 * UserModel is different than others models. The getAll only return the 
 */

import { Env } from '@/bindings'
import { nanoid } from 'nanoid'
import { Constant } from '../const'
import { Util } from '../util'

export interface IUser {
  id: string
  dateCreated: string
  name: string
  language: string
  email: string
  password?: string
  tel?: string
  role: string
  isValid: number
  meta: string
}

// Only admin can do that
const validateAdmin = async (env: Env, userId: string) => {
  const record: IUser | undefined = await env.DB.prepare('SELECT role FROM Users WHERE id=?').bind(userId).first()
  if (record == null) throw new Error('User not found')
  if (record.role != 'admin') throw new Error('Unprivileged')
}

export const getAll = async (env: Env, userId: string, crit?: string, fields?: string, sort?: string, pageNo?: string, pageSize?: string)
  : Promise<IUser[] | undefined> => {
  if (userId == null) throw new Error('Missing parameter: userId')

  await validateAdmin(env, userId)

  let sql = `SELECT * FROM Users`
  if (crit != null) sql += ` AND ${crit}`
  if (sort != null) sql += ` ORDER BY ${sort}`
  if (pageNo != null && pageSize != null) sql += ` LIMIT ${parseInt(pageNo) * parseInt(pageSize)},${pageSize}`
  const resp = await env.DB.prepare(sql).all()
  if (resp.error != null) throw new Error(resp.error)
  if (resp.results == null || resp.results.length === 0) return []

  let results: any = []
  for (let i = 0; i < resp.results.length; ++i) {
    let record: any = resp.results[i]
    if (record.password) record.password = '*****'
    if (fields == null) {
      results.push(record)
    } else {
      const aryReqFields = fields.split(',')
      const props = Object.getOwnPropertyNames(record)
      let newRst: any = {}
      for (let i = 0; i < props.length; ++i) {
        let prop = props[i]
        if (aryReqFields.includes(prop)) {
          newRst[prop] = record[prop];
        }
      }
      results.push(newRst)
    }
  }
  return results
}

export const getOne = async (env: Env, userId: string, id: string, fields?: string)
  : Promise<IUser | undefined> => {
  if (userId == null) throw new Error('Missing parameter: userId')
  if (id == null) throw new Error('Missing parameter: id')

  if (userId != id) {
    await validateAdmin(env, userId)
  }

  let sql = `SELECT * FROM Users WHERE id='${userId}'`
  const record: any = await env.DB.prepare(sql).first()
  if (!record) throw new Error('Record not found')
  if (record.password) record.password = '*****'

  if (fields == null) return record as IUser
  const aryReqFields = fields.split(',')
  const props = Object.getOwnPropertyNames(record)
  let newRst: any = {}
  for (let i = 0; i < props.length; ++i) {
    let prop = props[i]
    if (aryReqFields.includes(prop)) {
      newRst[prop] = record[prop];
    }
  }
  return newRst
}

export const create = async (env: Env, userId: string, param: any): Promise<IUser | undefined> => {
  if (param == null) throw new Error('Missing parameters')
  if (userId == null) throw new Error('Missing parameter: userId')
  if (param.name == null) throw new Error('Missing parameter: name')
  if (param.email == null) throw new Error('Missing parameter: email')
  if (param.password == null) throw new Error('Missing parameter: password')
  if (param.language == null) throw new Error('Missing parameter: language')
  if (param.role == null) throw new Error('Missing parameter: role')
  if (param.isValid == null) throw new Error('Missing parameter: isValid')
  if (param.meta == null) throw new Error('Missing parameter: meta')

  await validateAdmin(env, userId)

  // Encrypt the password
  const encrypted = await Util.encryptString(param.password, env.USER_ENCRYPTION_KEY, Util.getRandomInt(101, 99999))
  // console.log('encrypted', encrypted)

  const id: string = nanoid()
  const newRec: IUser = {
    id: id,
    dateCreated: new Date().toISOString(),
    name: param.name,
    language: param.language,
    email: param.email,
    password: encrypted,
    tel: param.tel,
    role: param.role,
    isValid: param.isValid,
    meta: param.meta,
  }
  const result: any = await env.DB.prepare('INSERT INTO Users(id,dateCreated,name,language,email,password,tel,role,isValid,meta) VALUES(?,?,?,?,?,?,?,?,?,?)').bind(
    newRec.id,
    newRec.dateCreated,
    newRec.name,
    newRec.language,
    newRec.email,
    newRec.password,
    newRec.tel,
    newRec.role,
    newRec.isValid,
    newRec.meta,
  ).run()
  if (!result.success) throw new Error(result)
  delete newRec.password

  return newRec;
}

export const updateById = async (env: Env, userId: string, id: string, param: any)
  : Promise<boolean> => {
  if (id == null) throw new Error('Missing id')
  if (userId == null) throw new Error('Missing userId')
  if (param == null) throw new Error('Missing parameters')

  await validateAdmin(env, userId)

  if (param.password != null) {
    param.password = await Util.encryptString(param.password, env.USER_ENCRYPTION_KEY, Util.getRandomInt(101, 99999))
  }

  const stmt = env.DB.prepare('SELECT * FROM Users WHERE id=?').bind(id)
  const record: any = await stmt.first()

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
  let sql = `UPDATE Users SET ${updValues.join(',')} WHERE id=?`
  values.push(id)
  const result: any = await env.DB.prepare(sql).bind(...values).run()
  // console.log(result)
  if (!result.success) throw new Error(result)

  return true
}

export const deleteById = async (env: Env, userId: string, id: string)
  : Promise<boolean> => {
  if (userId == null) throw new Error('Missing userId')
  if (id == null) throw new Error('Missing id')

  await validateAdmin(env, userId)

  const result: any = await env.DB.prepare('DELETE FROM Users WHERE id=?').bind(id).run()
  if (!result.success) throw new Error(result)

  return true
}

export const updateProperty = async (env: Env, userId: string, field: string, value: any): Promise<boolean> => {
  if (userId == null) throw new Error('Missing userId')
  if (field == null) throw new Error('Missing field')
  if (value == null) throw new Error('Missing value')

  await validateAdmin(env, userId)

  if (field === 'password') {
    value = await Util.encryptString(value, env.USER_ENCRYPTION_KEY, Util.getRandomInt(101, 99999))
    // } else if (field === 'email') {
    //   throw new Error('Changing email is not supported')
    //   // return await userChangeEmail(env, value, userId)
  }

  let sql = `UPDATE Users SET ${field}=? WHERE id=?`
  const result: any = await env.DB.prepare(sql).bind(value, userId).run()
  // console.log(result)
  if (!result.success) throw new Error('system_error')

  return true
}

const userChangeEmail = async (env: Env, email: string, userId: string): Promise<boolean> => {
  let userRec = await env.DB.prepare(`SELECT email,isValid,meta FROM Users WHERE id=?`).bind(userId).first() as any
  if (userRec == null) throw new Error(`user_not_found`)
  if (userRec.email === email) throw new Error(`email_not_changed`)
  if (userRec.isValid !== 1) throw new Error('user_state_is_invalid')
  let meta = JSON.parse(userRec.meta)
  if (meta.lastConfirmTime != null) {
    const THRESHOLD = 60 * 10 // Allow email change threshold: 10 mins
    let diff = (Date.now() - meta.lastConfirmTime) / 1000
    if (diff < THRESHOLD) {
      throw new Error(`last_email_change_within_threshold`)
    }
  }
  meta.lastConfirmTime = Date.now()
  meta.state = 'pending'
  let confirmCode = Util.genRandomCode6Digits()
  meta.emailChangeConfirmCode = confirmCode
  meta.newEmailAddress = email

  if (await sendConfirmationEmailMailgun(env, email, userId, confirmCode)) {
    if (meta.emailConfirmResendCnt == null)
      meta.emailConfirmResendCnt = 0
    ++meta.emailConfirmResendCnt
    let resp = await env.DB.prepare(`UPDATE Users SET isValid=?,meta=? WHERE id=?`).bind(0, JSON.stringify(meta), userId).run()
    if (!resp.success) throw new Error('system_error')
  }

  return true
}

const sendConfirmationEmailMailgun = async (env: Env, email: string, userId: string, confirmCode: string): Promise<boolean> => {
  const confirmReturnUrl = `${env.SYSTEM_HOST}/user/confirm_email/${userId}?cc=${confirmCode}`
  const emailContentMkup = `
<h1>EstateMan Email Address Confirmation</h1>
<p style="font-size: 16px">
To confirm you're using EstateMan, please click below link:<br />
<a href="${confirmReturnUrl}">${confirmReturnUrl}</a>
</p>
<p style="font-size: 16px; color: #666"><i>This email is sent from cloud server. Please don't reply</i></p>
`
  let resp = await Util.sendMailgun(env.MAILGUN_API_URL, env.MAILGUN_API_KEY, {
    from: env.SYSTEM_EMAIL_SENDER,
    to: email,
    subject: 'EstateMan - Email Address Verification',
    text: Constant.EMAIL_BODY_TEXT,
    html: emailContentMkup,
  })
  // let rst = await resp.text()
  // console.log(rst)
  return true
}
