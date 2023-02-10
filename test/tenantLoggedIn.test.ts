/**
 * This is a test module for testing Tenant-Logged-In (src/api/tenantLoggedIn.ts) APIs. Make sure the backend is started before running tests.
 * To run tests, type: "npm test"
 * This testing is based on this repo: https://github.com/cloudflare/miniflare-typescript-esbuild-jest
 * 
 * Jest docs: https://jestjs.io/docs/28.x/getting-started
 */

import { describe, expect, test, jest } from '@jest/globals'
import fetch from 'node-fetch'
import moment from 'moment'

const HOST = 'http://localhost:3000'

const env = getMiniflareBindings()

describe('api/tenantLoggedIn testing', () => {

  const today = moment().format('YYYY-MM-DD')
  let _apiToken: string
  let _userId: string
  let _tenantToken: string
  let _tenantId: string
  let _unitId: string
  let _estate: any
  let _notice: any
  let _marketplace: any
  let _amenBkg: any
  let _amenity: any

  beforeEach((): void => {
    jest.setTimeout(15000)
  })

  test('Check environment variables', () => {
    expect(env.INITIAL_ADMIN_EMAIL).not.toBeUndefined()
    expect(env.INITIAL_ADMIN_PASSWORD).not.toBeUndefined()
  })

  // Obtain the _userId & _apiToken
  test('User authenication', async () => {
    const param = {
      email: env.INITIAL_ADMIN_EMAIL,
      password: env.INITIAL_ADMIN_PASSWORD
    }
    const res = await fetch(`${HOST}/api/nl/user/auth`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.data).not.toBeUndefined()
    expect(body.data.apiToken).not.toBeNull()
    _apiToken = body.data.apiToken // save the api token
    expect(body.data.userId).not.toBeNull()
    _userId = body.data.userId // save the user id
  })

  // Obtain the _tenantId & _tenantToken
  test('Tenant login', async () => {
    const param = {
      userId: _userId,
      mobileOrEmail: env.INITIAL_TENANT_EMAIL,
      password: env.INITIAL_TENANT_PASSWORD,
      fcmDeviceToken: null,
    }
    const res = await fetch(`${HOST}/api/nl/tenant/auth`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.data).not.toBeUndefined()
    expect(body.data.token).not.toBeNull()
    _tenantToken = body.data.token // save the tenant token
    expect(body.data.tenant).not.toBeUndefined()
    expect(body.data.tenant.id).not.toBeNull()
    _tenantId = body.data.tenant.id // save the tenant
  })

  // Obtain the _unitId
  test('Get a unit', async () => {
    const param = {
      userId: _userId,
    }
    const res = await fetch(`${HOST}/api/nl/_getOneUnit`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + env.DBINIT_SECRET
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.data).not.toBeUndefined()
    expect(body.data).toBeInstanceOf(Array)
    expect(body.data.length).toBeGreaterThan(0)
    _unitId = body.data[0].id // save the unit id
  })

  // Obtain the _estate
  test('Simulate scan QR-Code', async () => {
    const param = {
      url: `https://dummy.com/?a=${_userId}&b=${_unitId}`,
    }
    const res = await fetch(`${HOST}/api/nl/scanUnitQrcode`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.data).not.toBeUndefined()
    expect(body.data.success).toBe(true)
    expect(body.data.estate).not.toBeUndefined()
    expect(body.data.estate.id).not.toBeNull()
    _estate = body.data.estate
  })

  test('Get estate after logged in', async () => {
    const res = await fetch(`${HOST}/api/tl/getEstateAfterLoggedIn/${_estate.id}`, {
      headers: {
        'Authorization': 'Bearer ' + _tenantToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.data).not.toBeUndefined()
    expect(body.data.estate).not.toBeUndefined()
  })

  test('Get tenant homepage loop', async () => {
    let param = { excludeIDs: ['dummy'] }
    const res = await fetch(`${HOST}/api/tl/getHomepageLoops`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tenantToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
    expect(body.data).toBeInstanceOf(Array)
    let loop = body.data[0]
    expect(loop.id).not.toBeUndefined()
    expect(loop.dateCreated).not.toBeUndefined()
    expect(loop.tenantId).not.toBeUndefined()
    expect(loop.type).not.toBeUndefined()
    expect(loop.title).not.toBeUndefined()
    expect(loop.url).not.toBeUndefined()
    expect(loop.meta).not.toBeUndefined()
    expect(loop.tenantId).toBe(_tenantId)

    for (let i = 0; i < body.data.length; i++) {
      if (body.data[i].type === 'notice') {
        expect(body.data[i].meta).not.toBeUndefined()
        _notice = JSON.parse(body.data[i].meta)
        expect(_notice.noticeId).not.toBeNull()
      } else if (body.data[i].type === 'marketplace') {
        expect(body.data[i].meta).not.toBeUndefined()
        _marketplace = JSON.parse(body.data[i].meta)
        expect(_marketplace.adId).not.toBeNull()
      } else if (body.data[i].type === 'amenBkg') {
        expect(body.data[i].meta).not.toBeUndefined()
        _amenBkg = JSON.parse(body.data[i].meta)
        expect(_amenBkg.bookingId).not.toBeNull()
      }
    }
  })

  test('Get one estate (via other API)', async () => {
    const res = await fetch(`${HOST}/api/tl/getEstate/${_estate.id}`, {
      headers: {
        'Authorization': 'Bearer ' + _tenantToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.data).not.toBeUndefined()
    expect(body.data.id).not.toBeNull()
  })

  test('Get one notice', async () => {
    const res = await fetch(`${HOST}/api/tl/getNotice/${_notice.noticeId}`, {
      headers: {
        'Authorization': 'Bearer ' + _tenantToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
    expect(body.data.id).toBe(_notice.noticeId)
  })

  test('Get one marketplace', async () => {
    const res = await fetch(`${HOST}/api/tl/getMarketplace/${_marketplace.adId}`, {
      headers: {
        'Authorization': 'Bearer ' + _tenantToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
    expect(body.data.id).toBe(_marketplace.adId)
  })

  test('Get bookable amenities', async () => {
    const res = await fetch(`${HOST}/api/tl/getBookableAmenities`, {
      headers: {
        'Authorization': 'Bearer ' + _apiToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
    expect(body.data).toBeInstanceOf(Array)
    expect(body.data.length).toBeGreaterThan(0)
    for (let i = 0; i < body.data.length; i++) {
      let amenity = body.data[i]
      if (amenity.status === 'open') {
        _amenity = amenity
        break
      }
    }
    expect(_amenity).not.toBeUndefined() // All amenities status are not 'open'
  })

  test('Get one amenity', async () => {
    const res = await fetch(`${HOST}/api/tl/getAmenity/${_amenity.id}`, {
      headers: {
        'Authorization': 'Bearer ' + _apiToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
    expect(body.data.id).not.toBeNull()
    expect(body.data.id).toBe(_amenity.id)
  })

  test('Get tenant amenity booking by date', async () => {
    let param = {
      date: today,
      amenity: _amenity.id,
    }
    const res = await fetch(`${HOST}/api/tl/getAmenityBookingsByDate`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _apiToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
    expect(body.data.id).not.toBeNull()
  })

  test('Save a tenant amenity booking', async () => {
    let param = {
      tenantId: _tenantId,
      amenityId: _amenity.id,
      amenityName: _amenity.name,
      amenityPhoto: _amenity.photo,
      fee: _amenity.fee,
      senderName: '<unitTest>',
      bookingTimeBasic: _amenity.bookingTimeBasic,
      date: today,
      title: `{"en":"Reservation of ${JSON.parse(_amenity.name).en} on ${today}"}`,
      status: 'pending',
      totalFee: _amenity.fee,
      currency: _estate.currency,
      isPaid: false,
      autoCancelTime: _amenity.autoCancelHours != null ? moment().add(_amenity.autoCancelHours, 'hours').toISOString() : null,
      localTime: '23:00',
      slots: [{ name: null, from: '23:00', to: '23:30' }],
      payBefore: moment().add(1, 'days').toISOString(),
    }
    // console.log(param)
    const res = await fetch(`${HOST}/api/tl/saveAmenityBooking`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _apiToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
    expect(body.data.tenAmenBkg).not.toBeUndefined()
    expect(body.data.loop).not.toBeUndefined()

    // Delete the booking immediately
    const bkgId = body.data.tenAmenBkg.id
    const res2 = await fetch(`${HOST}/api/ul/tenantAmenityBookings/${bkgId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + _apiToken
      }
    })
    expect(res2).not.toBeNull()
    expect(res2.status).toBe(200)

    // Delete the loop record immediately
    const loopId = body.data.loop.id
    const res3 = await fetch(`${HOST}/api/ul/loops/${loopId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + _apiToken
      }
    })
    expect(res3).not.toBeNull()
    expect(res3.status).toBe(200)
  })

  test('Tenant sign out', async () => {
    let param = {
      tenantId: _tenantId,
    }
    const res = await fetch(`${HOST}/api/tl/signout`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tenantToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.data).not.toBeUndefined()
    expect(body.data.success).toBe(true)
  })

})