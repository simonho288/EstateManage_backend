import getCurrentLine from 'get-current-line'

import { Bindings } from '@/bindings'
import { nanoid } from 'nanoid'

import { Util } from '../util'

export enum EBookingTimeBasic {
  time = 'time',
  section = 'section',
}

export enum EBookingStatus {
  pending = 'pending',
  cancelled = 'cancelled',
  ready = 'ready',
}

export interface ITenantAmenityBooking {
  id?: string
  userId?: string
  dateCreated: string
  tenantId: string
  amenityId: string
  bookingNo: number
  bookingTimeBasic: EBookingTimeBasic
  date: string
  status: EBookingStatus
  totalFee?: number
  currency?: string
  isPaid?: number
  autoCancelTime?: string
  timeSlots?: string
}

// D1 doc: https://developers.cloudflare.com/d1/client-api
export const getById = async (env: Bindings, id: string, fields?: string)
  : Promise<ITenantAmenityBooking | undefined> => {
  Util.logCurLine(getCurrentLine())
  if (id == null) throw new Error('Missing parameter: id')

  let field = fields || '*'
  const stmt = env.DB.prepare(`SELECT ${field} FROM TenantAmenityBookings WHERE id=?`).bind(id)
  const record: ITenantAmenityBooking = await stmt.first()
  return record
}

export const getAll = async (env: Bindings, userId: string, crit?: string, fields?: string, sort?: string, pageNo?: number, pageSize?: number)
  : Promise<ITenantAmenityBooking[] | undefined> => {
  Util.logCurLine(getCurrentLine())
  if (userId == null) throw new Error('Missing parameter: userId')

  let fs = fields || '*'
  let sql = `SELECT ${fs} FROM TenantAmenityBookings WHERE userId='${userId}'`
  if (crit != null) sql += ` AND ${crit}`
  if (sort != null) sql += ` ORDER BY ${sort}`
  if (pageNo != null && pageSize != null) sql += ` LIMIT ${pageNo * pageSize},${pageSize}`
  const resp = await env.DB.prepare(sql).all()
  if (resp.error != null) throw new Error(resp.error)
  if (resp.results == null || resp.results.length === 0) return []

  let records = resp.results as [ITenantAmenityBooking]
  records.forEach(e => delete e.userId)
  return records
}

export const create = async (env: Bindings, userId: string, param: any)
  : Promise<ITenantAmenityBooking | undefined> => {
  Util.logCurLine(getCurrentLine())
  if (param == null) throw new Error('Missing parameters')
  if (userId == null) throw new Error('Missing parameter: userId')
  if (param.tenantId == null) throw new Error('Missing parameter: tenantId')
  if (param.amenityId == null) throw new Error('Missing parameter: amenityId')
  if (param.bookingTimeBasic == null) throw new Error('Missing parameter: bookingTimeBasic')
  if (param.date == null) throw new Error('Missing parameter: date')
  if (param.status == null) throw new Error('Missing parameter: status')
  if (param.bookingNo == null) throw new Error('Missing parameter: bookingNo')

  const count = await env.DB.prepare('SELECT COUNT(*) AS count FROM Users WHERE id=?').bind(userId).first()
  if (count == 0) throw new Error('UserId not found')

  const id: string = nanoid()
  const newRec: ITenantAmenityBooking = {
    id: id,
    userId: userId,
    dateCreated: new Date().toISOString(),
    tenantId: param.tenantId,
    amenityId: param.amenityId,
    bookingNo: param.bookingNo,
    bookingTimeBasic: param.bookingTimeBasic,
    date: param.date,
    status: param.status,
    totalFee: param.totalFee,
    currency: param.currency,
    isPaid: param.isPaid,
    autoCancelTime: param.autoCancelTime,
    timeSlots: param.timeSlots,
  }

  const result: any = await env.DB.prepare('INSERT INTO TenantAmenityBookings(id,userId,dateCreated,tenantId,amenityId,bookingNo,bookingTimeBasic,date,status,totalFee,currency,isPaid,autoCancelTime,timeSlots) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(
    newRec.id,
    newRec.userId,
    newRec.dateCreated,
    newRec.tenantId,
    newRec.amenityId,
    newRec.bookingNo,
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

export const updateById = async (env: Bindings, id: string, param: any)
  : Promise<boolean> => {
  Util.logCurLine(getCurrentLine())
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
    if (param[prop] != undefined) {
      updValues.push(`${prop}=?`)
      values.push(param[prop])
    }
  }
  let sql = `UPDATE TenantAmenityBookings SET ${updValues.join(',')} WHERE id=?`
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

  const result: any = await env.DB.prepare('DELETE FROM TenantAmenityBookings WHERE id=?').bind(id).run()
  if (!result.success) throw new Error(result)

  return true
}
