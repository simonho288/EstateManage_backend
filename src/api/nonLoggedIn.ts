/**
 * This APIs are no JWT requires. Mainly called by the client before user login.
 */

import { Hono } from 'hono'
import { html } from 'hono/html'
import { Bindings, Env } from '@/bindings'
import { nanoid } from 'nanoid'
import getCurrentLine from 'get-current-line'
import jwt from '@tsndr/cloudflare-worker-jwt'

import { Constant } from '../const'
import { Util } from '../util'

const nonLoggedInApi = new Hono<{ Bindings: Bindings }>()

// SAMPLE DATA APIs (temporary)
import { createTables } from '../data/schema/createTables'
import { insertSampleOthers } from '../data/samples/insertOthers'
import { insertSampleUnits } from '../data/samples/insertUnits'
import { IUser } from '@/models/user'
import * as TenantModel from '../models/tenant'
import * as UnitModel from '../models/unit'
import { FirebaseUtil } from './google'

nonLoggedInApi.get('/initialize_db', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const authHdr = c.req.headers.get('Authorization')
    if (!authHdr) throw new Error('Unauthorized')
    // console.log('Authorization', authHdr)
    const authorization = authHdr!.split(' ')
    if (authorization[0].toLowerCase() != 'bearer' || authorization[1] != c.env.DBINIT_SECRET)
      throw new Error('Unauthorized')
    let output = await createTables(c.env)
    return c.json(output)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

nonLoggedInApi.get('/insert_sample_others', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    if (c.env.INITIAL_ADMIN_EMAIL == null)
      throw new Error('Env var INITIAL_ADMIN_EMAIL not defined')
    if (c.env.INITIAL_ADMIN_PASSWORD == null)
      throw new Error('Env var INITIAL_ADMIN_PASSWORD not defined')
    const authHdr = c.req.headers.get('Authorization')
    if (!authHdr) throw new Error('Unauthorized')
    // console.log('Authorization', authHdr)
    const authorization = authHdr!.split(' ')
    if (authorization[0].toLowerCase() != 'bearer' || authorization[1] != c.env.DBINIT_SECRET)
      throw new Error('Unauthorized')
    let output = await insertSampleOthers(c.env, c.env.INITIAL_ADMIN_EMAIL, c.env.INITIAL_ADMIN_PASSWORD)
    return c.json(output)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})
