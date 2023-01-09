import { Env } from '@/bindings'
import { nanoid } from 'nanoid'

export interface IEstate {
  id: string
  userId?: string
  dateCreated: string
  name: string
  address?: string
  website?: string
  contact?: string
  langEntries?: string
  timezone: string
  timezoneMeta?: string
  currency: string
  subscriptionStatus?: string
  tenantApp?: string
  onlinePayments?: string
}

// D1 doc: https://developers.cloudflare.com/d1/client-api
export const getById = async (env: Env, id: string, fields?: string)
  : Promise<IEstate | undefined> => {
  if (id == null) throw new Error('Missing parameter: id')

  let fs = fields || '*'
  const stmt = env.DB.prepare(`SELECT ${fs} FROM Estates WHERE id=?`).bind(id)
  const record: IEstate = await stmt.first()
  return record
}

export const getAll = async (env: Env, userId: string, crit?: string, fields?: string, sort?: string, pageNo?: string, pageSize?: string)
  : Promise<IEstate[] | undefined> => {
  if (userId == null) throw new Error('Missing parameter: userId')

  let field = fields || '*'
  let sql = `SELECT ${field} FROM Estates WHERE userId='${userId}'`
  if (crit != null) sql += ` AND ${crit}`
  if (sort != null) sql += ` ORDER BY ${sort}`
  if (pageNo != null && pageSize != null) sql += ` LIMIT ${parseInt(pageNo) * parseInt(pageSize)},${pageSize}`
  const resp = await env.DB.prepare(sql).all()
  if (resp.error != null) throw new Error(resp.error)
  if (resp.results == null || resp.results.length === 0) return []

  let records = resp.results as [IEstate]
  records.forEach(e => delete e.userId)
  return records
}

export const create = async (env: Env, userId: string, param: any)
  : Promise<IEstate | undefined> => {
  if (param == null) throw new Error('Missing parameters')
  if (userId == null) throw new Error('Missing parameter: userId')
  if (param.name == null) throw new Error('Missing parameter: name')
  if (param.timezone == null) throw new Error('Missing parameter: timezone')
  if (param.currency == null) throw new Error('Missing parameter: currency')

  const count = await env.DB.prepare('SELECT COUNT(*) AS count FROM Users WHERE id=?').bind(param.userId).first()
  if (count == 0) throw new Error('UserId not found')

  const id: string = nanoid()
  const newRec: IEstate = {
    id: id,
    userId: userId,
    dateCreated: new Date().toISOString(),
    name: param.name,
    address: param.address,
    website: param.website,
    contact: param.contact,
    langEntries: param.langEntries,
    timezone: param.timezone,
    timezoneMeta: param.timezoneMeta,
    currency: param.currency,
    subscriptionStatus: param.subscriptionStatus,
    tenantApp: param.tenantApp,
    onlinePayments: param.onlinePayments,
  }

  const result: any = await env.DB.prepare('INSERT INTO Estates(id,userId,dateCreated,name,address,website,contact,langEntries,timezone,timezoneMeta,currency,subscriptionStatus,tenantApp,onlinePayments) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(
    newRec.id,
    newRec.userId,
    newRec.dateCreated,
    newRec.name,
    newRec.address,
    newRec.website,
    newRec.contact,
    newRec.langEntries,
    newRec.timezone,
    newRec.timezoneMeta,
    newRec.currency,
    newRec.subscriptionStatus,
    newRec.tenantApp,
    newRec.onlinePayments,
  ).run()
  if (!result.success) throw new Error(result)

  return newRec;
}

export const updateById = async (env: Env, id: string, param: any)
  : Promise<boolean> => {
  if (id == null) throw new Error('Missing id')
  if (param == null) throw new Error('Missing parameters')

  const stmt = env.DB.prepare('SELECT * FROM Estates WHERE id=?').bind(id)
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
  let sql = `UPDATE Estates SET ${updValues.join(',')} WHERE id=?`
  values.push(id)
  const result: any = await env.DB.prepare(sql).bind(...values).run()
  // console.log(result)
  if (!result.success) throw new Error(result)

  return true
}

export const deleteById = async (env: Env, id: string)
  : Promise<boolean> => {
  if (id == null) throw new Error('Missing id')

  const result: any = await env.DB.prepare('DELETE FROM Estates WHERE id=?').bind(id).run()
  if (!result.success) throw new Error(result)

  return true
}
