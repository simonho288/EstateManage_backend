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
import getCurrentLine from 'get-current-line'
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
    Util.logException(ex)
    return c.text((ex as Error).message, 401)
  }
})

tenantLoggedInApi.get('/', (c) => {
  Util.logCurLine(getCurrentLine())

  let tenantId = c.get('tenantId')
  // console.log(tenantId)
  return c.json({ tenantId: tenantId })
})

tenantLoggedInApi.get('/getTenantStatus', async (c) => {
  Util.logCurLine(getCurrentLine())

  let tenantId = c.get('tenantId') as string
  try {
    const rec = await TenantModel.getById(c.env, tenantId, 'status') as TenantModel.ITenant
    if (rec == null) throw new Error('Record not found')
    return c.json({
      data: {
        status: rec.status,
      }
    })
  } catch (ex) {
    Util.logException(ex)
    return c.json({ error: (ex as any).message })
  }
})

tenantLoggedInApi.get('/getEstateAfterLoggedIn/:estateId', async (c) => {
  Util.logCurLine(getCurrentLine())

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
    Util.logException(ex)
    return c.json({ error: (ex as any).message })
  }
})

tenantLoggedInApi.post('/getHomepageLoops', async (c) => {
  Util.logCurLine(getCurrentLine())

  type Param = { excludeIDs: [string] }

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
    Util.logException(ex)
    return c.json({ error: (ex as Error).message })
  }
})

tenantLoggedInApi.get('/getEstate/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const { id } = c.req.param()
    console.log('id', id)
    const record = await EstateModel.getById(c.env, id) as EstateModel.IEstate
    if (record) delete record.userId
    return c.json({
      data: record
    })
  } catch (ex) {
    Util.logException(ex)
    return c.json({ error: (ex as Error).message })
  }
})

tenantLoggedInApi.get('/getNotice/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const { id } = c.req.param()
    const record = await NoticeModel.getById(c.env, id) as NoticeModel.INotice
    if (record) delete record.userId
    return c.json({
      data: record
    })
  } catch (ex) {
    Util.logException(ex)
    return c.json({ error: (ex as Error).message })
  }
})

tenantLoggedInApi.get('/getMarketplace/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const { id } = c.req.param()
    const record = await MarketplaceModel.getById(c.env, id) as MarketplaceModel.IMarketplace
    if (record) delete record.userId
    return c.json({
      data: record
    })
  } catch (ex) {
    Util.logException(ex)
    return c.json({ error: (ex as Error).message })
  }
})

tenantLoggedInApi.get('/getBookableAmenities', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    let userId = c.get('userId') as string

    let crit = `status='open'`
    const records = await AmenityModel.getAll(c.env, userId, crit) as [AmenityModel.IAmenity]
    return c.json({
      data: records
    })
  } catch (ex) {
    Util.logException(ex)
    return c.json({ error: (ex as Error).message })
  }
})

tenantLoggedInApi.get('/getAmenity/:id', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    const { id } = c.req.param()
    const record = await AmenityModel.getById(c.env, id) as AmenityModel.IAmenity
    if (record) delete record.userId
    return c.json({
      data: record
    })
  } catch (ex) {
    Util.logException(ex)
    return c.json({ error: (ex as Error).message })
  }
})

tenantLoggedInApi.post('/getAmenityBookingsByDate', async (c) => {
  Util.logCurLine(getCurrentLine())

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
    Util.logException(ex)
    return c.json({ error: (ex as Error).message })
  }
})

tenantLoggedInApi.post('/saveAmenityBooking', async (c) => {
  Util.logCurLine(getCurrentLine())

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
    // console.log(resp)
    tenAmenBkgRec.id = resp.id

    // Create Loop record
    if (param.status != 'pending') throw new Error('The status of new tenAmenBkg must be pending')
    let loopMeta: LoopModel.MetaNewAmenityBooking = {
      titleId: 'newAmenityBooking', // see tenantApp->LOOP_TITLE_??? constants.dart
      amenityId: param.amenityId,
      senderName: param.senderName,
      amenityName: param.amenityName,
      photo: param.amenityPhoto,
      fee: param.fee,
      date: param.date,
      bookingId: tenAmenBkgRec.id!,
      bookingNo: maxBkgNo + 1,
      status: param.status,
      slots: param.slots as [LoopModel.ITimeSlot],
      payBefore: param.payBefore,
    }

    let loopRec: LoopModel.ILoop = {
      dateCreated: now,
      tenantId: param.tenantId,
      type: 'amenBkg' as LoopModel.ELoopType,
      title: param.title,
      meta: JSON.stringify(loopMeta),
    }
    resp = await LoopModel.create(c.env, loopRec)
    // console.log(resp)
    loopRec.id = resp.id

    return c.json({
      data: {
        tenAmenBkg: tenAmenBkgRec,
        loop: loopRec,
      }
    })
  } catch (ex) {
    Util.logException(ex)
    return c.json({ error: (ex as Error).message }, 422)
  }
})

