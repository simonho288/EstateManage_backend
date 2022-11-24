/**
 * Hono doc: https://honojs.dev/docs/api/context/
 */

import { Hono } from 'hono'
import { Bindings } from './bindings'
import { cors } from 'hono/cors'
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
api.use('/api/*', cors())

api.get('/', (c) => {
  return c.json({ message: 'Hello' })
})

// D1 Client API: https://developers.cloudflare.com/d1/client-api/
// api.get('/try_d1_patchdb', async (c) => {
//   let cmd = `
// DROP TABLE IF EXISTS Posts;
// CREATE TABLE Posts (PostID INT, Title TEXT, Body TEXT, PRIMARY KEY ('PostID'));
// INSERT INTO Posts (PostID, Title, Body) VALUES (1, 'Alfreds Futterkiste', 'Maria Anders'),(4, 'Around the Horn', 'Thomas Hardy'),(11, 'Bs Beverages', 'Victoria Ashworth'),(13, 'Bs Beverages', 'Random Name');
//   `;
//   const out = await c.env.DB.exec(cmd);
//   // console.log(results);
//   return c.json(out);
// })

// api.get('/create_sample_posts', async (c) => {
//   for (let i = 0; i < 10; ++i) {
//     await model.createPost(c.env.BLOG_EXAMPLE, {
//       title: `test title ${i + 1}`,
//       body: `test body ${i + 1}`,
//     })
//   }
//   return c.json({ ok: 'success' })
// })

// api.get('/create_sample_units', async (c) => {
//   return c.json({ ok: 'success' })
// })

