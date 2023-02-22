import getCurrentLine from 'get-current-line'

import { Bindings } from '@/bindings'
import { nanoid } from 'nanoid'

import { Util } from '../util'

export interface IFolder {
  id: string
  userId?: string
  dateCreated: string
  name: string
  isPublic: number
  status: string
}

// D1 doc: https://developers.cloudflare.com/d1/client-api
export const getById = async (env: Bindings, id: string, fields?: string)
  : Promise<IFolder | undefined> => {
  Util.logCurLine(getCurrentLine())
  if (id == null) throw new Error('Missing parameter: id')

  let fs = fields || '*'
  const stmt = env.DB.prepare(`SELECT ${fs} FROM Folders WHERE id=?`).bind(id)
  const record: IFolder = await stmt.first()
  return record
}

export const getAll = async (env: Bindings, userId: string, crit?: string, fields?: string, sort?: string, pageNo?: number, pageSize?: number)
  : Promise<IFolder[] | undefined> => {
  Util.logCurLine(getCurrentLine())
  if (userId == null) throw new Error('Missing parameter: userId')

  let field = fields || '*'
  let sql = `SELECT ${field} FROM Folders WHERE userId='${userId}'`
  if (crit != null) sql += ` AND ${crit}`
  if (sort != null) sql += ` ORDER BY ${sort}`
  if (pageNo != null && pageSize != null) sql += ` LIMIT ${pageNo * pageSize},${pageSize}`
  const resp = await env.DB.prepare(sql).all()
  if (resp.error != null) throw new Error(resp.error)
  if (resp.results == null || resp.results.length === 0) return []

  let records = resp.results as [IFolder]
  records.forEach(e => delete e.userId)
  return records
}

export const create = async (env: Bindings, userId: string, param: any)
  : Promise<IFolder | undefined> => {
  Util.logCurLine(getCurrentLine())
  if (param == null) throw new Error('Missing parameters')
  if (userId == null) throw new Error('Missing parameter: userId')
  if (param.name == null) throw new Error('Missing parameter: name')
  if (param.isPublic == null) throw new Error('Missing parameter: isPublic')
  if (param.status == null) throw new Error('Missing parameter: status')

  const count = await env.DB.prepare('SELECT COUNT(*) AS count FROM Users WHERE id=?').bind(userId).first()
  if (count == 0) throw new Error('UserId not found')

  const id: string = nanoid()
  const newRec: IFolder = {
    id: id,
    userId: userId,
    dateCreated: new Date().toISOString(),
    name: param.name,
    isPublic: param.isPublic,
    status: param.status,
  }

  const result: any = await env.DB.prepare('INSERT INTO Folders(id,userId,dateCreated,name,isPublic,status) VALUES(?,?,?,?,?,?)').bind(
    newRec.id,
    newRec.userId,
    newRec.dateCreated,
    newRec.name,
    newRec.isPublic,
    newRec.status,
  ).run()
  if (!result.success) throw new Error(result)

  return newRec;
}

export const updateById = async (env: Bindings, id: string, param: any)
  : Promise<boolean> => {
  Util.logCurLine(getCurrentLine())
  if (id == null) throw new Error('Missing id')
  if (param == null) throw new Error('Missing parameters')

  const stmt = env.DB.prepare('SELECT * FROM Folders WHERE id=?').bind(id)
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
  let sql = `UPDATE Folders SET ${updValues.join(',')} WHERE id=?`
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

  const result: any = await env.DB.prepare('DELETE FROM Folders WHERE id=?').bind(id).run()
  if (!result.success) throw new Error(result)

  return true
}
