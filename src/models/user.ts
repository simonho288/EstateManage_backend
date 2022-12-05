/**
 * UserModel is different than others models. The getAll only return the 
 */

import { Env } from '@/bindings'
import { nanoid } from 'nanoid'
import { Util } from '../util'

export interface IUser {
  id: string
  dateCreated: string
  name: string
  language: string
  email: string
  password?: string
  tel?: string
  role: string
}

// Only admin can do that
const validateAdmin = async (env: Env, userId: string) => {
  const record: IUser | undefined = await env.DB.prepare('SELECT role FROM Users WHERE id=?').bind(userId).first()
  if (record == null) throw new Error('User not found')
  if (record.role != 'admin') throw new Error('Unprivileged')
}

export const getAll = async (env: Env, userId: string, crit?: string, fields?: string, sort?: string, pageNo?: string, pageSize?: string)
  : Promise<IUser[] | undefined> => {
  if (userId == null) throw new Error('Missing parameter: userId')

  await validateAdmin(env, userId)

  let sql = `SELECT * FROM Users`
  if (crit != null) sql += ` AND ${crit}`
  if (sort != null) sql += ` ORDER BY ${sort}`
  if (pageNo != null && pageSize != null) sql += ` LIMIT ${parseInt(pageNo) * parseInt(pageSize)},${pageSize}`
  const resp = await env.DB.prepare(sql).all()
  if (resp.error != null) throw new Error(resp.error)
  if (resp.results == null || resp.results.length === 0) return []

  let results: any = []
  for (let i = 0; i < resp.results.length; ++i) {
    let record: any = resp.results[i]
    if (record.password) record.password = '*****'
    if (fields == null) {
      results.push(record)
    } else {
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
  }
  return results
}

export const getOne = async (env: Env, userId: string, id: string, fields?: string)
  : Promise<IUser | undefined> => {
  if (userId == null) throw new Error('Missing parameter: userId')
  if (id == null) throw new Error('Missing parameter: id')

  if (userId != id) {
    await validateAdmin(env, userId)
  }

  let sql = `SELECT * FROM Users WHERE id='${userId}'`
  const record: any = await env.DB.prepare(sql).first()
  if (!record) throw new Error('Record not found')
  if (record.password) record.password = '*****'

  if (fields == null) return record as IUser
  const aryReqFields = fields.split(',')
  const props = Object.getOwnPropertyNames(record)
  let newRst: any = {}
  for (let i = 0; i < props.length; ++i) {
    let prop = props[i]
    if (aryReqFields.includes(prop)) {
      newRst[prop] = record[prop];
    }
  }
  return newRst
}

export const create = async (env: Env, userId: string, param: any): Promise<IUser | undefined> => {
  if (param == null) throw new Error('Missing parameters')
  if (userId == null) throw new Error('Missing parameter: userId')
  if (param.name == null) throw new Error('Missing parameter: name')
  if (param.email == null) throw new Error('Missing parameter: email')
  if (param.password == null) throw new Error('Missing parameter: password')
  if (param.language == null) throw new Error('Missing parameter: language')
  if (param.role == null) throw new Error('Missing parameter: role')

  await validateAdmin(env, userId)

  // Encrypt the password
  const encrypted = await Util.encryptString(param.password, env.ENCRYPTION_KEY, 10001)
  // console.log('encrypted', encrypted)

  const id: string = nanoid()
  const newRec: IUser = {
    id: id,
    dateCreated: new Date().toISOString(),
    name: param.name,
    language: param.language,
    email: param.email,
    password: encrypted,
    tel: param.tel,
    role: param.role,
  }
  const result: any = await env.DB.prepare('INSERT INTO Users(id,dateCreated,name,language,email,password,tel,role) VALUES(?,?,?,?,?,?,?,?)').bind(
    newRec.id,
    newRec.dateCreated,
    newRec.name,
    newRec.language,
    newRec.email,
    newRec.password,
    newRec.tel,
    newRec.role,
  ).run()
  if (!result.success) throw new Error(result)
  delete newRec.password

  return newRec;
}

export const updateById = async (env: Env, userId: string, id: string, param: any)
  : Promise<boolean> => {
  if (id == null) throw new Error('Missing id')
  if (userId == null) throw new Error('Missing userId')
  if (param == null) throw new Error('Missing parameters')

  await validateAdmin(env, userId)

  if (param.password != null) {
    param.password = await Util.encryptString(param.password, env.ENCRYPTION_KEY, 10001)
  }

  const stmt = env.DB.prepare('SELECT * FROM Users WHERE id=?').bind(id)
  const record: any = await stmt.first()

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
  let sql = `UPDATE Users SET ${updValues.join(',')} WHERE id=?`
  values.push(id)
  const result: any = await env.DB.prepare(sql).bind(...values).run()
  // console.log(result)
  if (!result.success) throw new Error(result)

  return true
}

export const deleteById = async (env: Env, userId: string, id: string)
  : Promise<boolean> => {
  if (userId == null) throw new Error('Missing userId')
  if (id == null) throw new Error('Missing id')

  await validateAdmin(env, userId)

  const result: any = await env.DB.prepare('DELETE FROM Users WHERE id=?').bind(id).run()
  if (!result.success) throw new Error(result)

  return true
}
