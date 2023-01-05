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

////////////////////////////////////////////////////////////////////////

export { tenantLoggedInApi }
