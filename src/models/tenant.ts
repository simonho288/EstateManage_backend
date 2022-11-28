import { Env } from '@/bindings'
import { nanoid } from 'nanoid'
import { Util } from '../util'

export interface ITenant {
  id: string
  userId: string
  dateCreated: string
  name: string
  password: string
  phone?: string
  email?: string
  status: number
  role: string
  unitId: string
  fcmDeviceToken?: string
  isApproveNotifySent?: number
  lastSigned?: string
  recType: number
}

// D1 doc: https://developers.cloudflare.com/d1/client-api
export const getById = async (env: Env, id: string, fields?: string)
  : Promise<ITenant | undefined> => {
  if (id == null) throw new Error('Missing parameter: id')

  const stmt = env.DB.prepare('SELECT * FROM Tenants WHERE id=?').bind(id)
  const record: any = await stmt.first()
  // let user: User
  if (record) {
    if (record.userId) delete record.userId
    if (fields == null) return record;
    const aryReqFields = fields.split(',')
    const props = Object.getOwnPropertyNames(record)
    let newRst: any = {}
    for (let i = 0; i < props.length; ++i) {
      let prop = props[i]
      if (aryReqFields.includes(prop)) {
        newRst[prop] = record[prop]
      }
    }
    return newRst as ITenant
  }
}

export const getAll = async (env: Env, userId: string, crit?: string, fields?: string, sort?: string, pageNo?: string, pageSize?: string)
  : Promise<ITenant[] | undefined> => {
  if (userId == null) throw new Error('Missing parameter: userId')

  let sql = `SELECT * FROM Tenants WHERE userId='${userId}'`
  if (crit != null) sql += ` AND ${crit}`
  if (sort != null) sql += ` ORDER BY ${sort}`
  if (pageNo != null && pageSize != null) sql += ` LIMIT ${parseInt(pageNo) * parseInt(pageSize)},${pageSize}`
  const resp = await env.DB.prepare(sql).all()
  if (resp.error != null) throw new Error(resp.error)
  if (resp.results == null || resp.results.length === 0) return []
  resp.results.forEach((e: any) => delete e.userId)
  if (fields == null) return resp.results as ITenant[]
  let results: any = []
  for (let i = 0; i < resp.results.length; ++i) {
    let record: any = resp.results[i]
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

export const create = async (env: Env, userId: string, param: any)
  : Promise<ITenant | undefined> => {
  if (param == null) throw new Error('Missing parameters')
  if (userId == null) throw new Error('Missing parameter: userId')
  if (param.name == null) throw new Error('Missing parameter: name')
  if (param.password == null) throw new Error('Missing parameter: password')
  if (param.status == null) throw new Error('Missing parameter: status')
  if (param.role == null) throw new Error('Missing parameter: role')
  if (param.unitId == null) throw new Error('Missing parameter: unitId')
  if (param.recType == null) throw new Error('Missing parameter: recType')

  // Encrypt the password
  const encrypted = await Util.encryptString(param.password, env.ENCRYPTION_KEY, 10001)
  // console.log('encrypted', encrypted)

  // Descrypt the password
  // const decPwd = await Util.decryptString(encrypted, env.ENCRYPTION_KEY)
  // console.log('decPwd', decPwd)

  const count = await env.DB.prepare('SELECT COUNT(*) AS count FROM Users WHERE id=?').bind(param.userId).first()
  if (count == 0) throw new Error('UserId not found')

  const id: string = nanoid()
  const newRec: ITenant = {
    id: id,
    userId: userId,
    dateCreated: new Date().toISOString(),
    name: param.name,
    password: encrypted,
    status: param.status,
    role: param.role,
    unitId: param.unitId,
    recType: param.recType,
  }

  const result: any = await env.DB.prepare('INSERT INTO Tenants(id,userId,dateCreated,name,password,status,role,unitId,recType) VALUES(?,?,?,?,?,?,?,?,?)').bind(
    newRec.id,
    newRec.userId,
    newRec.dateCreated,
    newRec.name,
    newRec.password,
    newRec.status,
    newRec.role,
    newRec.unitId,
    newRec.recType,
  ).run()
  if (!result.success) throw new Error(result)

  return newRec;
}

export const updateById = async (env: Env, id: string, param: any)
  : Promise<boolean> => {
  if (id == null) throw new Error('Missing id')
  if (param == null) throw new Error('Missing parameters')

  const stmt = env.DB.prepare('SELECT * FROM Tenants WHERE id=?').bind(id)
  const record: any = await stmt.first()
  if (record == null) throw new Error('Record not found')
  if (record.userId) delete record.userId

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
  let sql = `UPDATE Tenants SET ${updValues.join(',')} WHERE id=?`
  values.push(id)
  const result: any = await env.DB.prepare(sql).bind(...values).run()
  // console.log(result)
  if (!result.success) throw new Error(result)

  return true
}

export const deleteById = async (env: Env, id: string)
  : Promise<boolean> => {
  if (id == null) throw new Error('Missing id')

  const result: any = await env.DB.prepare('DELETE FROM Tenants WHERE id=?').bind(id).run()
  if (!result.success) throw new Error(result)

  return true
}