nonLoggedInApi.get('/insert_sample_units', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const authHdr = c.req.headers.get('Authorization')
    if (!authHdr) throw new Error('Unauthorized')
    // console.log('Authorization', authHdr)
    const authorization = authHdr!.split(' ')
    if (authorization[0].toLowerCase() != 'bearer' || authorization[1] != c.env.DBINIT_SECRET)
      throw new Error('Unauthorized')
    let output = await insertSampleUnits(c.env)
    return c.json(output)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

// User authenication. If successful, generate a JWT & return in JSON
nonLoggedInApi.options('/user/auth', (c) => c.text('', 200))
nonLoggedInApi.post('/user/auth', async (c) => {
  Util.logCurLine(getCurrentLine())

  type Param = { email: string, password: string }

  try {
    let param = await c.req.json() as Param
    // console.log(param)
    if (!param.email || !param.password) throw new Error('unspecified_email_pwd')

    // User authenicate
    let email = param.email
    let drst = await c.env.DB.prepare(`SELECT id,password,isValid,meta FROM Users WHERE email=?`).bind(email).first()
    if (drst == null) throw new Error('email_not_found')
    let userRec = drst as IUser
    if (await Util.decryptString(userRec.password!, c.env.USER_ENCRYPTION_KEY) != param.password)
      throw new Error('pwd_incorrect')
    if (userRec.isValid != 1) {
      let meta = JSON.parse(userRec.meta)
      if (meta.state === 'pending') {
        throw new Error('account_pending')
      } else if (meta.state === 'frozen') {
        throw new Error('account_frozen')
      }
    }

    // Creating a expirable JWT & return it in JSON
    const token = await jwt.sign({
      userId: userRec.id,
      exp: Math.floor(Date.now() / 1000) + (12 * (60 * 60)) // Expires: Now + 12 hrs
      // exp: Math.floor(Date.now() / 1000) + 60 // Expires: Now + 1 min
    }, c.env.API_SECRET)

    return c.json({
      data: {
        apiToken: token,
        userId: userRec.id,
      }
    })
  } catch (ex) {
    Util.logException(ex)
    return c.json({ error: (ex as Error).message })
  }
})

nonLoggedInApi.get('/user/confirm_email/:userId', async (c) => {
  Util.logCurLine(getCurrentLine())

  await Util.sleep(1000)

  try {
    const { userId } = c.req.param()
    const { cc } = c.req.query()

    let userRec = await c.env.DB.prepare(`SELECT id,isValid,meta,email FROM Users WHERE id=?`).bind(userId).first() as IUser
    if (userRec == null) throw new Error('User not found')
    if (userRec.isValid === 1) throw new Error('User is already confirmed')
    if (userRec.meta == null) userRec.meta = '{}'
    let meta = JSON.parse(userRec.meta)
    meta.state = ''
    if (meta.emailChangeConfirmCode != cc) throw new Error(`Incorrect confirmation code`)
    delete meta.emailChangeConfirmCode
    if (meta.newEmailAddress != null) {
      userRec.email = meta.newEmailAddress
      delete meta.newEmailAddress
    }

    let result = await c.env.DB.prepare('UPDATE Users SET isValid=?,meta=?,email=? WHERE id=?').bind(1, JSON.stringify(meta), userRec.email, userId).run()
    if (!result.success) throw new Error(`System Internal Error. Please try again later`)
    // console.log(result)

    return c.html(
      html`
<!DOCTYPE html>
<h1>Email Confirmed Successfully</h1>
<p>You can use your email to login to the EstateManage.Net.</p>
<p>Thank You for using EstateManage.Net</p>
      `
    )
  } catch (ex) {
    Util.logException(ex)
    return c.html(
      html`
<!DOCTYPE html>
<h3>Error</h3>
<p>${(ex as Error).message}</p>
      `)
  }
})

nonLoggedInApi.options('/tenant/auth', (c) => c.text('', 200))
nonLoggedInApi.post('/tenant/auth', async (c) => {
  Util.logCurLine(getCurrentLine())

  type Param = {
    userId: string
    mobileOrEmail: string,
    password: string,
    fcmDeviceToken: string,
  }

  try {
    if (c.env.FCM_SERVER_KEY == null) throw new Error('FCM_SERVER_KEY not defined')
    const serverKey = c.env.FCM_SERVER_KEY

    let param = await c.req.json() as Param
    if (!param.mobileOrEmail || !param.password) throw new Error('unspecified_email_pwd')

    // User authenicate
    let emailOrPhone = param.mobileOrEmail
    let password = param.password
    let crit = `(email='${emailOrPhone}' OR phone='${emailOrPhone}') AND recType=0 AND userId='${param.userId}'`
    // console.log('crit', crit)
    let tenants = await TenantModel.getAll(c.env, param.userId, crit, 'id,password,status')
    if (tenants == null || tenants.length === 0) throw new Error('tenant_not_found')

    let found: TenantModel.ITenant | undefined
    for (let i = 0; i < tenants.length; i++) {
      let tenant = tenants[i]
      let dcyPwd = await Util.decryptString(tenant.password!, c.env.TENANT_ENCRYPTION_KEY)
      if (dcyPwd === password) {
        found = tenant
        break
      }
    }
    // console.log('found', found)
    if (found == null) throw new Error('pwd_incorrect')
    if (found.status == 0) {
      throw new Error('account_pending')
    } else if (found.status == 2) {
      throw new Error('account_suspended')
    }

    // Read the tenant with all fields
    let tenant = await TenantModel.getById(c.env, found.id)
    if (tenant == null) throw new Error('internal error tenant not found')

    // Update the tenant record
    let tenantUpdateJson = {
      lastSignin: new Date().toISOString(),
    } as any

    // Is client calls with fcmDeviceToken?
    if (param.fcmDeviceToken != null) {
      if (tenant.fcmDeviceToken != param.fcmDeviceToken) {
        tenantUpdateJson.fcmDeviceToken = param.fcmDeviceToken // Replace the device token

        // Unsubscribe the topics by the old token
        if (tenant.fcmDeviceToken != null) {
          let resp = await FirebaseUtil.fcmGetDeviceSubscription(serverKey, tenant.fcmDeviceToken)
          if (resp.data != null) {
            let subscribedTopics = resp.data

            // Unsubscribe those topics with the old device token
            if (tenant.fcmDeviceToken != null && subscribedTopics && subscribedTopics.length > 0) {
              for (let i in subscribedTopics) {
                const topic = subscribedTopics[i]
                await FirebaseUtil.fcmUnsubscribeDeviceFromTopic(serverKey, tenant.fcmDeviceToken, topic)
              }
            }
          }
        }

        if (tenant.meta == null) throw new Error('internal error tenant meta not defined')
        let meta = JSON.parse(tenant.meta)
        if (meta.relatedUnits == null) throw new Error('internal error tenant meta relatedUnits not defined')

        // Re-subscribe the new token to topics: userId, unitType & role
        // 1. Subscribe to userId
        await FirebaseUtil.fcmSubscribeDeviceToTopic(serverKey, param.fcmDeviceToken, param.userId)
        for (let i = 0; i < meta.relatedUnits.length; ++i) {
          // 2. Subscribe to unitType
          await FirebaseUtil.fcmSubscribeDeviceToTopic(serverKey, param.fcmDeviceToken, meta.relatedUnits[i].type)
          // 3. Subscribe to role
          await FirebaseUtil.fcmSubscribeDeviceToTopic(serverKey, param.fcmDeviceToken, meta.relatedUnits[i].role)
        }
      }
    }
    await TenantModel.updateById(c.env, tenant.id, tenantUpdateJson)

    // console.log('rtnTenant', rtnTenant)

    // Creating a expirable JWT & return it in JSON
    const signedJwt = await jwt.sign({
      userId: param.userId,
      tenantId: tenant.id,
      exp: Math.floor(Date.now() / 1000) + (12 * (60 * 60)) // Expires: Now + 12 hrs
      // exp: Math.floor(Date.now() / 1000) + 60 // Expires: Now + 1 min
    }, c.env.API_SECRET)

    return c.json({
      data: {
        token: signedJwt,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          phone: tenant.phone,
          email: tenant.email,
          status: tenant.status,
          lastSignin: tenant.lastSignin,
        }
      }
    })
  } catch (ex) {
    Util.logException(ex)
    return c.json({ error: (ex as Error).message })
  }
})

