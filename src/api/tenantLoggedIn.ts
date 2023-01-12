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
    console.log('EXCEPTION!!!')
    console.log((ex as Error).stack)
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
    console.log('EXCEPTION!!!')
    console.log((ex as Error).stack)
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
    // console.log(param)

    let crit: string | undefined
    if (param.excludeIDs && param.excludeIDs.length > 0) {
      // Make id array string to SQL id string array
      let excludeIDs: Array<string> = param.excludeIDs.map(e => `'${e}'`)
      let ids = excludeIDs.join(',')
      crit = `id NOT IN (${ids})`
    }
    const records = await LoopModel.getAll(c.env, tenantId, crit) as [LoopModel.ILoop]
    return c.json({
      data: records
    })
  } catch (ex) {
    console.log('EXCEPTION!!!')
    console.log((ex as Error).stack)
    return c.json({ error: (ex as Error).message })
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
    console.log('EXCEPTION!!!')
    console.log((ex as Error).stack)
    return c.json({ error: (ex as Error).message })
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
    console.log('EXCEPTION!!!')
    console.log((ex as Error).stack)
    return c.json({ error: (ex as Error).message })
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
    console.log('EXCEPTION!!!')
    console.log((ex as Error).stack)
    return c.json({ error: (ex as Error).message })
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
    console.log('EXCEPTION!!!')
    console.log((ex as Error).stack)
    return c.json({ error: (ex as Error).message })
  }
})

tenantLoggedInApi.get('/getBookableAmenities', async (c) => {
  try {
    let userId = c.get('userId') as string

    let crit = `status='open'`
    const records = await AmenityModel.getAll(c.env, userId, crit) as [AmenityModel.IAmenity]
    return c.json({
      data: records
    })
  } catch (ex) {
    console.log('EXCEPTION!!!')
    console.log((ex as Error).stack)
    return c.json({ error: (ex as Error).message })
  }
})

tenantLoggedInApi.post('/getAmenityBookingsByDate', async (c) => {
  type Param = {
    date: string
    amenity: string
    times?: Array<string>
  }

  try {
    let userId = c.get('userId') as string
    let param = await c.req.json() as Param
    // console.log(param)

    let fields = `id,dateCreated,tenantId,amenityId,bookingNo,bookingTimeBasic,date,isPaid,timeSlots,totalFee`
    let crit = `status<>'expired' AND date='${param.date}' AND amenityId='${param.amenity}'`
    const records = await TenAmenBkgModel.getAll(c.env, userId, crit, fields) as [TenAmenBkgModel.ITenantAmenityBooking]
    // console.log(records)

    let rtnVal: Array<TenAmenBkgModel.ITenantAmenityBooking> = []
    if (param.times == null) {
      rtnVal = records
    } else {
      for (let i = 0; i < records.length; i++) {
        let rec = records[i]
        if (rec.timeSlots != null) {
          let timeSlots = JSON.parse(rec.timeSlots)
          console.log('timeslots', timeSlots)
          for (let j = 0; j < timeSlots.length; j++) {
            let ts: { name: string | null, from: string, to: string } = timeSlots[j]
            if (param.times.includes(ts.from)) {
              rtnVal.push(rec)
            }
          }
        }
      }
    }

    return c.json({
      data: rtnVal
    })
  } catch (ex) {
    console.log('EXCEPTION!!!')
    console.log((ex as Error).stack)
    return c.json({ error: (ex as Error).message })
  }
})

tenantLoggedInApi.post('/saveAmenityBooking', async (c) => {
  type Param = {
    tenantId: string
    amenityId: string
    amenityName: string
    amenityPhoto: string
    fee: number
    senderName: string
    bookingTimeBasic: string
    date: string
    title: string
    status: string
    totalFee: number
    currency: string
    isPaid: boolean
    autoCancelTime?: string
    localTime: string
    slots: [{
      name: string
      from: string
      to: string
    }]
    payBefore?: string
  }

  try {
    const now = new Date().toISOString()
    let userId = c.get('userId') as string
    let param = await c.req.json() as Param
    // console.log(param)
    if (!['pending', 'confirmed', 'cancelled'].includes(param.status)) throw new Error(`Invalid status: ${param.status}`)
    if (!param.slots.length) throw new Error(`TimeSlots cannot be empty`)

    // Get maximum bookingNo
    let resp = await c.env.DB.prepare(`SELECT max(bookingNo) AS val FROM TenantAmenityBookings WHERE userId=?`).bind(userId).first() as any
    let maxBkgNo = resp.val

    // Create TenantAmenityBookings record
    let tenAmenBkgRec: TenAmenBkgModel.ITenantAmenityBooking = {
      id: nanoid(),
      userId: userId,
      dateCreated: now,
      tenantId: param.tenantId,
      amenityId: param.amenityId,
      bookingNo: maxBkgNo + 1,
      bookingTimeBasic: param.bookingTimeBasic as TenAmenBkgModel.EBookingTimeBasic,
      date: param.date,
      status: param.status as TenAmenBkgModel.EBookingStatus,
      totalFee: param.totalFee,
      currency: param.currency,
      isPaid: param.isPaid ? 1 : 0,
      autoCancelTime: param.autoCancelTime,
      timeSlots: JSON.stringify(param.slots),
    }
    resp = await TenAmenBkgModel.create(c.env, userId, tenAmenBkgRec)
    console.log(resp)

    // Create Loop record
    let loopMeta: LoopModel.MetaNewAmenityBooking = {
      titleId: 'newAmenityBooking', // see tenantApp->LOOP_TITLE_??? constants.dart
      amenityId: param.amenityId,
      senderName: param.senderName,
      amenityName: param.amenityName,
      photo: param.amenityPhoto,
      fee: param.fee,
      date: param.date,
      bookingId: tenAmenBkgRec.id,
      bookingNo: maxBkgNo + 1,
      status: param.status,
      slots: param.slots as [LoopModel.ITimeSlot],
      payBefore: param.payBefore,
    }

    let loopRec: LoopModel.ILoop = {
      id: nanoid(),
      dateCreated: now,
      tenantId: param.tenantId,
      type: 'amenBkg' as LoopModel.ELoopType,
      title: param.title,
      meta: JSON.stringify(loopMeta),
    }
    resp = await LoopModel.create(c.env, loopRec)
    console.log(resp)

    return c.json({
      data: tenAmenBkgRec
    })
  } catch (ex) {
    console.log('EXCEPTION!!!')
    console.log((ex as Error).stack)
    return c.json({ error: (ex as Error).message }, 422)
  }
})

tenantLoggedInApi.post('/signout', async (c) => {
  type Param = {
    tenantId: string
  }

  try {
    let userId = c.get('userId') as string
    let param = await c.req.json() as Param

    // Nothing to do at this point.

    return c.json({
      data: {
        success: true
      }
    })
  } catch (ex) {
    console.log('EXCEPTION!!!')
    console.log((ex as Error).stack)
    return c.json({ error: (ex as Error).message }, 422)
  }
})

////////////////////////////////////////////////////////////////////////

export { tenantLoggedInApi }
