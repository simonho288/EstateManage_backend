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
    return c.text((ex as Error).message, 401)
  }
})

userLoggedInApi.get('/', (c) => {
  let userId = c.get('userId')
  console.log(userId)
  return c.json({ userId: userId })
})

////////////////////////////////////////////////////////////////////////

userLoggedInApi.get('/users/:id', async (c) => {
  try {
    const userId: string = c.get('userId') // The userId is encrypted inside the JWT
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await UserModel.getOne(c.env, userId, id, fields)
    return c.json({ data: record, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/users', async (c) => {
  try {
    const userId: string = c.get('userId') // The userId is encrypted inside the JWT
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    const records = await UserModel.getAll(c.env, userId, crit, fields, sort, pageno, pagesize)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/users', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await UserModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/users/:id', async (c) => {
  try {
    const userId: string = c.get('userId')
    const id = c.req.param('id')
    let result = await UserModel.updateById(c.env, userId, id, await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/users/:id', async (c) => {
  try {
    const userId: string = c.get('userId')
    const id = c.req.param('id')
    const result = await UserModel.deleteById(c.env, userId, id)
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/amenities/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await AmenityModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/amenities', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    const records = await AmenityModel.getAll(c.env, userId, crit, fields, sort, pageno, pagesize)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/amenities', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await AmenityModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/amenities/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await AmenityModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/amenities/:id', async (c) => {
  try {
    const result = await AmenityModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/estates/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await EstateModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/estates', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    const records = await EstateModel.getAll(c.env, userId, crit, fields, sort, pageno, pagesize)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/estates', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await EstateModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/estates/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await EstateModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/estates/:id', async (c) => {
  try {
    const result = await EstateModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/folders/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await FolderModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/folders', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    const records = await FolderModel.getAll(c.env, userId, crit, fields, sort, pageno, pagesize)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/folders', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await FolderModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/folders/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await FolderModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/folders/:id', async (c) => {
  try {
    const result = await FolderModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/loops/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await LoopModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/loops', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    const records = await LoopModel.getAll(c.env, userId, crit, fields, sort, pageno, pagesize)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/loops', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await LoopModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/loops/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await LoopModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/loops/:id', async (c) => {
  try {
    const result = await LoopModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/marketplaces/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await MarketplaceModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/marketplaces', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    const records = await MarketplaceModel.getAll(c.env, userId, crit, fields, sort, pageno, pagesize)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/marketplaces', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await MarketplaceModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/marketplaces/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await MarketplaceModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/marketplaces/:id', async (c) => {
  try {
    const result = await MarketplaceModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/notices/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await NoticeModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/notices', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    const records = await NoticeModel.getAll(c.env, userId, crit, fields, sort, pageno, pagesize)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/notices', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await NoticeModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/notices/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await NoticeModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/notices/:id', async (c) => {
  try {
    const result = await NoticeModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/subscriptions/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await SubscriptionModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/subscriptions', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    const records = await SubscriptionModel.getAll(c.env, userId, crit, fields, sort, pageno, pagesize)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/subscriptions', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await SubscriptionModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/subscriptions/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await SubscriptionModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/subscriptions/:id', async (c) => {
  try {
    const result = await SubscriptionModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/tenantAmenityBookings/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await TenAmenBkgModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/tenantAmenityBookings', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    const records = await TenAmenBkgModel.getAll(c.env, userId, crit, fields, sort, pageno, pagesize)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/tenantAmenityBookings', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await TenAmenBkgModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/tenantAmenityBookings/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await TenAmenBkgModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/tenantAmenityBookings/:id', async (c) => {
  try {
    const result = await TenAmenBkgModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/tenants/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await TenantModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/tenants', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    const records = await TenantModel.getAll(c.env, userId, crit, fields, sort, pageno, pagesize)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/tenants', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await TenantModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/tenants/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await TenantModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/tenants/:id', async (c) => {
  try {
    const result = await TenantModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/units/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await UnitModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/units', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort, pageno, pagesize } = c.req.query()
    const records = await UnitModel.getAll(c.env, userId, crit, fields, sort, pageno, pagesize)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/units', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await UnitModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.put('/units/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await UnitModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.delete('/units/:id', async (c) => {
  try {
    const result = await UnitModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/queryDatabase', async (c) => {
  const userId: string = c.get('userId')
  const param = await c.req.json() as any
  const sql = param.sql
  try {
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
  const userId: string = c.get('userId')
  const param = await c.req.json() as any
  const sql = param.sql
  try {
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
  const userId: string = c.get('userId')
  const start = c.req.query('start')
  try {
    let sql = `SELECT TenantAmenityBookings.*, Tenants.name AS TenantName, Tenants.phone AS TenantPhone, Tenants.email AS TenantEmail, Amenities.name AS AmenityName, Units.type AS UnitType, Units.block AS UnitBlock, Units.floor AS UnitFloor, Units.number AS UnitNumber FROM TenantAmenityBookings INNER JOIN Tenants ON TenantAmenityBookings.tenantId = Tenants.id INNER JOIN Amenities ON TenantAmenityBookings.amenityId = Amenities.id INNER JOIN Units ON Tenants.unitId = Units.id WHERE TenantAmenityBookings.userId=? AND date >= ?`
    const stmt = c.env.DB.prepare(sql).bind(userId, start)
    const resp = await stmt.all()
    if (resp.error != null) throw new Error(resp.error)
    return c.json({
      data: resp.results
    })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.post('/uploadToReplaceUnits', async (c) => {
  const userId: string = c.get('userId')
  const unitType = c.req.query('ut')
  try {
    const units = await c.req.json() as Array<Array<string>>
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
  const userId: string = c.get('userId')
  const id: string = c.req.param('id')
  try {
    if (userId != id) throw new Error('Unauthorized')
    const param = await c.req.json() as any
    if (param.field == null) throw new Error(`No field provided`)
    if (param.value == null) throw new Error(`No value provided`)

    let result = await UserModel.updateProperty(c.env, userId, param.field, param.value)
    return c.json({ ok: result })
  } catch (ex: any) {
    console.error(ex)
    // return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
    return c.json({ error: ex.message })
  }
})

userLoggedInApi.post('/genUserConfirmCode', async (c) => {
  try {
    const userId: string = c.get('userId')
    const body = await c.req.json() as any
    if (userId != body.userId) throw new Error('Unauthorized')
    let code = Util.genRandomCode6Digits()
    console.log('code:', code)
    const emailContentMkup = `
<h1>Email Change Confirmation Code</h1>
<h2>${code}</h2>
<p style="font-size: 16px">This email is sent to you because you've requested the email changes. Please enter the code to the prompt on the screen.</p>
<p style="font-size: 16px; color: #666"><i>This email is sent from cloud server. Please don't reply</i></p>

    `
    await Util.sendMailgun(c.env.MAILGUN_API_URL, c.env.MAILGUN_API_KEY, {
      from: c.env.SYSTEM_EMAIL_SENDER,
      to: body.email,
      subject: 'EstateMan - Email Change Confirmation Code',
      text: Constant.EMAIL_BODY_TEXT,
      html: emailContentMkup,
    })
    return c.json({ data: code })
  } catch (ex: any) {
    console.log(ex)
    // return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
    return c.json({ error: ex.message })
  }
})

userLoggedInApi.get('/getDashboardData', async (c) => {
  try {
    const userId: string = c.get('userId')
    let rtnVal = {} as any
    let resp: any
    let db = c.env.DB

    // First, get the estate
    resp = await db.prepare(`SELECT * FROM Estates WHERE userId=?`).bind(userId).first() as any
    let estateRec = resp
    // const today = Util.getDateStringByTzofs(Date.now(), estateRec.timezone)
    const today = '2022-11-19'

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

    // Get amenity bookings today
    resp = await db.prepare(`SELECT TenantAmenityBookings.id AS id,Amenities.name AS AmenityName,Tenants.name as TenantName,TenantAmenityBookings.title,TenantAmenityBookings.date,TenantAmenityBookings.timeSlots FROM TenantAmenityBookings INNER JOIN Tenants ON TenantAmenityBookings.tenantId=Tenants.id INNER JOIN Amenities ON Amenities.id=TenantAmenityBookings.amenityId WHERE TenantAmenityBookings.userId=? AND TenantAmenityBookings.date=?`).bind(userId, today).all()
    console.log(resp)
    rtnVal.amenityBookings = resp.results

    return c.json({ data: rtnVal })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

userLoggedInApi.get('/getAllTenentsWithUnits', async (c) => {
  try {
    const userId: string = c.get('userId')
    let rtnVal = {} as any
    let resp: any
    let db = c.env.DB

    resp = await db.prepare(`SELECT Tenants.id AS TenantId,Tenants.name,Tenants.phone,Tenants.email,Tenants.status,TenantUnits.role,Units.id AS UnitId,Units.block,Units.floor,Units.number,Units.type FROM Tenants INNER JOIN TenantUnits ON Tenants.id=TenantUnits.tenantId INNER JOIN Units ON Units.id=TenantUnits.unitId WHERE Tenants.userId=?`).bind(userId).all() as any

    console.log(resp.results[0])

    return c.json({ data: resp.results })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

export { userLoggedInApi }
