import getCurrentLine from 'get-current-line'

import { Env } from '@/bindings'
import { nanoid } from 'nanoid'

import { Constant } from '../const'
import { Util } from '../util'

import * as TenantUnitModel from './tenantUnit'

export interface ITenant {
  id: string
  userId?: string
  dateCreated: string
  name: string
  password: string
  phone?: string
  email: string
  status: number
  fcmDeviceToken?: string
  lastSignin?: string
  recType: number
  meta: string
}

// D1 doc: https://developers.cloudflare.com/d1/client-api
export const getById = async (env: Env, id: string, fields?: string)
  : Promise<ITenant | undefined> => {
  Util.logCurLine(getCurrentLine())
  if (id == null) throw new Error('Missing parameter: id')

  let field = fields || '*'
  const stmt = env.DB.prepare(`SELECT ${field} FROM Tenants WHERE id=?`).bind(id)
  const record: ITenant = await stmt.first()
  return record
}

export const getAll = async (env: Env, userId: string, crit?: string, fields?: string, sort?: string, pageNo?: string, pageSize?: string)
  : Promise<ITenant[] | undefined> => {
  Util.logCurLine(getCurrentLine())
  if (userId == null) throw new Error('Missing parameter: userId')

  let fs = fields || '*'
  let sql = `SELECT ${fs} FROM Tenants WHERE userId='${userId}'`
  if (crit != null) sql += ` AND ${crit}`
  if (sort != null) sql += ` ORDER BY ${sort}`
  if (pageNo != null && pageSize != null) sql += ` LIMIT ${parseInt(pageNo) * parseInt(pageSize)},${pageSize}`
  console.log(sql)
  const resp = await env.DB.prepare(sql).all()
  if (resp.error != null) throw new Error(resp.error)
  if (resp.results == null || resp.results.length === 0) return []

  let records = resp.results as [ITenant]
  records.forEach(e => delete e.userId)
  return records
}

export const create = async (env: Env, userId: string, param: any)
  : Promise<ITenant | undefined> => {
  Util.logCurLine(getCurrentLine())
  if (param == null) throw new Error('Missing parameters')
  if (userId == null) throw new Error('Missing parameter: userId')
  if (param.name == null) throw new Error('Missing parameter: name')
  if (param.password == null) throw new Error('Missing parameter: password')
  if (param.status == null) throw new Error('Missing parameter: status')
  if (param.email == null) throw new Error('Missing parameter: email')
  if (param.recType == null) throw new Error('Missing parameter: recType')
  if (param.meta == null) throw new Error('Missing parameter: meta')

  // console.log('cp1')
  // console.log(param)

  // Encrypt the password
  const encrypted = await Util.encryptString(param.password, env.TENANT_ENCRYPTION_KEY, Util.getRandomInt(101, 99999))

  // console.log('cp2')
  // console.log('encrypted', encrypted)

  // Descrypt the password
  // const decPwd = await Util.decryptString(encrypted, env.TENANT_ENCRYPTION_KEY)
  // console.log('decPwd', decPwd)

  const count = await env.DB.prepare('SELECT COUNT(*) AS count FROM Users WHERE id=?').bind(userId).first()
  if (count == 0) throw new Error('UserId not found')

  const id: string = nanoid()
  const newRec: ITenant = {
    id: id,
    userId: userId,
    dateCreated: new Date().toISOString(),
    name: param.name,
    password: encrypted,
    phone: param.phone,
    email: param.email,
    status: param.status,
    fcmDeviceToken: param.fcmDeviceToken,
    lastSignin: param.lastSignin,
    recType: param.recType,
    meta: param.meta,
  }

  const result: any = await env.DB.prepare('INSERT INTO Tenants(id,userId,dateCreated,name,password,phone,email,status,fcmDeviceToken,lastSignin,recType,meta) VALUES(?,?,?,?,?,?,?,?,?,?,?,?)').bind(
    newRec.id,
    newRec.userId,
    newRec.dateCreated,
    newRec.name,
    newRec.password,
    newRec.phone,
    newRec.email,
    newRec.status,
    newRec.fcmDeviceToken,
    newRec.lastSignin,
    newRec.recType,
    newRec.meta,
  ).run()
  if (!result.success) throw new Error(result)

  return newRec;
}