nonLoggedInApi.get('/tenant/confirm_email/:tenantId', async (c) => {
  Util.logCurLine(getCurrentLine())

  await Util.sleep(1000)

  try {
    const { tenantId } = c.req.param()
    const { cc } = c.req.query()

    let tenantRec = await c.env.DB.prepare(`SELECT id,status,meta,email FROM Tenants WHERE id=?`).bind(tenantId).first() as TenantModel.ITenant
    if (tenantRec == null) throw new Error('Tenant not found')
    if (tenantRec.status == 1) throw new Error('Tenant is already confirmed')
    if (tenantRec.status == 2) throw new Error('Tenant is suspended')
    if (tenantRec.meta == null) throw new Error('internal error: tenant no meta property found')
    let meta = JSON.parse(tenantRec.meta) as TenantModel.ITenantMeta
    let registration = meta.registration
    if (registration.emailChangeConfirmCode != cc) throw new Error(`incorrect confirmation code`)
    registration.state = 'confirmed'
    delete registration.emailChangeConfirmCode
    if (registration.newEmailAddress != null) {
      tenantRec.email = registration.newEmailAddress
      delete registration.newEmailAddress
    }

    let result = await c.env.DB.prepare('UPDATE Tenants SET status=?,meta=?,email=? WHERE id=?').bind(1, JSON.stringify(meta), tenantRec.email, tenantId).run()
    if (!result.success) throw new Error(`System Internal Error. Please try again later`)
    // console.log(result)

    return c.html(
      html`
<!DOCTYPE html>
<h1>Email Confirmed Successfully</h1>
<p>You can use your email to login to the EstateManage Tenant App.</p>
<p>Thank You for using EstateManage.Net</p>
      `
    )
  } catch (ex) {
    Util.logException(ex)
    return c.html(
      html`
<!DOCTYPE html>
<h3>Error</h3>
<p>${(ex as Error).message}</p>
      `)
  }
})

