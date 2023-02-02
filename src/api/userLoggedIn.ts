/**
 * Before access the API, must perform user authenicate before. See /user/auth
 * When authenciate successful, a JWT returns. The JWT contains userId
 * & expiry (1 day of JWT effective). All below API needs the userId
 * 
 * JWT implementation: https://github.com/tsndr/cloudflare-worker-jwt
 */

import { Hono } from 'hono'
import { Bindings } from '@/bindings'
import { nanoid } from 'nanoid'
import moment from 'moment'
import getCurrentLine from 'get-current-line'
import jwt from '@tsndr/cloudflare-worker-jwt'
// import { AwsClient, AwsV4Signer } from 'aws4fetch'
import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

import { Constant } from '../const'
import { Util } from '../util'
import * as UserModel from '../models/user'
import * as AmenityModel from '../models/amenity'
import * as EstateModel from '../models/estate'
import * as FolderModel from '../models/folder'
import * as LoopModel from '../models/loop'
import * as MarketplaceModel from '../models/marketplace'
import * as NoticeModel from '../models/notice'
import * as SubscriptionModel from '../models/subscription'
import * as TenAmenBkgModel from '../models/tenAmenBkg'
import * as TenantModel from '../models/tenant'
import * as TenantUnitModel from '../models/tenantUnit'
import * as UnitModel from '../models/unit'

const userLoggedInApi = new Hono<{ Bindings: Bindings }>()

// JWT middleware: Must be called /auth/login to obtain a JWT
userLoggedInApi.use('/*', async (c, next) => {
  try {
    const authHdr = c.req.headers.get('Authorization')
    if (!authHdr) throw new Error('Unauthorized')
    // console.log('Authorization', authorization)

    const authorization = authHdr!.split(' ')
    if (authorization[0].toLowerCase() != 'bearer') throw new Error('Unauthorized')
    const token = authorization[1]
    // console.log('token', token)

    // Verifing token
    const isValid = await jwt.verify(token, c.env.API_SECRET)
    if (!isValid) throw new Error('Unauthorized')

    const { payload } = jwt.decode(token)
    // console.log(payload)

    // Store the user ID in header
    // c.res.headers.append('X-userid', payload.userId)
    c.set('userId', payload.userId)

    await next()
  } catch (ex) {
    Util.logException(ex)
    return c.text((ex as Error).message, 401)
  }
})

userLoggedInApi.get('/', (c) => {
  Util.logCurLine(getCurrentLine())

  let userId = c.get('userId')
  console.log(userId)
  return c.json({ userId: userId })
})

////////////////////////////////////////////////////////////////////////

