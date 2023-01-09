/**
 * When call the APIs of this module. The client must has JWT token.
 * The JWT contains userId  & expiry (1 day of JWT effective).
 * All below API needs the userId
 * 
 * JWT implementation: https://github.com/tsndr/cloudflare-worker-jwt
 */

import { Hono } from 'hono'
import { Bindings } from '@/bindings'
import { nanoid } from 'nanoid'
import jwt from '@tsndr/cloudflare-worker-jwt'
/*
import {
  S3Client,
  ListBucketsCommand,
  ListObjectsV2Command,
  GetObjectCommand,
  PutObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
*/

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

const tenantLoggedInApi = new Hono<{ Bindings: Bindings }>()

// JWT middleware
tenantLoggedInApi.use('/*', async (c, next) => {
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
    // console.log('payload', payload)
    c.set('tenantId', payload.tenantId)
    c.set('userId', payload.userId)

    await next()
  } catch (ex) {
    return c.text((ex as Error).message, 401)
  }
})

tenantLoggedInApi.get('/', (c) => {
  let tenantId = c.get('tenantId')
  console.log(tenantId)
  return c.json({ tenantId: tenantId })
})

tenantLoggedInApi.get('/getEstateAfterLoggedIn/:estateId', async (c) => {
  let tenantId = c.get('tenantId')
  try {
    const { estateId } = c.req.param()
    const estate = await EstateModel.getById(c.env, estateId, 'tenantApp') as EstateModel.IEstate
    return c.json({
      data: {
        estate: estate.tenantApp,
      }
    })
  } catch (ex) {
    console.log('Exception:')
    console.log((ex as any).message)
    return c.json({ error: (ex as any).message })
  }
})

tenantLoggedInApi.post('/getHomepageLoops', async (c) => {
  type Param = {
    excludeIDs: [string],
  }
  try {
    let tenantId = c.get('tenantId') as string
    let param = await c.req.json() as Param
    console.log(param)

    let crit: string | undefined
    if (param.excludeIDs && param.excludeIDs.length > 0) {
      let ids = param.excludeIDs.join(',')
      crit = `id NOT IN (${ids})`
    }
    const records = await LoopModel.getAll(c.env, tenantId, crit) as [LoopModel.ILoop]
    return c.json({
      data: records
    })
  } catch (ex) {
    console.log('Exception:')
    console.log((ex as any).message)
    return c.json({ error: (ex as any).message })
  }
})

tenantLoggedInApi.get('/getAmenity/:id', async (c) => {
  try {
    const { id } = c.req.param()
    const record = await AmenityModel.getById(c.env, id) as AmenityModel.IAmenity
    return c.json({
      data: record
    })
  } catch (ex) {
    console.log('Exception:')
    console.log((ex as any).message)
    return c.json({ error: (ex as any).message })
  }
})

tenantLoggedInApi.get('/getEstate/:id', async (c) => {
  console.log('/getEstate')
  try {
    const { id } = c.req.param()
    console.log('id', id)
    const record = await EstateModel.getById(c.env, id) as EstateModel.IEstate
    return c.json({
      data: record
    })
  } catch (ex) {
    console.log('Exception:')
    console.log((ex as any).message)
    return c.json({ error: (ex as any).message })
  }
})

tenantLoggedInApi.get('/getNotice/:id', async (c) => {
  try {
    const { id } = c.req.param()
    const record = await NoticeModel.getById(c.env, id) as NoticeModel.INotice
    return c.json({
      data: record
    })
  } catch (ex) {
    console.log('Exception:')
    console.log((ex as any).message)
    return c.json({ error: (ex as any).message })
  }
})

tenantLoggedInApi.get('/getMarketplace/:id', async (c) => {
  try {
    const { id } = c.req.param()
    const record = await MarketplaceModel.getById(c.env, id) as MarketplaceModel.IMarketplace
    return c.json({
      data: record
    })
  } catch (ex) {
    console.log('Exception:')
    console.log((ex as any).message)
    return c.json({ error: (ex as any).message })
  }
})

////////////////////////////////////////////////////////////////////////

export { tenantLoggedInApi }
