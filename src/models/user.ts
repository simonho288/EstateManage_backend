// const PREFIX = 'v1:post:'
import { nanoid } from 'nanoid'

declare global {
  interface Crypto {
    randomUUID(): string
  }
}

/*
export type Param = {
  title: string
  body: string
}
*/

export interface User {
  id: string
  dateCreated: string
  name: string
  language: string
  email: string
  password: string
  tel?: string
  role: string
}

// D1 doc: https://developers.cloudflare.com/d1/client-api
export const getById = async (DB: D1Database, id: string, fields: string)
  : Promise<User | undefined> => {
  if (id == null) throw new Error('Missing parameter: id')

  const stmt = DB.prepare('SELECT * FROM Users WHERE id=?').bind(id)
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
    return newRst as User
  }
}

export const getAll = async (DB: D1Database, fields: string)
  : Promise<User[] | undefined> => {
  const resp = await DB.prepare('SELECT * FROM Users').all()
  if (resp.error != null) throw new Error(resp.error)
  if (resp.results == null || resp.results.length === 0) return []

  if (fields == null) return resp.results as User[]
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

export const create = async (DB: D1Database, param: any): Promise<User | undefined> => {
  if (param == null) throw new Error('Missing parameters')
  if (param.name == null) throw new Error('Missing parameter: name')
  if (param.email == null) throw new Error('Missing parameter: email')
  if (param.password == null) throw new Error('Missing parameter: password')
  if (param.language == null) throw new Error('Missing parameter: language')
  if (param.role == null) throw new Error('Missing parameter: role')

  if (param.password) throw new Error('Password not implemented')

  const id: string = nanoid()
  const newRec: User = {
    id: id,
    dateCreated: new Date().toISOString(),
    name: param.name,
    language: param.language,
    email: param.email,
    password: param.password,
    tel: param.tel,
    role: param.role,
  }
  const result: any = await DB.prepare('INSERT INTO Users(id,dateCreated,name,language,email,password,tel,role) VALUES(?,?,?,?,?,?,?,?)').bind(
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

  return newRec;
}

export const updateById = async (DB: D1Database, id: string, param: any)
  : Promise<boolean> => {
  if (id == null) throw new Error('Missing id!')
  if (param == null) throw new Error('Missing parameters!')
  if (param.password) throw new Error('Password not implemented')

  const stmt = DB.prepare('SELECT * FROM Users WHERE id=?').bind(id)
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
  let sql = `UPDATE Users SET ${updValues.join(',')} WHERE id=?`
  values.push(id)
  const result: any = await DB.prepare(sql).bind(...values).run()
  // console.log(result)
  if (!result.success) throw new Error(result)

  return true
}

export const deleteById = async (DB: D1Database, id: string)
  : Promise<boolean> => {
  if (id == null) throw new Error('Missing id!')
  const result: any = await DB.prepare('DELETE FROM Users WHERE id=?').bind(id).run()
  if (!result.success) throw new Error(result)
  return true
}
