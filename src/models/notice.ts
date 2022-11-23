// const PREFIX = 'v1:post:'
import { nanoid } from 'nanoid'

declare global {
  interface Crypto {
    randomUUID(): string
  }
}

/*
export type Param = {
  title: string
  body: string
}
*/

export interface Notice {
  id: string
  userId: string
  dateCreated: string
  title: string
  issueDate: string
  audiences?: string
  folderId: string
  isNotifySent: number
  pdf?: string
}

// D1 doc: https://developers.cloudflare.com/d1/client-api
export const getById = async (DB: D1Database, id: string, fields?: string)
  : Promise<Notice | undefined> => {
  if (id == null) throw new Error('Missing parameter: id')

  const stmt = DB.prepare('SELECT * FROM Notices WHERE id=?').bind(id)
  const result: any = await stmt.first()
  // let user: User
  if (result) {
    if (fields == null) return result;
    const aryReqFields = fields.split(',')
    const props = Object.getOwnPropertyNames(result)
    let newRst: any = {}
    for (let i = 0; i < props.length; ++i) {
      let prop = props[i]
      if (aryReqFields.includes(prop)) {
        newRst[prop] = result[prop]
      }
    }
    return newRst as Notice
  }
}

export const getAll = async (DB: D1Database, userId: string, fields?: string)
  : Promise<Notice[] | undefined> => {
  if (userId == null) throw new Error('Missing parameter: userId')

  const resp = await DB.prepare('SELECT * FROM Notices WHERE userId=?').bind(userId).all()
  if (resp.error != null) throw new Error(resp.error)
  if (resp.results == null || resp.results.length === 0) return []

  if (fields == null) return resp.results as Notice[]
  let results: any = [];
  for (let i = 0; i < resp.results.length; ++i) {
    let record: any = resp.results[i];
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
  return results
}

export const create = async (DB: D1Database, param: any): Promise<Notice | undefined> => {
  if (param == null) throw new Error('Missing parameters')
  if (param.userId == null) throw new Error('Missing parameter: userId')
  if (param.title == null) throw new Error('Missing parameter: title')
  if (param.issueDate == null) throw new Error('Missing parameter: issueDate')
  if (param.folderId == null) throw new Error('Missing parameter: folderId')
  if (param.isNotifySent == null) throw new Error('Missing parameter: isNotifySent')

  const id: string = nanoid()
  const newRec: Notice = {
    id: id,
    userId: param.userId,
    dateCreated: new Date().toISOString(),
    title: param.title,
    issueDate: param.issueDate,
    audiences: param.audiences,
    folderId: param.folderId,
    isNotifySent: param.isNotifySent,
    pdf: param.pdf,
  }

  const result: any = await DB.prepare('INSERT INTO Notices(id,userId,dateCreated,title,issueDate,audiences,folderId,isNotifySent,pdf) VALUES(?,?,?,?,?,?,?,?,?)').bind(
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

export const updateById = async (DB: D1Database, id: string, param: any)
  : Promise<boolean> => {
  if (id == null) throw new Error('Missing id!')
  if (param == null) throw new Error('Missing parameters!')

  const stmt = DB.prepare('SELECT * FROM Notices WHERE id=?').bind(id)
  const record: any = await stmt.first()

  let updValues: string[] = []
  const props = Object.getOwnPropertyNames(record)
  // let newRec: any = {}
  let values: any = []
  for (let i = 0; i < props.length; ++i) {
    let prop = props[i]
    if (param[prop]) {
      updValues.push(`${prop}=?`)
      values.push(record[prop])
    }
  }
  let sql = `UPDATE Notices SET ${updValues.join(',')} WHERE id=?`
  values.push(id)
  const result: any = await DB.prepare(sql).bind(...values).run()
  // console.log(result)
  if (!result.success) throw new Error(result)

  return true
}

export const deleteById = async (DB: D1Database, id: string)
  : Promise<boolean> => {
  if (id == null) throw new Error('Missing id!')
  const result: any = await DB.prepare('DELETE FROM Notices WHERE id=?').bind(id).run()
  if (!result.success) throw new Error(result)
  return true
}