tenantLoggedInApi.post('/signout', async (c) => {
  Util.logCurLine(getCurrentLine())

  try {
    let tenantId = c.get('tenantId') as string

    // Nothing to do at this point.

    return c.json({
      data: {
        success: true
      }
    })
  } catch (ex) {
    Util.logException(ex)
    return c.json({ error: (ex as Error).message }, 422)
  }
})

tenantLoggedInApi.post('/setPassword', async (c) => {
  type Param = {
    tenantId: string
    password: string // plain password string
  }

  try {
    let tenantId = c.get('tenantId') as string
    let param = await c.req.json() as Param

    if (param.tenantId == null) throw new Error('tenantId_is_required')
    if (param.password == null) throw new Error('password_is_required')
    let targetId = param.tenantId
    // console.log('targetId:', targetId)

    // Validate the access token
    const tenant = await TenantModel.getById(c.env, tenantId, 'id') as TenantModel.ITenant
    if (tenant == null) throw new Error('not_authorized')

    const rec = await TenantModel.getById(c.env, targetId, 'id') as TenantModel.ITenant
    if (rec == null) throw new Error('record_not_found')

    await TenantModel.updateById(c.env, targetId, {
      password: param.password
    })

    return c.json({
      data: {
        success: true
      }
    })
  } catch (ex) {
    Util.logException(ex)
    return c.json({ error: (ex as Error).message }, 422)
  }
})

tenantLoggedInApi.delete('/deleteTenant', async (c) => {
  type Param = {
    tenantId: string
  }

  try {
    let tenantId = c.get('tenantId') as string
    let param = await c.req.json() as Param
    if (param.tenantId == null) throw new Error('tenantId is required')

    // Validate the access token
    const tenant = await TenantModel.getById(c.env, tenantId, 'id,userId') as TenantModel.ITenant
    if (tenant == null || tenant.userId == null) throw new Error('not_authorized')

    const resp = await TenantModel.deleteById(c.env, tenant.userId, param.tenantId)
    // console.log('resp:', resp)

    return c.json({
      data: {
        success: resp
      }
    })
  } catch (ex) {
    Util.logException(ex)
    return c.json({ error: (ex as Error).message }, 422)
  }
})

tenantLoggedInApi.post('/getAllUnits', async (c) => {
  type Param = {
    type: string
  }

  try {
    let tenantId = c.get('tenantId') as string
    let param = await c.req.json() as Param
    if (param.type == null) throw new Error('type_is_required')
    if (!['res', 'car', 'shp'].includes(param.type)) throw new Error('invalid_type')

    // Validate the access token
    const tenant = await TenantModel.getById(c.env, tenantId, 'userId') as TenantModel.ITenant
    if (tenant == null || tenant.userId == null) throw new Error('not_authorized')

    // Get units by userId
    let crit = `type='${param.type}'`
    const resp = await UnitModel.getAll(c.env, tenant.userId, crit)

    return c.json({
      data: resp
    })
  } catch (ex) {
    Util.logException(ex)
    return c.json({ error: (ex as Error).message }, 422)
  }
})

tenantLoggedInApi.post('/getNotices', async (c) => {
  type Param = {
    type: string
    excludeIDs: Array<string> | undefined
  }

  try {
    let tenantId = c.get('tenantId') as string
    let param = await c.req.json() as Param
    if (param.type == null) throw new Error('type_is_required')
    if (!['res', 'car', 'shp'].includes(param.type)) throw new Error('invalid_type')

    // Validate the access token
    const tenant = await TenantModel.getById(c.env, tenantId, 'userId') as TenantModel.ITenant
    if (tenant == null || tenant.userId == null) throw new Error('not_authorized')

    // Get notices by userId
    let crit: string | undefined
    if (param.excludeIDs) {
      let ids = param.excludeIDs.map(e => `'${e}'`)
      crit = `ID NOT IN (${ids.join(',')})`
    }
    const resp = await NoticeModel.getAll(c.env, tenant.userId, crit)
    if (resp == null) throw new Error('no_units_defined')

    // Filter the notices
    let notices = [] as Array<NoticeModel.INotice>
    for (let i = 0; i < resp.length; i++) {
      let notice = resp[i] as NoticeModel.INotice
      if (notice.audiences != null) {
        let audience = JSON.parse(notice.audiences)
        // console.log(audience)
        if (param.type === 'res') {
          if (audience.residence != null) notices.push(notice)
        } else if (param.type === 'car') {
          if (audience.carpark != null) notices.push(notice)
        } else if (param.type === 'shp') {
          if (audience.shop != null) notices.push(notice)
        }
      }
    }

    return c.json({
      data: notices
    })
  } catch (ex) {
    Util.logException(ex)
    return c.json({ error: (ex as Error).message }, 422)
  }
})