import { createSampleOthers } from './data/sampleDb/createOthers'
api.get('/create_sample_others', async (c) => {
  try {
    let output = await createSampleOthers(c.env)
    return c.json(output)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

import { createSampleUnits } from './data/sampleDb/createUnits'
api.get('/create_sample_units', async (c) => {
  try {
    let output = await createSampleUnits(c.env)
    console.log(output)
    return c.json(output)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

////////////////////////////////////////////////////////////////////////

api.get('/users/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await UserModel.getById(c.env, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.get('/users', async (c) => {
  try {
    const { fields } = c.req.query()
    const records = await UserModel.getAll(c.env, fields)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/users', async (c) => {
  try {
    const param = await c.req.json()
    const newRec = await UserModel.create(c.env, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/users/:id', async (c) => {
  // const id = c.req.param('id')
  let result = await UserModel.updateById(c.env, c.req.param('id'), await c.req.json())
  return c.json({ ok: result })
})

api.delete('/users/:id', async (c) => {
  const result = await UserModel.deleteById(c.env, c.req.param('id'))
  return c.json({ ok: result })
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
    const { userId, fields } = c.req.query()
    const records = await AmenityModel.getAll(c.env, userId, fields)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/amenities', async (c) => {
  try {
    const param = await c.req.json()
    const newRec = await AmenityModel.create(c.env, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/amenities/:id', async (c) => {
  // const id = c.req.param('id')
  let result = await AmenityModel.updateById(c.env, c.req.param('id'), await c.req.json())
  return c.json({ ok: result })
})

api.delete('/amenities/:id', async (c) => {
  const result = await AmenityModel.deleteById(c.env, c.req.param('id'))
  return c.json({ ok: result })
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
    const { userId, fields } = c.req.query()
    const records = await EstateModel.getAll(c.env, userId, fields)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/estates', async (c) => {
  try {
    const param = await c.req.json()
    const newRec = await EstateModel.create(c.env, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/estates/:id', async (c) => {
  // const id = c.req.param('id')
  let result = await EstateModel.updateById(c.env, c.req.param('id'), await c.req.json())
  return c.json({ ok: result })
})

api.delete('/estates/:id', async (c) => {
  const result = await EstateModel.deleteById(c.env, c.req.param('id'))
  return c.json({ ok: result })
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
    const { userId, fields } = c.req.query()
    const records = await FolderModel.getAll(c.env, userId, fields)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/folders', async (c) => {
  try {
    const param = await c.req.json()
    const newRec = await FolderModel.create(c.env, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/folders/:id', async (c) => {
  // const id = c.req.param('id')
  let result = await FolderModel.updateById(c.env, c.req.param('id'), await c.req.json())
  return c.json({ ok: result })
})

api.delete('/folders/:id', async (c) => {
  const result = await FolderModel.deleteById(c.env, c.req.param('id'))
  return c.json({ ok: result })
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
    const { userId, fields } = c.req.query()
    const records = await LoopModel.getAll(c.env, userId, fields)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/loops', async (c) => {
  try {
    const param = await c.req.json()
    const newRec = await LoopModel.create(c.env, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/loops/:id', async (c) => {
  // const id = c.req.param('id')
  let result = await LoopModel.updateById(c.env, c.req.param('id'), await c.req.json())
  return c.json({ ok: result })
})

api.delete('/loops/:id', async (c) => {
  const result = await LoopModel.deleteById(c.env, c.req.param('id'))
  return c.json({ ok: result })
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
    const { userId, fields } = c.req.query()
    const records = await MarketplaceModel.getAll(c.env, userId, fields)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/marketplaces', async (c) => {
  try {
    const param = await c.req.json()
    const newRec = await MarketplaceModel.create(c.env, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/marketplaces/:id', async (c) => {
  // const id = c.req.param('id')
  let result = await MarketplaceModel.updateById(c.env, c.req.param('id'), await c.req.json())
  return c.json({ ok: result })
})

api.delete('/marketplaces/:id', async (c) => {
  const result = await MarketplaceModel.deleteById(c.env, c.req.param('id'))
  return c.json({ ok: result })
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
    const { userId, fields } = c.req.query()
    const records = await NoticeModel.getAll(c.env, userId, fields)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/notices', async (c) => {
  try {
    const param = await c.req.json()
    const newRec = await NoticeModel.create(c.env, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/notices/:id', async (c) => {
  // const id = c.req.param('id')
  let result = await NoticeModel.updateById(c.env, c.req.param('id'), await c.req.json())
  return c.json({ ok: result })
})

api.delete('/notices/:id', async (c) => {
  const result = await NoticeModel.deleteById(c.env, c.req.param('id'))
  return c.json({ ok: result })
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
    const { userId, fields } = c.req.query()
    const records = await SubscriptionModel.getAll(c.env, userId, fields)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/subscriptions', async (c) => {
  try {
    const param = await c.req.json()
    const newRec = await SubscriptionModel.create(c.env, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/subscriptions/:id', async (c) => {
  // const id = c.req.param('id')
  let result = await SubscriptionModel.updateById(c.env, c.req.param('id'), await c.req.json())
  return c.json({ ok: result })
})

api.delete('/subscriptions/:id', async (c) => {
  const result = await SubscriptionModel.deleteById(c.env, c.req.param('id'))
  return c.json({ ok: result })
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
    const { userId, fields } = c.req.query()
    const records = await TenAmenBkgModel.getAll(c.env, userId, fields)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/tenantAmenityBookings', async (c) => {
  try {
    const param = await c.req.json()
    const newRec = await TenAmenBkgModel.create(c.env, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/tenantAmenityBookings/:id', async (c) => {
  // const id = c.req.param('id')
  let result = await TenAmenBkgModel.updateById(c.env, c.req.param('id'), await c.req.json())
  return c.json({ ok: result })
})

api.delete('/tenantAmenityBookings/:id', async (c) => {
  const result = await TenAmenBkgModel.deleteById(c.env, c.req.param('id'))
  return c.json({ ok: result })
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
    const { userId, fields } = c.req.query()
    const records = await TenantModel.getAll(c.env, userId, fields)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/tenants', async (c) => {
  try {
    const param = await c.req.json()
    const newRec = await TenantModel.create(c.env, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/tenants/:id', async (c) => {
  // const id = c.req.param('id')
  let result = await TenantModel.updateById(c.env, c.req.param('id'), await c.req.json())
  return c.json({ ok: result })
})

api.delete('/tenants/:id', async (c) => {
  const result = await TenantModel.deleteById(c.env, c.req.param('id'))
  return c.json({ ok: result })
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
    const { userId, crit, fields, sort } = c.req.query()
    const records = await UnitModel.getAll(c.env, userId, crit, fields, sort)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/units', async (c) => {
  try {
    const param = await c.req.json()
    const newRec = await UnitModel.create(c.env, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/units/:id', async (c) => {
  // const id = c.req.param('id')
  let result = await UnitModel.updateById(c.env, c.req.param('id'), await c.req.json())
  return c.json({ ok: result })
})

api.delete('/units/:id', async (c) => {
  const result = await UnitModel.deleteById(c.env, c.req.param('id'))
  return c.json({ ok: result })
})

// api.fire()
// export default app
export { api }
// export default api