// app.options('/user/register', (c) => c.text('', 200))
nonLoggedInApi.post('/user/register', async (c) => {
  Util.logCurLine(getCurrentLine())

  type Param = {
    email: string,
    name: string,
    language: string,
    password: string,
    ttToken: string,
  }
  const env = c.env

  try {
    let param = await c.req.json() as Param
    if (param.name == null) throw new Error('Missing parameter: name')
    if (param.email == null) throw new Error('Missing parameter: email')
    if (param.language == null) throw new Error('Missing parameter: language')
    if (param.password == null) throw new Error('Missing parameter: password')
    if (param.ttToken == null) throw new Error('Missing parameter: ttToken')

    // Turnstile Verification. Doc:
    // https://developers.cloudflare.com/turnstile/get-started/server-side-validation/
    let ip = c.req.header('CF-Connecting-IP')
    // console.log('ip', ip)
    let secret = c.env.TURNSTILE_SECRET
    // console.log('secret', secret)
    // console.log('token', param.ttToken)
    if (!await Util.turnstileVerify(param.ttToken, ip, secret))
      throw new Error('Turnstile verification failed')

    // Check the email is already exist
    let resp = await env.DB.prepare(`SELECT COUNT(*) AS cnt FROM Users where email=?`).bind(param.email).first() as any
    if (resp.cnt > 0) throw new Error('User email is used')

    // Encrypt the password
    // const encrypted = await Util.encryptString(param.password, env.USER_ENCRYPTION_KEY, 10001)
    const encrypted = await Util.encryptString(param.password, env.USER_ENCRYPTION_KEY, Util.getRandomInt(10001, 99999))

    // Create a new user record
    let confirmCode = Util.genRandomCode6Digits()
    let userRec: IUser = {
      id: nanoid(),
      dateCreated: new Date().toISOString(),
      name: param.name,
      language: param.language,
      email: param.email,
      password: encrypted,
      role: 'member',
      isValid: 0,
      meta: JSON.stringify({
        state: 'pending',
        lastConfirmTime: null,
        emailConfirmResendCnt: 0,
        emailChangeConfirmCode: confirmCode,
        newEmailAddress: null
      }),
    }
    await c.env.DB.prepare(`INSERT INTO Users(id,dateCreated,name,language,email,password,role,isValid,meta) VALUES(?,?,?,?,?,?,?,?,?)`).bind(
      userRec.id,
      userRec.dateCreated,
      userRec.name,
      userRec.language,
      userRec.email,
      userRec.password,
      userRec.role,
      userRec.isValid,
      userRec.meta,
    ).run()

    // Send confirmation email
    const confirmReturnUrl = `${env.SYSTEM_HOST}/user/confirm_email/${userRec.id}?cc=${confirmCode}`
    const emailContentMkup = `
<h1>EstateManage.Net Email Address Confirmation</h1>
<p style="font-size: 16px">
To confirm you're using EstateManage.Net, please click below link:<br />
<a href="${confirmReturnUrl}">${confirmReturnUrl}</a>
</p>
<p style="font-size: 16px; color: #666"><i>This email is sent from cloud server. Please don't reply</i></p>
    `
    await Util.sendMailgun(env.MAILGUN_API_URL, env.MAILGUN_API_KEY, {
      from: env.SYSTEM_EMAIL_SENDER,
      to: userRec.email,
      subject: 'EstateManage.Net - Email Address Verification',
      text: Constant.EMAIL_BODY_TEXT,
      html: emailContentMkup,
    })

    return c.json({
      data: {
        success: true
      }
    })
  } catch (ex) {
    Util.logException(ex)
    return c.json({ error: (ex as Error).message })
  }
})

