import getCurrentLine from 'get-current-line'

import { Env } from '@/bindings'
import { nanoid } from 'nanoid'

import { Util } from '../util'

export interface IUnit {
  id: string
  userId?: string
  type: string
  block: string
  floor: string
  number: string
}

// D1 doc: https://developers.cloudflare.com/d1/client-api
export const getById = async (env: Env, id: string, fields?: string)
  : Promise<IUnit | undefined> => {
  Util.logCurLine(getCurrentLine())
  if (id == null) throw new Error('Missing parameter: id')

  let field = fields || '*'
  const stmt = env.DB.prepare(`SELECT ${field} FROM Units WHERE id=?`).bind(id)
  const record: IUnit = await stmt.first()
  return record
}

export const getAll = async (env: Env, userId: string, crit?: string, fields?: string, sort?: string, pageNo?: number, pageSize?: number)
  : Promise<IUnit[] | undefined> => {
  Util.logCurLine(getCurrentLine())
  if (userId == null) throw new Error('Missing parameter: userId')

  let fs = fields || '*'
  let sql = `SELECT ${fs} FROM Units WHERE userId='${userId}'`
  if (crit != null) sql += ` AND ${crit}`
  if (sort != null) sql += ` ORDER BY ${sort}`
  if (pageNo != null && pageSize != null) sql += ` LIMIT ${pageNo * pageSize},${pageSize}`
  const resp = await env.DB.prepare(sql).all()
  if (resp.error != null) throw new Error(resp.error)
  if (resp.results == null || resp.results.length === 0) return []

  let records = resp.results as [IUnit]
  records.forEach(e => delete e.userId)
  return records
}

export const create = async (env: Env, userId: string, param: any)
  : Promise<IUnit | undefined> => {
  Util.logCurLine(getCurrentLine())
  if (param == null) throw new Error('Missing parameters')
  if (userId == null) throw new Error('Missing parameter: userId')
  if (param.type == null) throw new Error('Missing parameter: type')
  if (param.block == null) throw new Error('Missing parameter: block')
  if (param.floor == null) throw new Error('Missing parameter: floor')
  if (param.number == null) throw new Error('Missing parameter: number')

  const count = await env.DB.prepare('SELECT COUNT(*) AS count FROM Users WHERE id=?').bind(param.userId).first()
  if (count == 0) throw new Error('UserId not found')

  const id: string = nanoid()
  const newRec: IUnit = {
    id: id,
    userId: userId,
    type: param.type,
    block: param.block,
    floor: param.floor,
    number: param.number,
  }

  const result: any = await env.DB.prepare('INSERT INTO Units(id,userId,type,block,floor,number) VALUES(?,?,?,?,?,?)').bind(
    newRec.id,
    newRec.userId,
    newRec.type,
    newRec.block,
    newRec.floor,
    newRec.number,
  ).run()
  if (!result.success) throw new Error(result)

  return newRec;
}

export const updateById = async (env: Env, id: string, param: any)
  : Promise<boolean> => {
  Util.logCurLine(getCurrentLine())
  if (id == null) throw new Error('Missing id')
  if (param == null) throw new Error('Missing parameters')

  const stmt = env.DB.prepare('SELECT * FROM Units WHERE id=?').bind(id)
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
  let sql = `UPDATE Units SET ${updValues.join(',')} WHERE id=?`
  values.push(id)
  const result: any = await env.DB.prepare(sql).bind(...values).run()
  // console.log(result)
  if (!result.success) throw new Error(result)

  return true
}

export const deleteById = async (env: Env, id: string)
  : Promise<boolean> => {
  Util.logCurLine(getCurrentLine())
  if (id == null) throw new Error('Missing id')

  const result: any = await env.DB.prepare('DELETE FROM Units WHERE id=?').bind(id).run()
  if (!result.success) throw new Error(result)

  return true
}
