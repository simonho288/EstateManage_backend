/**
 * Before access the API, must perform user authenicate before. See /user/auth
 * When authenciate successful, a JWT returns. The JWT contains userId
 * & expiry (1 day of JWT effective). All below API needs the userId
 * 
 * JWT implementation: https://github.com/tsndr/cloudflare-worker-jwt
 */

// import { Env } from '@/bindings'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Bindings } from '@/bindings'
import jwt from '@tsndr/cloudflare-worker-jwt'
// import { cors } from 'hono/cors'
// import { jwt } from 'hono/jwt'
// import { bearerAuth } from 'hono/bearer-auth'
import * as UserModel from './models/user'
import * as AmenityModel from './models/amenity'
import * as EstateModel from './models/estate'
import * as FolderModel from './models/folder'
import * as LoopModel from './models/loop'
import * as MarketplaceModel from './models/marketplace'
import * as NoticeModel from './models/notice'
import * as SubscriptionModel from './models/subscription'
import * as TenAmenBkgModel from './models/tenAmenBkg'
import * as TenantModel from './models/tenant'
import * as UnitModel from './models/unit'

const api = new Hono<{ Bindings: Bindings }>()
api.use('*', cors())

// JWT middleware: Must be called /auth/login to obtain a JWT
api.use('/*', async (c, next) => {
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

api.get('/', (c) => {
  let userId = c.get('userId')
  console.log(userId)
  return c.json({ userId: userId })
})

////////////////////////////////////////////////////////////////////////

api.get('/users/:id', async (c) => {
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

api.get('/users', async (c) => {
  try {
    const userId: string = c.get('userId') // The userId is encrypted inside the JWT
    const { crit, fields, sort } = c.req.query()
    const records = await UserModel.getAll(c.env, userId, crit, fields, sort)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/users', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await UserModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/users/:id', async (c) => {
  try {
    const userId: string = c.get('userId')
    const id = c.req.param('id')
    let result = await UserModel.updateById(c.env, userId, id, await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.delete('/users/:id', async (c) => {
  try {
    const userId: string = c.get('userId')
    const id = c.req.param('id')
    const result = await UserModel.deleteById(c.env, userId, id)
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.get('/amenities/:id', async (c) => {
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

api.get('/amenities', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort } = c.req.query()
    const records = await AmenityModel.getAll(c.env, userId, crit, fields, sort)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/amenities', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await AmenityModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/amenities/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await AmenityModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.delete('/amenities/:id', async (c) => {
  try {
    const result = await AmenityModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.get('/estates/:id', async (c) => {
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

api.get('/estates', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort } = c.req.query()
    const records = await EstateModel.getAll(c.env, userId, crit, fields, sort)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/estates', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await EstateModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/estates/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await EstateModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.delete('/estates/:id', async (c) => {
  try {
    const result = await EstateModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.get('/folders/:id', async (c) => {
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

api.get('/folders', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort } = c.req.query()
    const records = await FolderModel.getAll(c.env, userId, crit, fields, sort)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/folders', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await FolderModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/folders/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await FolderModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.delete('/folders/:id', async (c) => {
  try {
    const result = await FolderModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.get('/loops/:id', async (c) => {
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

api.get('/loops', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort } = c.req.query()
    const records = await LoopModel.getAll(c.env, userId, crit, fields, sort)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/loops', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await LoopModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/loops/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await LoopModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.delete('/loops/:id', async (c) => {
  try {
    const result = await LoopModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.get('/marketplaces/:id', async (c) => {
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

api.get('/marketplaces', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort } = c.req.query()
    const records = await MarketplaceModel.getAll(c.env, userId, crit, fields, sort)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/marketplaces', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await MarketplaceModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/marketplaces/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await MarketplaceModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.delete('/marketplaces/:id', async (c) => {
  try {
    const result = await MarketplaceModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.get('/notices/:id', async (c) => {
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

api.get('/notices', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort } = c.req.query()
    const records = await NoticeModel.getAll(c.env, userId, crit, fields, sort)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/notices', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await NoticeModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/notices/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await NoticeModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.delete('/notices/:id', async (c) => {
  try {
    const result = await NoticeModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.get('/subscriptions/:id', async (c) => {
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

api.get('/subscriptions', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort } = c.req.query()
    const records = await SubscriptionModel.getAll(c.env, userId, crit, fields, sort)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/subscriptions', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await SubscriptionModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/subscriptions/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await SubscriptionModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.delete('/subscriptions/:id', async (c) => {
  try {
    const result = await SubscriptionModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.get('/tenantAmenityBookings/:id', async (c) => {
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

api.get('/tenantAmenityBookings', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort } = c.req.query()
    const records = await TenAmenBkgModel.getAll(c.env, userId, crit, fields, sort)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/tenantAmenityBookings', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await TenAmenBkgModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/tenantAmenityBookings/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await TenAmenBkgModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.delete('/tenantAmenityBookings/:id', async (c) => {
  try {
    const result = await TenAmenBkgModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.get('/tenants/:id', async (c) => {
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

api.get('/tenants', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort } = c.req.query()
    const records = await TenantModel.getAll(c.env, userId, crit, fields, sort)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/tenants', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await TenantModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/tenants/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await TenantModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.delete('/tenants/:id', async (c) => {
  try {
    const result = await TenantModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.get('/units/:id', async (c) => {
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

api.get('/units', async (c) => {
  try {
    const userId: string = c.get('userId')
    const { crit, fields, sort } = c.req.query()
    const records = await UnitModel.getAll(c.env, userId, crit, fields, sort)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/units', async (c) => {
  try {
    const userId: string = c.get('userId')
    const param = await c.req.json()
    const newRec = await UnitModel.create(c.env, userId, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/units/:id', async (c) => {
  try {
    // const id = c.req.param('id')
    let result = await UnitModel.updateById(c.env, c.req.param('id'), await c.req.json())
    return c.json({ ok: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.delete('/units/:id', async (c) => {
  try {
    const result = await UnitModel.deleteById(c.env, c.req.param('id'))
    return c.json({ result: result })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

export { api }
