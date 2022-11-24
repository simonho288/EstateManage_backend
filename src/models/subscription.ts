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

export interface Subscription {
  id: string
  userId: string
  dateCreated: string
  currentStatus: string
  notify?: string
  usageDeadline?: string
  trialPeriod?: string
}

// D1 doc: https://developers.cloudflare.com/d1/client-api
export const getById = async (env: Env, id: string, fields?: string)
  : Promise<Subscription | undefined> => {
  if (id == null) throw new Error('Missing parameter: id')

  const stmt = env.DB.prepare('SELECT * FROM Subscriptions WHERE id=?').bind(id)
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
    return newRst as Subscription
  }
}

export const getAll = async (env: Env, userId: string, fields?: string)
  : Promise<Subscription[] | undefined> => {
  if (userId == null) throw new Error('Missing parameter: userId')

  const resp = await env.DB.prepare('SELECT * FROM Subscriptions WHERE userId=?').bind(userId).all()
  if (resp.error != null) throw new Error(resp.error)
  if (resp.results == null || resp.results.length === 0) return []

  if (fields == null) return resp.results as Subscription[]
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

export const create = async (env: Env, param: any): Promise<Subscription | undefined> => {
  if (param == null) throw new Error('Missing parameters')
  if (param.userId == null) throw new Error('Missing parameter: userId')
  if (param.currentStatus == null) throw new Error('Missing parameter: currentStatus')

  const count = await env.DB.prepare('SELECT COUNT(*) AS count FROM Users WHERE id=?').bind(param.userId).first()
  if (count == 0) throw new Error('UserId not found!')

  const id: string = nanoid()
  const newRec: Subscription = {
    id: id,
    userId: param.userId,
    dateCreated: new Date().toISOString(),
    currentStatus: param.currentStatus,
    notify: param.notify,
    usageDeadline: param.usageDeadline,
    trialPeriod: param.trialPeriod,
  }



  const result: any = await env.DB.prepare('INSERT INTO Subscriptions(id,userId,dateCreated,currentStatus,notify,usageDeadline,trialPeriod) VALUES(?,?,?,?,?,?,?)').bind(
    newRec.id,
    newRec.userId,
    newRec.dateCreated,
    newRec.currentStatus,
    newRec.notify,
    newRec.usageDeadline,
    newRec.trialPeriod,
  ).run()
  if (!result.success) throw new Error(result)

  return newRec;
}

export const updateById = async (env: Env, id: string, param: any)
  : Promise<boolean> => {
  if (id == null) throw new Error('Missing id!')
  if (param == null) throw new Error('Missing parameters!')

  const stmt = env.DB.prepare('SELECT * FROM Subscriptions WHERE id=?').bind(id)
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
  let sql = `UPDATE Subscriptions SET ${updValues.join(',')} WHERE id=?`
  values.push(id)
  const result: any = await env.DB.prepare(sql).bind(...values).run()
  // console.log(result)
  if (!result.success) throw new Error(result)

  return true
}

export const deleteById = async (env: Env, id: string)
  : Promise<boolean> => {
  if (id == null) throw new Error('Missing id!')
  const result: any = await env.DB.prepare('DELETE FROM Subscriptions WHERE id=?').bind(id).run()
  if (!result.success) throw new Error(result)
  return true
}