tenantLoggedInApi.post('/getMarketplaces', async (c) => {
  type Param = {
    type: string
    excludeIDs: Array<string> | undefined
  }

  try {
    let tenantId = c.get('tenantId') as string
    let param = await c.req.json() as Param
    if (param.type == null) throw new Error('type_is_required')
    if (!['res', 'car', 'shp'].includes(param.type)) throw new Error('invalid_type')

    // Validate the access token
    const tenant = await TenantModel.getById(c.env, tenantId, 'userId') as TenantModel.ITenant
    if (tenant == null || tenant.userId == null) throw new Error('not_authorized')

    // Get notices by userId
    let crit: string | undefined
    if (param.excludeIDs) {
      let ids = param.excludeIDs.map(e => `'${e}'`)
      crit = `ID NOT IN (${ids.join(',')})`
    }
    const resp = await MarketplaceModel.getAll(c.env, tenant.userId, crit)
    if (resp == null) throw new Error('no_units_defined')

    // Filter the notices
    let notices = [] as Array<MarketplaceModel.IMarketplace>
    for (let i = 0; i < resp.length; i++) {
      let marketplace = resp[i] as MarketplaceModel.IMarketplace
      if (marketplace.audiences != null) {
        let audience = JSON.parse(marketplace.audiences)
        // console.log(audience)
        if (param.type === 'res') {
          if (audience.residence != null) notices.push(marketplace)
        } else if (param.type === 'car') {
          if (audience.carpark != null) notices.push(marketplace)
        } else if (param.type === 'shp') {
          if (audience.shop != null) notices.push(marketplace)
        }
      }
    }

    return c.json({
      data: notices
    })
  } catch (ex) {
    Util.logException(ex)
    return c.json({ error: (ex as Error).message }, 422)
  }
})

tenantLoggedInApi.post('/deleteTenantAmenityBkgs', async (c) => {
  type Param = {
    bkgIds: Array<string>
  }

  try {
    let tenantId = c.get('tenantId') as string
    let param = await c.req.json() as Param
    if (param.bkgIds == null) throw new Error('bkgIds not specified')
    if (param.bkgIds.length == 0) throw new Error('no_ids')

    // Get the tenant
    let tenant = await TenantModel.getById(c.env, tenantId, 'userId')
    if (tenant == null) throw new Error('tenant_not_found')

    // Validate the loop records are belong to the tenant
    let ids = param.bkgIds.map(e => `'${e}'`)
    let crit = `ID IN (${ids.join(',')})`
    let records = await TenAmenBkgModel.getAll(c.env, tenant.userId, crit, 'id')
    if (records == null) throw new Error('no_records_found')
    let validIds = records.map(e => e.id)
    for (let i = 0; i < param.bkgIds.length; ++i) {
      let id = param.bkgIds[i]
      if (!validIds.includes(id)) throw new Error(`id:'${id}' is not belong to the tenant`)
    }

    // Delete the records
    for (let i = 0; i < param.bkgIds.length; ++i) {
      let id = param.bkgIds[i]
      await TenAmenBkgModel.deleteById(c.env, id)
    }

    return c.json({
      data: { success: true }
    })
  } catch (ex) {
    Util.logException(ex)
    return c.json({ error: (ex as Error).message }, 422)
  }
})

tenantLoggedInApi.post('/deleteTenantLoops', async (c) => {
  type Param = {
    loopIds: Array<string>
  }

  try {
    let tenantId = c.get('tenantId') as string
    let param = await c.req.json() as Param
    if (param.loopIds == null) throw new Error('loopIds not specified')
    if (param.loopIds.length == 0) throw new Error('no_ids')

    // Validate the loop records are belong to the tenant
    let ids = param.loopIds.map(e => `'${e}'`)
    let crit = `ID IN (${ids.join(',')})`
    let records = await LoopModel.getAll(c.env, tenantId, crit, 'id')
    if (records == null) throw new Error('no_records_found')
    let validIds = records.map(e => e.id)
    for (let i = 0; i < param.loopIds.length; ++i) {
      let id = param.loopIds[i]
      if (!validIds.includes(id)) throw new Error(`id:'${id}' is not belong to the tenant`)
    }

    // Delete the records
    for (let i = 0; i < param.loopIds.length; ++i) {
      let id = param.loopIds[i]
      await LoopModel.deleteById(c.env, id)
    }

    return c.json({
      data: { success: true }
    })
  } catch (ex) {
    Util.logException(ex)
    return c.json({ error: (ex as Error).message }, 422)
  }
})

////////////////////////////////////////////////////////////////////////

export { tenantLoggedInApi }
