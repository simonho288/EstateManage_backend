import { Env } from '@/bindings'
import { nanoid } from 'nanoid'

// declare global {
//   interface Crypto {
//     randomUUID(): string
//   }
// }

/*
export type Param = {
  title: string
  body: string
}
*/

export interface TenantAmenityBooking {
  id: string
  userId: string
  dateCreated: string
  tenantId: string
  amenityId: string
  title?: string
  bookingTimeBasic: string
  date: string
  status: string
  totalFee?: number
  currency?: string
  isPaid?: number
  autoCancelTime?: string
  timeSlots?: string
}

// D1 doc: https://developers.cloudflare.com/d1/client-api
export const getById = async (env: Env, id: string, fields?: string)
  : Promise<TenantAmenityBooking | undefined> => {
  if (id == null) throw new Error('Missing parameter: id')

  const stmt = env.DB.prepare('SELECT * FROM TenantAmenityBookings WHERE id=?').bind(id)
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
    return newRst as TenantAmenityBooking
  }
}

export const getAll = async (env: Env, userId: string, crit?: string, fields?: string, sort?: string)
  : Promise<TenantAmenityBooking[] | undefined> => {
  if (userId == null) throw new Error('Missing parameter: userId')

  let sql = `SELECT * FROM TenantAmenityBookings WHERE userId='${userId}'`
  if (crit) sql += ` AND ${crit}`
  if (sort) sql += ` ORDER BY ${sort}`
  const resp = await env.DB.prepare(sql).all()
  if (resp.error != null) throw new Error(resp.error)
  if (resp.results == null || resp.results.length === 0) return []

  if (fields == null) return resp.results as TenantAmenityBooking[]
  let results: any = [];
  for (let i = 0; i < resp.results.length; ++i) {
    let record: any = resp.results[i];
    if (record.userId) delete record.userId
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
  : Promise<TenantAmenityBooking | undefined> => {
  if (param == null) throw new Error('Missing parameters')
  if (userId == null) throw new Error('Missing parameter: userId')
  if (param.tenantId == null) throw new Error('Missing parameter: tenantId')
  if (param.amenityId == null) throw new Error('Missing parameter: amenityId')
  if (param.bookingTimeBasic == null) throw new Error('Missing parameter: bookingTimeBasic')
  if (param.date == null) throw new Error('Missing parameter: date')
  if (param.status == null) throw new Error('Missing parameter: status')

  const count = await env.DB.prepare('SELECT COUNT(*) AS count FROM Users WHERE id=?').bind(param.userId).first()
  if (count == 0) throw new Error('UserId not found')

  const id: string = nanoid()
  const newRec: TenantAmenityBooking = {
    id: id,
    userId: userId,
    dateCreated: new Date().toISOString(),
    tenantId: param.tenantId,
    amenityId: param.amenityId,
    title: param.title,
    bookingTimeBasic: param.bookingTimeBasic,
    date: param.date,
    status: param.status,
    totalFee: param.totalFee,
    currency: param.currency,
    isPaid: param.isPaid,
    autoCancelTime: param.autoCancelTime,
    timeSlots: param.timeSlots,
  }

  const result: any = await env.DB.prepare('INSERT INTO TenantAmenityBookings(id,userId,dateCreated,tenantId,amenityId,title,bookingTimeBasic,date,status,totalFee,currency,isPaid,autoCancelTime,timeSlots) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(
    newRec.id,
    newRec.userId,
    newRec.dateCreated,
    newRec.tenantId,
    newRec.amenityId,
    newRec.title,
    newRec.bookingTimeBasic,
    newRec.date,
    newRec.status,
    newRec.totalFee,
    newRec.currency,
    newRec.isPaid,
    newRec.autoCancelTime,
    newRec.timeSlots,
  ).run()
  if (!result.success) throw new Error(result)

  return newRec;
}

export const updateById = async (env: Env, id: string, param: any)
  : Promise<boolean> => {
  if (id == null) throw new Error('Missing id')
  if (param == null) throw new Error('Missing parameters')

  const stmt = env.DB.prepare('SELECT * FROM TenantAmenityBookings WHERE id=?').bind(id)
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
  let sql = `UPDATE TenantAmenityBookings SET ${updValues.join(',')} WHERE id=?`
  values.push(id)
  const result: any = await env.DB.prepare(sql).bind(...values).run()
  // console.log(result)
  if (!result.success) throw new Error(result)

  return true
}

export const deleteById = async (env: Env, id: string)
  : Promise<boolean> => {
  if (id == null) throw new Error('Missing id')

  const result: any = await env.DB.prepare('DELETE FROM TenantAmenityBookings WHERE id=?').bind(id).run()
  if (!result.success) throw new Error(result)

  return true
}