export const updateById = async (env: Env, id: string, param: any)
  : Promise<boolean> => {
  Util.logCurLine(getCurrentLine())
  if (id == null) throw new Error('Missing id')
  if (param == null) throw new Error('Missing parameters')

  const stmt = env.DB.prepare('SELECT * FROM Tenants WHERE id=?').bind(id)
  const record: any = await stmt.first()
  if (record == null) throw new Error('Record not found')
  if (record.userId) delete record.userId

  if (param.password) {
    // Encrypt the password
    param.password = await Util.encryptString(param.password, env.TENANT_ENCRYPTION_KEY, Util.getRandomInt(101, 99999))
  }

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
  let sql = `UPDATE Tenants SET ${updValues.join(',')} WHERE id=?`
  values.push(id)
  console.log(sql)
  const result: any = await env.DB.prepare(sql).bind(...values).run()
  // console.log(result)
  if (!result.success) throw new Error(result)

  return true
}

export const deleteById = async (env: Env, id: string)
  : Promise<boolean> => {
  Util.logCurLine(getCurrentLine())
  if (id == null) throw new Error('Missing id')

  const result: any = await env.DB.prepare('DELETE FROM Tenants WHERE id=?').bind(id).run()
  if (!result.success) throw new Error(result)

  return true
}

export const tryCreateTenant = async (env: Env, userId: string, unitId: string, tenantName: string, tenantEmail: string, tenantPassword: string, tenantPhone: string, tenantRole: string, fcmDeviceToken: string)
  : Promise<ITenant> => {
  Util.logCurLine(getCurrentLine())

  // Check the email is exist
  let res = await env.DB.prepare(`SELECT COUNT(*) AS cnt FROM Tenants WHERE email=?`).bind(tenantEmail).first() as any
  if (res.cnt > 0) throw new Error('email_exist')

  // Init the tenant meta field
  let confirmCode = Util.genRandomCode6Digits()
  let meta = {} as any
  meta.lastConfirmTime = Date.now()
  meta.state = 'pending'
  meta.emailChangeConfirmCode = confirmCode
  meta.newEmailAddress = tenantEmail

  // Create a new tenant record
  const tenant = await create(env, userId, {
    name: tenantName,
    email: tenantEmail,
    password: tenantPassword,
    phone: tenantPhone,
    role: tenantRole,
    status: 0,
    fcmDeviceToken: fcmDeviceToken,
    recType: 0,
    meta: JSON.stringify(meta),
  }) as ITenant
  // console.log('new tenant')
  // console.log(tenant)

  // Create a new tenantUnit record
  const tenantUnit = await TenantUnitModel.create(env, {
    tenantId: tenant.id,
    unitId: unitId,
    role: tenantRole,
  }) as TenantUnitModel.ITenantUnit

  // Send confirmation email
  await sendConfirmationEmailMailgun(env, tenantEmail, tenant.id, confirmCode)

  return tenant
}

const sendConfirmationEmailMailgun = async (env: Env, email: string, tenantId: string, confirmCode: string): Promise<boolean> => {
  Util.logCurLine(getCurrentLine())

  const confirmReturnUrl = `${env.SYSTEM_HOST}/api/nl/tenant/confirm_email/${tenantId}?cc=${confirmCode}`
  const emailContentMkup = `
<h1>EstateManage.Net Email Address Confirmation</h1>
<p style="font-size: 16px">
To confirm you're using EstateManage.Net, please click below link:<br />
<a href="${confirmReturnUrl}">${confirmReturnUrl}</a>
</p>
<p style="font-size: 16px; color: #666"><i>This email is sent from EstateManage.Net server. Please don't reply</i></p>
`
  let resp = await Util.sendMailgun(env.MAILGUN_API_URL, env.MAILGUN_API_KEY, {
    from: env.SYSTEM_EMAIL_SENDER,
    to: email,
    subject: 'Tenant Registration Email Address Verification',
    text: Constant.EMAIL_BODY_TEXT,
    html: emailContentMkup,
  })
  // let rst = await resp.text()
  // console.log(rst)
  return true
}
