import getCurrentLine from 'get-current-line'

import { Env } from '@/bindings'
import { nanoid } from 'nanoid'

import { Util } from '../util'

export interface ITenantUnit {
  tenantId: string
  unitId: string
  role: string
}

// D1 doc: https://developers.cloudflare.com/d1/client-api
export const getById = async (env: Env, tenantId: string, unitId: string, fields?: string)
  : Promise<ITenantUnit | undefined> => {
  Util.logCurLine(getCurrentLine())
  if (tenantId == null) throw new Error('Missing parameter: tenantId')
  if (unitId == null) throw new Error('Missing parameter: unitId')

  let field = fields || '*'
  const stmt = env.DB.prepare(`SELECT ${field} FROM TenantUnits WHERE tenantId=? AND unitId=?`).bind(tenantId, unitId)
  const record: ITenantUnit = await stmt.first()
  return record
}

export const getAll = async (env: Env, tenantId: string, crit?: string, fields?: string, sort?: string, pageNo?: string, pageSize?: string)
  : Promise<ITenantUnit[] | undefined> => {
  Util.logCurLine(getCurrentLine())
  if (tenantId == null) throw new Error('Missing parameter: tenantId')

  let fs = fields || '*'
  let sql = `SELECT ${fs} FROM TenantUnits WHERE tenantId='${tenantId}'`
  if (crit != null) sql += ` AND ${crit}`
  if (sort != null) sql += ` ORDER BY ${sort}`
  if (pageNo != null && pageSize != null) sql += ` LIMIT ${parseInt(pageNo) * parseInt(pageSize)},${pageSize}`
  const resp = await env.DB.prepare(sql).all()
  if (resp.error != null) throw new Error(resp.error)
  if (resp.results == null || resp.results.length === 0) return []

  let records = resp.results as [ITenantUnit]
  return records
}

export const create = async (env: Env, param: any)
  : Promise<ITenantUnit | undefined> => {
  Util.logCurLine(getCurrentLine())
  if (param == null) throw new Error('Missing parameters')
  if (param.tenantId == null) throw new Error('Missing parameter: tenantId')
  if (param.unitId == null) throw new Error('Missing parameter: unitId')
  if (param.role == null) throw new Error('Missing parameter: role')

  let count = await env.DB.prepare('SELECT COUNT(*) AS count FROM Tenants WHERE id=?').bind(param.tenantId).first()
  if (count == 0) throw new Error('TenantId not found')
  count = await env.DB.prepare('SELECT COUNT(*) AS count FROM Units WHERE id=?').bind(param.unitId).first()
  if (count == 0) throw new Error('UnitId not found')

  const newRec: ITenantUnit = {
    tenantId: param.tenantId,
    unitId: param.unitId,
    role: param.role,
  }

  const result: any = await env.DB.prepare('INSERT INTO TenantUnits(tenantId,unitId,role) VALUES(?,?,?)').bind(
    newRec.tenantId,
    newRec.unitId,
    newRec.role,
  ).run()
  if (!result.success) throw new Error(result)

  return newRec;
}

export const updateById = async (env: Env, tenantId: string, unitId: string, param: any)
  : Promise<boolean> => {
  Util.logCurLine(getCurrentLine())
  if (tenantId == null) throw new Error('Missing tenantId')
  if (unitId == null) throw new Error('Missing unitId')
  if (param == null) throw new Error('Missing parameters')

  const stmt = env.DB.prepare('SELECT * FROM TenantUnits WHERE tenantId=? AND unitId=?').bind(tenantId, unitId)
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
  let sql = `UPDATE TenantUnits SET ${updValues.join(',')} WHERE id=?`
  values.push(tenantId)
  values.push(unitId)
  const result: any = await env.DB.prepare(sql).bind(...values).run()
  // console.log(result)
  if (!result.success) throw new Error(result)

  return true
}

export const deleteById = async (env: Env, tenantId: string, unitId: string) => {
  Util.logCurLine(getCurrentLine())
  if (tenantId == null) throw new Error('Missing tenantId')
  if (unitId == null) throw new Error('Missing unitId')

  const result: any = await env.DB.prepare('DELETE FROM TenantUnits WHERE tenantId=? AND unitId=?').bind(tenantId, unitId).run()
  if (!result.success) throw new Error(result)
}