nonLoggedInApi.post('/_getOneUnit', async (c) => {
  Util.logCurLine(getCurrentLine())

  type Param = { userId: string }
  const env: Env = c.env

  try {
    const authHdr = c.req.headers.get('Authorization')
    if (!authHdr) throw new Error('Unauthorized')
    // console.log('Authorization', authHdr)
    const authorization = authHdr!.split(' ')
    if (authorization[0].toLowerCase() != 'bearer' || authorization[1] != c.env.DBINIT_SECRET)
      throw new Error('Unauthorized')
    let param = await c.req.json() as Param
    let resp = await UnitModel.getAll(c.env, param.userId, undefined, 'id', undefined, 0, 1)
    return c.json({
      data: resp
    })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

nonLoggedInApi.options('/scanUnitQrcode', (c) => c.text('', 200))
nonLoggedInApi.post('/scanUnitQrcode', async (c) => {
  Util.logCurLine(getCurrentLine())

  type Param = { url: string }
  const env: Env = c.env

  try {
    let param = await c.req.json() as Param
    let url = param.url
    let userId = Util.getQueryParam(url, 'a')
    if (!userId) throw new Error('invalid code a')
    let unitId = Util.getQueryParam(url, 'b')
    if (!unitId) throw new Error('invalid code b')

    console.log('Codes', userId, unitId)
    let resp = await env.DB.prepare(`SELECT type,block,floor,number FROM Units WHERE id=? AND userId=?`).bind(unitId, userId).first() as any
    if (resp == null) throw new Error('unit not found')
    const { type, block, floor, number } = resp

    let estate = await env.DB.prepare(`SELECT id,name,address,contact,langEntries,timezone,timezoneMeta,currency,tenantApp FROM Estates WHERE userId=?`).bind(userId).first() as any
    if (estate == null) throw new Error('estate not found')

    // Creating a expirable JWT & return it in JSON
    // const token = await jwt.sign({
    //   userId: userId,
    //   exp: Math.floor(Date.now() / 1000) + (12 * (60 * 60)) // Expires: Now + 12 hrs
    //   // exp: Math.floor(Date.now() / 1000) + 60 // Expires: Now + 1 min
    // }, c.env.API_SECRET)

    return c.json({
      data: {
        success: true,
        unitId: unitId,
        userId: userId,
        // token: token,
        type: type,
        block: block,
        floor: floor,
        number: number,
        estate: estate
      }
    })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

nonLoggedInApi.post('/createNewTenant', async (c) => {
  Util.logCurLine(getCurrentLine())

  type Param = {
    userId: string
    unitId: string
    name: string
    email: string
    password: string
    phone: string
    role: string
    fcmDeviceToken: string
  }
  const env: Env = c.env

  try {
    const param = await c.req.json() as Param
    if (!param.userId) throw new Error('userId not defined')
    if (!param.unitId) throw new Error('unitId not defined')
    if (!param.name) throw new Error('name not defined')
    if (!param.email) throw new Error('email not defined')
    if (!param.password) throw new Error('password not defined')
    if (!param.phone) throw new Error('phone not defined')
    if (!param.role) throw new Error('role not defined')

    if (['owner', 'tenant', 'occupant', 'agent'].includes(param.role) == false) throw new Error(`invalid role: ${param.role}`)

    // Create a new tenant record
    const { tenant, unit } = await TenantModel.tryCreateTenant(env, param.userId, param.unitId, param.name, param.email, param.password, param.phone, param.role, param.fcmDeviceToken)

    // If there is Firebase device token, subscribe to corresponding FCM topics
    if (param.fcmDeviceToken) {
      if (env.FCM_SERVER_KEY == null) throw new Error('FCM_SERVER_KEY not defined')

      const serverKey = env.FCM_SERVER_KEY
      const devToken = param.fcmDeviceToken
      // 1. Subscribe to userId
      await FirebaseUtil.fcmSubscribeDeviceToTopic(serverKey, devToken, param.userId)
      // 2. Subscribe to unitType
      await FirebaseUtil.fcmSubscribeDeviceToTopic(serverKey, devToken, unit.type)
      // 3. Subscribe to role
      await FirebaseUtil.fcmSubscribeDeviceToTopic(serverKey, devToken, param.role)
    }

    return c.json({
      data: {
        tenantId: tenant.id,
      }
    })
  } catch (ex: any) {
    Util.logException(ex)
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 200)
  }
})

////////////////////////////////////////////////////////////////////////

export { nonLoggedInApi }