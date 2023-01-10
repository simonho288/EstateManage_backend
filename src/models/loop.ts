import { Env } from '@/bindings'
import { nanoid } from 'nanoid'

export interface ILoop {
  id: string
  dateCreated: string
  tenantId: string
  type: 'notice' | 'marketplace' | 'amenBkg'
  title: string
  url?: string
  meta?: string
}

// D1 doc: https://developers.cloudflare.com/d1/client-api
export const getById = async (env: Env, id: string, fields?: string)
  : Promise<ILoop | undefined> => {
  if (id == null) throw new Error('Missing parameter: id')

  let field = fields || '*'
  const stmt = env.DB.prepare(`SELECT ${field} FROM Loops WHERE id=?`).bind(id)
  const record: ILoop = await stmt.first()
  return record
}

export const getAll = async (env: Env, tenantId: string, crit?: string, fields?: string, sort?: string, pageNo?: string, pageSize?: string)
  : Promise<ILoop[] | undefined> => {
  if (tenantId == null) throw new Error('Missing parameter: userId')

  let fs = fields || '*'
  let sql = `SELECT ${fs} FROM Loops WHERE tenantId='${tenantId}'`
  if (crit != null) sql += ` AND ${crit}`
  if (sort != null) sql += ` ORDER BY ${sort}`
  if (pageNo != null && pageSize != null) sql += ` LIMIT ${parseInt(pageNo) * parseInt(pageSize)},${pageSize}`
  // console.log(sql)
  const resp = await env.DB.prepare(sql).all()
  if (resp.error != null) throw new Error(resp.error)
  if (resp.results == null || resp.results.length === 0) return []

  let records = resp.results as [ILoop]
  return records
}

export const create = async (env: Env, param: any)
  : Promise<ILoop | undefined> => {
  if (param == null) throw new Error('Missing parameters')
  if (param.type == null) throw new Error('Missing parameter: type')
  if (param.tenantId == null) throw new Error('Missing parameter: tenantId')
  if (param.title == null) throw new Error('Missing parameter: title')

  const count = await env.DB.prepare('SELECT COUNT(*) AS count FROM Tenants WHERE id=?').bind(param.tenantId).first()
  if (count == 0) throw new Error('UserId not found')

  const id: string = nanoid()
  const newRec: ILoop = {
    id: id,
    dateCreated: param.dateCreate ?? new Date().toISOString(),
    type: param.type,
    tenantId: param.tenantId,
    title: param.title,
    url: param.url,
    meta: param.meta,
  }

  const result: any = await env.DB.prepare('INSERT INTO Loops(id,dateCreated,type,tenantId,title,url,meta) VALUES(?,?,?,?,?,?,?)').bind(
    newRec.id,
    newRec.dateCreated,
    newRec.type,
    newRec.tenantId,
    newRec.title,
    newRec.url,
    newRec.meta,
  ).run()
  if (!result.success) throw new Error(result)

  return newRec;
}

export const updateById = async (env: Env, id: string, param: any)
  : Promise<boolean> => {
  if (id == null) throw new Error('Missing id')
  if (param == null) throw new Error('Missing parameters')

  const stmt = env.DB.prepare('SELECT * FROM Loops WHERE id=?').bind(id)
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
  let sql = `UPDATE Loops SET ${updValues.join(',')} WHERE id=?`
  values.push(id)
  const result: any = await env.DB.prepare(sql).bind(...values).run()
  // console.log(result)
  if (!result.success) throw new Error(result)

  return true
}

export const deleteById = async (env: Env, id: string)
  : Promise<boolean> => {
  if (id == null) throw new Error('Missing id')

  const result: any = await env.DB.prepare('DELETE FROM Loops WHERE id=?').bind(id).run()
  if (!result.success) throw new Error(result)

  return true
}
