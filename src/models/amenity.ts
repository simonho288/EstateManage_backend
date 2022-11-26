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

export interface Amenity {
  id: string
  userId: string
  dateCreated: string
  name: string
  details?: string
  photo?: string
  status: string
  fee?: number
  currency: string
  availableDays: string
  bookingTimeBasic: string
  timeBased?: string
  sectionBased?: string
  bookingAdvanceDays?: string
  autoCancelHours?: number
  contact?: string
  isRepetitiveBooking?: number
}

// D1 doc: https://developers.cloudflare.com/d1/client-api
export const getById = async (env: Env, id: string, fields?: string)
  : Promise<Amenity | undefined> => {
  if (id == null) throw new Error('Missing parameter: id')

  const stmt = env.DB.prepare('SELECT * FROM Amenities WHERE id=?').bind(id)
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
    return newRst as Amenity
  }
}

export const getAll = async (env: Env, userId: string, crit?: string, fields?: string, sort?: string)
  : Promise<Amenity[] | undefined> => {
  if (userId == null) throw new Error('Missing parameter: userId')

  let sql = `SELECT * FROM Amenities WHERE userId='${userId}'`
  if (crit) sql += ` AND ${crit}`
  if (sort) sql += ` ORDER BY ${sort}`
  const resp = await env.DB.prepare(sql).all()
  if (resp.error != null) throw new Error(resp.error)
  if (resp.results == null || resp.results.length === 0) return []

  if (fields == null) return resp.results as Amenity[]
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
  : Promise<Amenity | undefined> => {
  if (param == null) throw new Error('Missing parameters')
  if (userId == null) throw new Error('Missing parameter: userId')
  if (param.name == null) throw new Error('Missing parameter: name')
  if (param.status == null) throw new Error('Missing parameter: status')
  if (param.currency == null) throw new Error('Missing parameter: currency')
  if (param.availableDays == null) throw new Error('Missing parameter: availableDays')
  if (param.bookingTimeBasic == null) throw new Error('Missing parameter: bookingTimeBasic')

  const count = await env.DB.prepare('SELECT COUNT(*) AS count FROM Users WHERE id=?').bind(param.userId).first()
  if (count == 0) throw new Error('UserId not found')

  const id: string = nanoid()
  const newRec: Amenity = {
    id: id,
    userId: userId,
    dateCreated: new Date().toISOString(),
    name: param.name,
    details: param.details,
    photo: param.photo,
    status: param.status,
    fee: param.fee,
    currency: param.currency,
    availableDays: param.availableDays,
    bookingTimeBasic: param.bookingTimeBasic,
    timeBased: param.timeBased,
    sectionBased: param.sectionBased,
    bookingAdvanceDays: param.bookingAdvanceDays,
    autoCancelHours: param.autoCancelHours,
    contact: param.contact,
    isRepetitiveBooking: param.isRepetitiveBooking,
  }

  const result: any = await env.DB.prepare('INSERT INTO Amenities(id,userId,dateCreated,name,details,photo,status,fee,currency,availableDays,bookingTimeBasic,timeBased,sectionBased,bookingAdvanceDays,autoCancelHours,contact,isRepetitiveBooking) VALUES(?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)').bind(
    newRec.id,
    newRec.userId,
    newRec.dateCreated,
    newRec.name,
    newRec.details,
    newRec.photo,
    newRec.status,
    newRec.fee,
    newRec.currency,
    newRec.availableDays,
    newRec.bookingTimeBasic,
    newRec.timeBased,
    newRec.sectionBased,
    newRec.bookingAdvanceDays,
    newRec.autoCancelHours,
    newRec.contact,
    newRec.isRepetitiveBooking,
  ).run()
  if (!result.success) throw new Error(result)

  return newRec;
}

export const updateById = async (env: Env, id: string, param: any)
  : Promise<boolean> => {
  if (id == null) throw new Error('Missing id')
  if (param == null) throw new Error('Missing parameters')

  const stmt = env.DB.prepare('SELECT * FROM Amenities WHERE id=?').bind(id)
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
  let sql = `UPDATE Amenities SET ${updValues.join(',')} WHERE id=?`
  values.push(id)
  const result: any = await env.DB.prepare(sql).bind(...values).run()
  // console.log(result)
  if (!result.success) throw new Error(result)

  return true
}

export const deleteById = async (env: Env, id: string)
  : Promise<boolean> => {
  if (id == null) throw new Error('Missing id')

  const result: any = await env.DB.prepare('DELETE FROM Amenities WHERE id=?').bind(id).run()
  if (!result.success) throw new Error(result)

  return true
}