userLoggedInApi.get('/users/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId') // The userId is encrypted inside the JWT
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await UserModel.getById(c.env, userId, id, fields)
    return c.json({ data: record, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/users', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId') // The userId is encrypted inside the JWT
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    let pageno2 = pageno != null ? parseInt(pageno) : undefined
    let pagesize2 = pagesize != null ? parseInt(pagesize) : undefined
    const records = await UserModel.getAll(c.env, userId, crit, fields, sort, pageno2, pagesize2)
    return c.json({ data: records, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/users', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await UserModel.create(c.env, userId, param)
    return c.json({ data: newRec, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/users/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const id = c.req.param('id')
    let result = await UserModel.updateById(c.env, userId, id, await c.req.json())
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/users/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const id = c.req.param('id')
    const result = await UserModel.deleteById(c.env, userId, id)
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/amenities/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await AmenityModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/amenities', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    let pageno2 = pageno != null ? parseInt(pageno) : undefined
    let pagesize2 = pagesize != null ? parseInt(pagesize) : undefined
    const records = await AmenityModel.getAll(c.env, userId, crit, fields, sort, pageno2, pagesize2)
    return c.json({ data: records, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/amenities', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await AmenityModel.create(c.env, userId, param)
    return c.json({ data: newRec, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/amenities/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    // const id = c.req.param('id')
    let result = await AmenityModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/amenities/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const result = await AmenityModel.deleteById(c.env, c.req.param('id'))
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/estates/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await EstateModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/estates', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    let pageno2 = pageno != null ? parseInt(pageno) : undefined
    let pagesize2 = pagesize != null ? parseInt(pagesize) : undefined
    const records = await EstateModel.getAll(c.env, userId, crit, fields, sort, pageno2, pagesize2)
    return c.json({ data: records, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/estates', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await EstateModel.create(c.env, userId, param)
    return c.json({ data: newRec, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/estates/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    // const id = c.req.param('id')
    let result = await EstateModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/estates/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const result = await EstateModel.deleteById(c.env, c.req.param('id'))
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/folders/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await FolderModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/folders', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    let pageno2 = pageno != null ? parseInt(pageno) : undefined
    let pagesize2 = pagesize != null ? parseInt(pagesize) : undefined
    const records = await FolderModel.getAll(c.env, userId, crit, fields, sort, pageno2, pagesize2)
    return c.json({ data: records, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/folders', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await FolderModel.create(c.env, userId, param)
    return c.json({ data: newRec, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/folders/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    // const id = c.req.param('id')
    let result = await FolderModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/folders/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const result = await FolderModel.deleteById(c.env, c.req.param('id'))
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/loops/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await LoopModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/loops', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    console.log('crit', crit)
    let pageno2 = pageno != null ? parseInt(pageno) : undefined
    let pagesize2 = pagesize != null ? parseInt(pagesize) : undefined
    const records = await LoopModel.getAll(c.env, userId, crit, fields, sort, pageno2, pagesize2)
    console.log('loops', records)
    return c.json({ data: records, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/loops', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    // const userId: string = c.get('userId')
    const param = await c.req.json() as LoopModel.ILoop
    const newRec = await LoopModel.create(c.env, param)
    return c.json({ data: newRec, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/loops/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    // const id = c.req.param('id')
    let result = await LoopModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/loops/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const result = await LoopModel.deleteById(c.env, c.req.param('id'))
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/marketplaces/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await MarketplaceModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/marketplaces', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    let pageno2 = pageno != null ? parseInt(pageno) : undefined
    let pagesize2 = pagesize != null ? parseInt(pagesize) : undefined
    const records = await MarketplaceModel.getAll(c.env, userId, crit, fields, sort, pageno2, pagesize2)
    return c.json({ data: records, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/marketplaces', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await MarketplaceModel.create(c.env, userId, param)
    return c.json({ data: newRec, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/marketplaces/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    // const id = c.req.param('id')
    let result = await MarketplaceModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/marketplaces/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const result = await MarketplaceModel.deleteById(c.env, c.req.param('id'))
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/notices/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await NoticeModel.getById(c.env, userId, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/notices', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    let pageno2 = pageno != null ? parseInt(pageno) : undefined
    let pagesize2 = pagesize != null ? parseInt(pagesize) : undefined
    const records = await NoticeModel.getAll(c.env, userId, crit, fields, sort, pageno2, pagesize2)
    return c.json({ data: records, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/notices', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await NoticeModel.create(c.env, userId, param)
    return c.json({ data: newRec, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/notices/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    let param = await c.req.json()
    let result = await NoticeModel.updateById(c.env, c.req.param('id'), param)
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/notices/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const result = await NoticeModel.deleteById(c.env, c.req.param('id'))
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/subscriptions/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await SubscriptionModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/subscriptions', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    let pageno2 = pageno != null ? parseInt(pageno) : undefined
    let pagesize2 = pagesize != null ? parseInt(pagesize) : undefined
    const records = await SubscriptionModel.getAll(c.env, userId, crit, fields, sort, pageno2, pagesize2)
    return c.json({ data: records, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/subscriptions', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await SubscriptionModel.create(c.env, userId, param)
    return c.json({ data: newRec, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/subscriptions/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    // const id = c.req.param('id')
    let result = await SubscriptionModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/subscriptions/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const result = await SubscriptionModel.deleteById(c.env, c.req.param('id'))
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/tenantAmenityBookings/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await TenAmenBkgModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/tenantAmenityBookings', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    let pageno2 = pageno != null ? parseInt(pageno) : undefined
    let pagesize2 = pagesize != null ? parseInt(pagesize) : undefined
    const records = await TenAmenBkgModel.getAll(c.env, userId, crit, fields, sort, pageno2, pagesize2)
    return c.json({ data: records, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/tenantAmenityBookings', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await TenAmenBkgModel.create(c.env, userId, param)
    return c.json({ data: newRec, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/tenantAmenityBookings/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    // const id = c.req.param('id')
    let result = await TenAmenBkgModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/tenantAmenityBookings/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const result = await TenAmenBkgModel.deleteById(c.env, c.req.param('id'))
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/tenants/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await TenantModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/tenants', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    let pageno2 = pageno != null ? parseInt(pageno) : undefined
    let pagesize2 = pagesize != null ? parseInt(pagesize) : undefined
    const records = await TenantModel.getAll(c.env, userId, crit, fields, sort, pageno2, pagesize2)
    return c.json({ data: records, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/tenants', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await TenantModel.create(c.env, userId, param)
    return c.json({ data: newRec, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/tenants/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    // const id = c.req.param('id')
    let result = await TenantModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/tenants/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const result = await TenantModel.deleteById(c.env, userId, c.req.param('id'))
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/tenantUnits/:tenantId', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const tenantId = c.req.param('tenantId')
    const { fields } = c.req.query()
    const record = await TenantUnitModel.getByTenantId(c.env, tenantId, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/tenantUnits', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    // const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await TenantUnitModel.create(c.env, param)
    return c.json({ data: newRec, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/tenantUnits/:tenantId/:unitId', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const tenantId = c.req.param('tenantId')
    const unitId = c.req.param('unitId')
    let result = await TenantUnitModel.updateById(c.env, tenantId, unitId, await c.req.json())
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/tenantUnits/:tenantId/:unitId', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const tenantId = c.req.param('tenantId')
    const unitId = c.req.param('unitId')
    const result = await TenantUnitModel.deleteById(c.env, tenantId, unitId)
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/units/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await UnitModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/units', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    let pageno2 = pageno != null ? parseInt(pageno) : undefined
    let pagesize2 = pagesize != null ? parseInt(pagesize) : undefined
    const records = await UnitModel.getAll(c.env, userId, crit, fields, sort, pageno2, pagesize2)
    return c.json({ data: records, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/units', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await UnitModel.create(c.env, userId, param)
    return c.json({ data: newRec, success: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/units/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    // const id = c.req.param('id')
    let result = await UnitModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/units/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const result = await UnitModel.deleteById(c.env, c.req.param('id'))
    return c.json({ success: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

//////////////////////////////////// Model Operations End ////////////////////////////////////

userLoggedInApi.post('/queryDatabase', async (c) => {
  Util.logCurLine(getCurrentLine())

  type Param = { sql: string }

  try {
    const userId: string = c.get('userId')
    const param = await c.req.json() as Param
    const sql = param.sql
    const stmt = c.env.DB.prepare(sql)
    const resp = await stmt.all()
    if (resp.error != null) throw new Error(resp.error)
    return c.json({
      data: resp.results
    })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/runSql', async (c) => {
  Util.logCurLine(getCurrentLine())

  type Param = { sql: string }

  try {
    const userId: string = c.get('userId')
    const param = await c.req.json() as Param
    const sql = param.sql
    const stmt = c.env.DB.prepare(sql)
    const resp = await stmt.run()
    if (resp.error != null) throw new Error(resp.error)
    return c.json({
      data: resp
    })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

// Generate presigned URL for uploading file to R2
// Ref: https://developers.cloudflare.com/r2/examples/aws-sdk-js-v3/#generate-presigned-urls
userLoggedInApi.get('/getUploadUrl', async (c) => {
  Util.logCurLine(getCurrentLine())

  const path = c.req.query('path')
  try {
    const S3 = new S3Client({
      region: c.env.S3_REGION,
      endpoint: c.env.S3_HOST,
      credentials: {
        accessKeyId: c.env.S3_ACCESS_KEY,
        secretAccessKey: c.env.S3_ACCESS_SECRET,
      },
    })
    let url = await getSignedUrl(S3, new PutObjectCommand({
      Bucket: c.env.S3_BUCKET,
      Key: path,
    }), { expiresIn: 600 }) // 10 mins
    return c.json({
      data: {
        uploadUrl: url,
        endpoint: `${c.env.S3_ENDPOINT}/${path}`
      }
    })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/getTenAmenBkgs', async (c) => {
  Util.logCurLine(getCurrentLine())

  const userId: string = c.get('userId')
  const start = c.req.query('start')
  try {
    let amenities = await AmenityModel.getAll(c.env, userId, undefined, 'id')
    if (amenities == null || amenities.length == 0) throw new Error('No amenity defined')
    let amenitiesId = amenities.map(e => `'${e.id}'`)

    let sql = `
SELECT
  TenantAmenityBookings.id AS id,
  TenantAmenityBookings.bookingNo,
  TenantAmenityBookings.date,
  TenantAmenityBookings.status,
  TenantAmenityBookings.totalFee,
  TenantAmenityBookings.isPaid,
  TenantAmenityBookings.timeSlots,
  Tenants.name AS TenantName,
  Tenants.phone AS TenantPhone,
  Tenants.email AS TenantEmail,
  Amenities.name AS AmenityName
FROM
  TenantAmenityBookings
INNER JOIN Tenants ON
  TenantAmenityBookings.tenantId = Tenants.id
INNER JOIN Amenities ON
  TenantAmenityBookings.amenityId = Amenities.id
WHERE
  TenantAmenityBookings.amenityId IN (${amenitiesId.join(',')})
  AND date >= ?
  `
    let stmt = c.env.DB.prepare(sql).bind(start)
    let resp = await stmt.all()
    if (resp.error != null) throw new Error(resp.error)
    return c.json({
      data: resp.results
    })
  } catch (ex: any) {
    console.log(ex)
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/uploadToReplaceUnits', async (c) => {
  Util.logCurLine(getCurrentLine())

  type Param = Array<Array<string>>

  const userId: string = c.get('userId')
  const unitType = c.req.query('ut')
  try {
    const units = await c.req.json() as Param
    // console.log(units)
    let info: any = await c.env.DB.prepare(`DELETE FROM Units WHERE userId=? AND type=?`).bind(userId, unitType).run()

    let sqls = new Array<D1PreparedStatement>
    for (let i = 0; i < units.length; ++i) {
      let unit = units[i]
      sqls.push(c.env.DB.prepare('INSERT INTO Units(id,userId,type,block,floor,number) VALUES(?,?,?,?,?,?)').bind(nanoid(), userId, unitType, unit[0], unit[1], unit[2]))
    }
    info = await c.env.DB.batch(sqls)

    return c.json({
      data: {
        success: true
      }
    })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/getUserProfile/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  const userId: string = c.get('userId')
  const id: string = c.req.param('id')
  try {
    if (userId != id) throw new Error('Unauthorized')
    let sql = `SELECT * FROM Users Where id=?`
    const stmt = c.env.DB.prepare(sql).bind(id)
    const resp = await stmt.first() as any
    if (resp.error != null) throw new Error(resp.error)
    if (resp) {
      resp.password = '*****' // mask the password
    }
    return c.json({
      data: resp
    })

  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/updateUserProperty/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    const id: string = c.req.param('id')
    await UserModel.validateAdmin(c.env, userId)
    const param = await c.req.json() as any
    if (param.field == null) throw new Error(`No field provided`)
    if (param.value == null) throw new Error(`No value provided`)

    let result = await UserModel.updateProperty(c.env, id, param.field, param.value)
    return c.json({ success: result })
  } catch (ex: any) {
    console.error(ex)
    // return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
    return c.json({ error: ex.message })
  }
})

userLoggedInApi.post('/genUserConfirmCode', async (c) => {
  Util.logCurLine(getCurrentLine())

  type Param = { email: string, userId: string }

  try {
    const userId: string = c.get('userId')
    const param = await c.req.json() as Param
    if (userId != param.userId) throw new Error('Unauthorized')
    let code = Util.genRandomCode6Digits()
    // console.log('code:', code)

    // Send the email if it is not dummmy
    if (!(param.email.startsWith('dummy') || param.email.startsWith('test') || param.email.startsWith('temp'))) {
      const emailContentMkup = `
      <h1>Email Change Confirmation Code</h1>
      <h2>${code}</h2>
      <p style="font-size: 16px">This email is sent to you because you've requested the email changes. Please enter the code to the prompt on the screen.</p>
      <p style="font-size: 16px; color: #666"><i>This email is sent from cloud server. Please don't reply</i></p>
      `
      await Util.sendMailgun(c.env.MAILGUN_API_URL, c.env.MAILGUN_API_KEY, {
        from: c.env.SYSTEM_EMAIL_SENDER,
        to: param.email,
        subject: 'EstateManage.Net - Email Change Confirmation Code',
        text: Constant.EMAIL_BODY_TEXT,
        html: emailContentMkup,
      })
    }

    return c.json({ data: code })
  } catch (ex: any) {
    console.log(ex)
    // return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
    return c.json({ error: ex.message })
  }
})

userLoggedInApi.get('/getDashboardData', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    let rtnVal = {} as any
    let resp: any
    let db = c.env.DB
    let sql: string

    // First, get the estate
    resp = await EstateModel.getAll(c.env, userId)
    let estateRec = resp[0]
    // const today = Util.getDateStringByTzofs(Date.now(), estateRec.timezone)
    const today = moment().format('YYYY-MM-DD')

    // Get number of residences
    resp = await db.prepare(`SELECT COUNT(*) as cnt FROM Units WHERE userId=? AND type=?`).bind(userId, 'res').first() as any
    rtnVal.numOfResidences = resp.cnt

    // Get number of carparks
    resp = await db.prepare(`SELECT COUNT(*) as cnt FROM Units WHERE userId=? AND type=?`).bind(userId, 'car').first() as any
    rtnVal.numOfCarparks = resp.cnt

    // Get number of shops
    resp = await db.prepare(`SELECT COUNT(*) as cnt FROM Units WHERE userId=? AND type=?`).bind(userId, 'shp').first() as any
    rtnVal.numOfShops = resp.cnt

    // Get number of tenants
    resp = await db.prepare(`SELECT COUNT(*) as cnt FROM Tenants WHERE userId=?`).bind(userId).first() as any
    rtnVal.numOfTenants = resp.cnt

    // Get all bookable amenities
    resp = await db.prepare(`SELECT id,name,photo FROM Amenities WHERE userId=? AND status='open'`).bind(userId).all()
    if (!resp.success) throw new Error(resp.message)
    let amenities = rtnVal.amenities = resp.results
    let amenitiesId = amenities.map((e: any) => `'${e.id}'`).join(',')

    // Get amenity bookings today
    sql = `SELECT TenantAmenityBookings.id AS id,Amenities.name AS AmenityName,Tenants.name as TenantName,TenantAmenityBookings.date,TenantAmenityBookings.timeSlots FROM TenantAmenityBookings INNER JOIN Tenants ON TenantAmenityBookings.tenantId=Tenants.id INNER JOIN Amenities ON Amenities.id=TenantAmenityBookings.amenityId WHERE TenantAmenityBookings.amenityId IN (${amenitiesId}) AND TenantAmenityBookings.date=?`
    resp = await db.prepare(sql).bind(today).all()
    rtnVal.amenityBookings = resp.results
    // console.log(sql)
    // console.log(resp.results)

    return c.json({ data: rtnVal })
  } catch (ex: any) {
    console.error(ex)
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/getAllTenentsWithUnits', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const userId: string = c.get('userId')
    let rtnVal = {} as any
    let resp: any
    let db = c.env.DB

    resp = await db.prepare(`SELECT Tenants.id AS TenantId,Tenants.name,Tenants.phone,Tenants.email,Tenants.status,TenantUnits.role,Units.id AS UnitId,Units.block,Units.floor,Units.number,Units.type FROM Tenants LEFT JOIN TenantUnits ON Tenants.id=TenantUnits.tenantId LEFT JOIN Units ON Units.id=TenantUnits.unitId WHERE Tenants.userId=?`).bind(userId).all() as any

    // console.log(resp.results[0])

    return c.json({ data: resp.results })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/setAmenityBkgStatus', async (c) => {
  Util.logCurLine(getCurrentLine())

  type Param = {
    bkgId: string,
    status: string,
  }

  const userId: string = c.get('userId')
  try {
    const param = await c.req.json() as Param
    let rtnVal: any = {}
    // console.log(param)
    const tenAmenBkgId = param.bkgId

    let loopId: string | undefined
    let tenAmenBkgRec = await TenAmenBkgModel.getById(c.env, tenAmenBkgId)
    if (tenAmenBkgRec == null) throw new Error('rec_not_found')

    if (param.status === 'paid') {
      if (tenAmenBkgRec.isPaid === 0) {
        // Set it paid
        await TenAmenBkgModel.updateById(c.env, tenAmenBkgId, {
          isPaid: 1,
          status: TenAmenBkgModel.EBookingStatus.ready,
        })

        let amenity = await AmenityModel.getById(c.env, tenAmenBkgRec.amenityId)
        if (amenity == null) throw new Error('internal error: amenity not found')

        // Create a Loop record to let the tenant knows
        let meta: LoopModel.MetaAmenityBkgConfirmed = {
          senderName: JSON.stringify({ en: 'admin' }),
          titleId: 'amenityBkgConfirmed',
          amenityId: tenAmenBkgRec.amenityId,
          amenityName: amenity.name,
          photo: amenity.photo,
          totalFee: tenAmenBkgRec.totalFee,
          date: tenAmenBkgRec.date,
          bookingId: tenAmenBkgRec.id!,
          bookingNo: tenAmenBkgRec.bookingNo,
          status: 'confirmed',
          slots: tenAmenBkgRec.timeSlots ? JSON.parse(tenAmenBkgRec.timeSlots) : undefined,
          isPaid: true
        }
        let loop: LoopModel.ILoop = {
          tenantId: tenAmenBkgRec.tenantId,
          type: LoopModel.ELoopType.amenBkg,
          title: JSON.stringify({ en: 'Amenity Booking Confirmed' }),
          meta: JSON.stringify(meta),
        }
        let newRec = await LoopModel.create(c.env, loop)
        if (!newRec) throw new Error(`Error creating loop record`)
        loopId = newRec.id
        rtnVal = {
          updated: true,
          loopId
        }
      }
    } else if (param.status === 'unpaid') {
      if (tenAmenBkgRec.isPaid === 1) {
        // Set it unpaid
        await TenAmenBkgModel.updateById(c.env, tenAmenBkgId, {
          isPaid: 0,
          status: TenAmenBkgModel.EBookingStatus.pending,
        })
        rtnVal = {
          updated: true,
          loopId
        }
      }
    } else if (param.status === 'cancelled') {
      if (tenAmenBkgRec.isPaid === 0) {
        // Set it cancelled
        await TenAmenBkgModel.updateById(c.env, tenAmenBkgId, {
          status: TenAmenBkgModel.EBookingStatus.cancelled,
        })

        let amenity = await AmenityModel.getById(c.env, tenAmenBkgRec.amenityId)
        if (amenity == null) throw new Error('internal error: amenity not found')

        // Create a Loop record to let the tenant knows
        let meta: LoopModel.MetaAmenityBkgCancelled = {
          senderName: JSON.stringify({ en: 'admin' }),
          titleId: 'amenityBkgCancelled',
          amenityId: tenAmenBkgRec.amenityId,
          amenityName: amenity.name,
          photo: amenity.photo!,
          totalFee: tenAmenBkgRec.totalFee!,
          date: tenAmenBkgRec.date,
          bookingId: tenAmenBkgRec.id!,
          bookingNo: tenAmenBkgRec.bookingNo,
          status: 'cancelled',
          slots: tenAmenBkgRec.timeSlots ? JSON.parse(tenAmenBkgRec.timeSlots) : undefined,
        }
        let loop: LoopModel.ILoop = {
          tenantId: tenAmenBkgRec.tenantId,
          type: LoopModel.ELoopType.amenBkg,
          title: JSON.stringify({ en: 'Amenity Booking Cancelled' }),
          meta: JSON.stringify(meta),
        }
        let newRec = await LoopModel.create(c.env, loop)
        if (!newRec) throw new Error(`Error creating loop record`)
        loopId = newRec.id
        rtnVal = {
          updated: true,
          loopId
        }
      }
    } else {
      throw new Error(`Unhandled booking status: ${param.status}`)
    }

    return c.json({ data: rtnVal })
  } catch (ex: any) {
    console.error(ex)
    // return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
    return c.json({ error: ex.message })
  }
})

userLoggedInApi.post('/_deleteOneTenant', async (c) => {
  Util.logCurLine(getCurrentLine())

  type Param = { tenantId: string }

  try {
    const userId: string = c.get('userId')
    const param = await c.req.json() as Param
    let resp = await TenantModel.deleteById(c.env, userId, param.tenantId)
    return c.json({
      data: {
        success: resp
      }
    })
  } catch (ex: any) {
    console.log(ex)
    // return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
    return c.json({ error: ex.message })
  }
})

userLoggedInApi.post('/noticePushNotifyToTenants', async (c) => {
  Util.logCurLine(getCurrentLine())

  type Param = { noticeId: string }

  try {
    const userId: string = c.get('userId')
    const param = await c.req.json() as Param
    let notice = await NoticeModel.getById(c.env, userId, param.noticeId)
    if (notice == null) throw new Error(`record_not_found`)
    let result = await NoticeModel.sendNoticeToAudiences(c.env, notice)
    return c.json({
      data: {
        success: result
      }
    })
  } catch (ex: any) {
    console.log(ex)
    // return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
    return c.json({ error: ex.message })
  }
})

export { userLoggedInApi }
