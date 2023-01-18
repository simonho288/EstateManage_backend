/**
 * This is a test module for testing User-Logged-In (src/api/userLoggedIn.ts) APIs. Make sure the backend is started before running tests.
 * To run tests, type: "npm test"
 * This testing is based on this repo: https://github.com/cloudflare/miniflare-typescript-esbuild-jest
 * 
 * Jest docs: https://jestjs.io/docs/28.x/getting-started
 */

import { describe, expect, test } from '@jest/globals'
import fetch from 'node-fetch'
import moment from 'moment'

const HOST = 'http://localhost:3000'

const env = getMiniflareBindings()

describe('api/userLoggedIn testing', () => {

  const today = moment().format('YYYY-MM-DD')
  let _adminUserToken: string
  let _adminUserId: string
  let _tempUserId: string
  let _tempUserToken: string
  let _tenantToken: string
  let _tenantId: string
  let _amenityId: string
  let _estateId: string
  let _folderId: string
  let _marketplaceId: string
  let _noticeId: string
  let _tenAmenBkgId: string
  let _unitId: string

  test('Check environment variables', () => {
    expect(env.INITIAL_ADMIN_EMAIL).not.toBeUndefined()
    expect(env.INITIAL_ADMIN_PASSWORD).not.toBeUndefined()
  })

  /////////////////////////////////////// Initialization //////////////////////////////////

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
    _adminUserToken = body.data.apiToken // save the api token
    expect(body.data.userId).not.toBeNull()
    _adminUserId = body.data.userId // save the user id
  })

  // Create a temporary user
  test('POST /users', async () => {
    const param = {
      name: '<Dummy name>',
      language: 'en',
      email: 'dummy@email.com',
      password: 'password',
      tel: null,
      role: 'member',
      isValid: 1,
      meta: "{}",
    }
    const res = await fetch(`${HOST}/api/ul/users`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _adminUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    _tempUserId = body.data.id // save the new id
  })

  // Obtain the temp user token
  test('User authenication', async () => {
    const param = {
      email: 'dummy@email.com',
      password: 'password',
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
    _tempUserToken = body.data.apiToken // save the api token
    expect(body.data.userId).not.toBeNull()
    expect(body.data.userId).toBe(_tempUserId)
  })

  test('POST /tenants: Create a temporary tenant', async () => {
    const param = {
      name: '<Tenant B>',
      password: 'password',
      phone: '12223334444',
      email: 'dummy@email.com',
      status: 0,
      fcmDeviceToken: null,
      lastSignin: null,
      recType: 0,
      meta: '{}'
    }
    const res = await fetch(`${HOST}/api/ul/tenants`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    _tenantId = body.data.id // save the new id
  })

  test('POST /amenities: Create a temporary amenity', async () => {
    const param = {
      name: '{"en":"<Dummy Amenity>"}',
      details: '{"en":"<ul><li><Just for testing></li></ul>"}',
      photo: 'https://f004.backblazeb2.com/file/vpms-hk/assets/sample_table_tennis.jpg',
      status: 'open',
      fee: 1,
      currency: 'CAD',
      availableDays: '{"mon":true,"tue":true,"wed":true,"thu":false,"fri":true,"sat":true,"sun":true}',
      bookingTimeBasic: 'time',
      timeBased: '{"timeOpen":"09:00","timeClose":"20:00","timeMinimum":"30","timeMaximum":"60","timeIncrement":"30"}',
      sectionBased: '[{"name":"Morning","begin":"08:00","end":"12:00"},{"name":"Afternoon","begin":"13:00","end":"16:00"},{"name":"Evening","begin":"17:00","end":"20:00"}]',
      bookingAdvanceDays: null,
      autoCancelHours: 24,
      contact: '{"email":{"name":"<Estate Admin Name>","address":"dummy@email.com"},"whatsapp":{"name":"<Estate Admin Name>","number":"111-222-3333"}}',
      isRepetitiveBooking: 1
    }
    const res = await fetch(`${HOST}/api/ul/amenities`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    _amenityId = body.data.id // save the new id
  })

  test('POST /estates: Create a temporary estate', async () => {
    const param = {
      name: '{"en":"<Dummy Name>"}',
      address: '{"en":"<Dummy Address>"}',
      website: 'https://www.example.com',
      contact: '{"name":{"en":"<Estate Admin Name>"},"tel":"<Admin Phone no>","email":"<dummy email>"}',
      langEntries: 'en',
      timezone: '8',
      timezoneMeta: '{"value":"China Standard Time","offset":28800000,"text":"(UTC+08:00) Beijing, Chongqing, Hong Kong, Urumqi"}',
      currency: 'HKD',
      subscriptionStatus: 'trial',
      tenantApp: '{"estateImageApp":"https://f004.backblazeb2.com/file/vpms-hk/assets/tenantapp_default_estate_640x360.jpg","unitQrcodeSheetDspt":{"en":"<u>Please scan this QR code to register</u>"}}',
      onlinePayments: '{"stripePublishableKey":null,"stripeSecretKey":null}'
    }
    const res = await fetch(`${HOST}/api/ul/estates`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    _estateId = body.data.id // save the new id
  })

  test('POST /folders: Create a temporary folder', async () => {
    const param = {
      name: '{"en":"<Dummy Name>"}',
      isPublic: 1,
      status: 'active'
    }
    const res = await fetch(`${HOST}/api/ul/folders`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    _folderId = body.data.id // save the new id
  })

  test('POST /marketplaces: Create a temporary marketplace', async () => {
    const param = {
      title: '{"en":"<Dummy Title>"}',
      dateStart: '2023-01-17',
      dateEnd: '2023-1-19',
      isHidden: 0,
      audiences: '{"residence":{"owner":true,"tenant":true,"occupant":false,"agent":false},"carpark":null,"shop":null}',
      adImage: 'https://f004.backblazeb2.com/file/vpms-hk/assets/sample_marketplace_cht.jpg',
      commerceUrl: null
    }
    const res = await fetch(`${HOST}/api/ul/marketplaces`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    _marketplaceId = body.data.id // save the new id
  })

  test('POST /notices: Create a temporary notice', async () => {
    const param = {
      title: '{"en":"<Dummy Title>"}',
      issueDate: '2023-01-17',
      audiences: '{"residence":{"owner":true,"tenant":true,"occupant":true,"agent":true},"carpark":null,"shop":null}',
      folderId: 'wr37AwXnt1JJSQ3evcmUu',
      isNotifySent: 0,
      pdf: 'https://f004.backblazeb2.com/file/vpms-hk/directus/15f65053-5bb3-49d5-a81e-8ca3ea841a5b.pdf'
    }
    const res = await fetch(`${HOST}/api/ul/notices`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    _noticeId = body.data.id // save the new id
  })

  test('POST /tenantAmenityBookings: Create a temporary tenAmenBkg', async () => {
    const param = {
      tenantId: _tenantId,
      amenityId: _amenityId,
      bookingNo: 0,
      bookingTimeBasic: 'time',
      date: '2023-01-17',
      status: 'pending',
      totalFee: 3,
      currency: 'CAD',
      isPaid: 0,
      autoCancelTime: null,
      timeSlots: '[{"name":null,"from":"09:30","to":"10:00","fee":3,"section":null}]'
    }
    const res = await fetch(`${HOST}/api/ul/tenantAmenityBookings`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    _tenAmenBkgId = body.data.id // save the new id
  })

  test('POST /units: Create a temporary unit', async () => {
    const param = {
      type: 'res',
      block: '1',
      floor: '1',
      number: '1',
    }
    const res = await fetch(`${HOST}/api/ul/units`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    _unitId = body.data.id // save the new id
  })

  test('POST /tenantUnits: Create a temporary tenantUnit', async () => {
    const param = {
      tenantId: _tenantId,
      unitId: _unitId,
      role: 'tenant',
    }
    const res = await fetch(`${HOST}/api/ul/tenantUnits`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
  })

  /////////////////////////////////////// Test Every API //////////////////////////////////

  test('GET /amenities', async () => {
    const res = await fetch(`${HOST}/api/ul/amenities`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    expect(body.data).toBeInstanceOf(Array)
    expect(body.data.length).toBeGreaterThan(0)
    _amenityId = body.data[0].id
  })

  test('GET /amenities/:id', async () => {
    const res = await fetch(`${HOST}/api/ul/amenities/${_amenityId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    expect(body.data.id).toBe(_amenityId)
  })

  test('PUT /amenities/:id', async () => {
    const param = {
      name: '{"en":"<Dummy Amenity (Updated)>"}',
    }
    const res = await fetch(`${HOST}/api/ul/amenities/${_amenityId}`, {
      method: 'PUT',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
  })

  test('GET /estates', async () => {
    const res = await fetch(`${HOST}/api/ul/estates`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    expect(body.data).toBeInstanceOf(Array)
    expect(body.data.length).toBeGreaterThan(0)
    _estateId = body.data[0].id
  })

  test('GET /estates/:id', async () => {
    const res = await fetch(`${HOST}/api/ul/estates/${_estateId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    expect(body.data.id).toBe(_estateId)
  })

  test('PUT /estates/:id', async () => {
    const param = {
      name: '{"en":"<Dummy Name (Updated)>"}',
    }
    const res = await fetch(`${HOST}/api/ul/estates/${_estateId}`, {
      method: 'PUT',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
  })

  test('GET /folders', async () => {
    const res = await fetch(`${HOST}/api/ul/folders`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    expect(body.data).toBeInstanceOf(Array)
    expect(body.data.length).toBeGreaterThan(0)
    _estateId = body.data[0].id
  })

  test('GET /folders/:id', async () => {
    const res = await fetch(`${HOST}/api/ul/folders/${_estateId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    expect(body.data.id).toBe(_estateId)
  })

  test('PUT /folders/:id', async () => {
    const param = {
      name: '{"en":"<Dummy Name (Updated)>"}',
    }
    const res = await fetch(`${HOST}/api/ul/folders/${_folderId}`, {
      method: 'PUT',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
  })

  test('GET /marketplaces', async () => {
    const res = await fetch(`${HOST}/api/ul/marketplaces`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    expect(body.data).toBeInstanceOf(Array)
    expect(body.data.length).toBeGreaterThan(0)
    _marketplaceId = body.data[0].id
  })

  test('GET /marketplaces/:id', async () => {
    const res = await fetch(`${HOST}/api/ul/marketplaces/${_marketplaceId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    expect(body.data.id).toBe(_marketplaceId)
  })

  test('PUT /marketplaces/:id', async () => {
    const param = {
      title: '{"en":"<Dummy Title (Updated)>"}',
    }
    const res = await fetch(`${HOST}/api/ul/marketplaces/${_marketplaceId}`, {
      method: 'PUT',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
  })

  test('GET /notices', async () => {
    const res = await fetch(`${HOST}/api/ul/notices`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    expect(body.data).toBeInstanceOf(Array)
    expect(body.data.length).toBeGreaterThan(0)
    _noticeId = body.data[0].id
  })

  test('GET /notices/:id', async () => {
    const res = await fetch(`${HOST}/api/ul/notices/${_noticeId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    expect(body.data.id).toBe(_noticeId)
  })

  test('PUT /notices/:id', async () => {
    const param = {
      title: '{"en":"<Dummy Title (Updated)>"}',
    }
    const res = await fetch(`${HOST}/api/ul/notices/${_noticeId}`, {
      method: 'PUT',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
  })

  test('GET /tenantAmenityBookings', async () => {
    const res = await fetch(`${HOST}/api/ul/tenantAmenityBookings`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    expect(body.data).toBeInstanceOf(Array)
    expect(body.data.length).toBeGreaterThan(0)
    _tenAmenBkgId = body.data[0].id
  })

  test('GET /tenantAmenityBookings/:id', async () => {
    const res = await fetch(`${HOST}/api/ul/tenantAmenityBookings/${_tenAmenBkgId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    expect(body.data.id).toBe(_tenAmenBkgId)
  })

  test('PUT /tenantAmenityBookings/:id', async () => {
    const param = {
      status: 'ready',
    }
    const res = await fetch(`${HOST}/api/ul/tenantAmenityBookings/${_tenAmenBkgId}`, {
      method: 'PUT',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
  })

  test('GET /tenantAmenityBookings', async () => {
    const res = await fetch(`${HOST}/api/ul/tenants`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    expect(body.data).toBeInstanceOf(Array)
    expect(body.data.length).toBeGreaterThan(0)
  })

  test('GET /tenants/:id', async () => {
    const res = await fetch(`${HOST}/api/ul/tenants/${_tenantId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    expect(body.data.id).toBe(_tenantId)
  })

  test('PUT /tenants/:id', async () => {
    const param = {
      status: 1
    }
    const res = await fetch(`${HOST}/api/ul/tenants/${_tenantId}`, {
      method: 'PUT',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
  })

  test('GET /units', async () => {
    const res = await fetch(`${HOST}/api/ul/units`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    expect(body.data).toBeInstanceOf(Array)
    expect(body.data.length).toBeGreaterThan(0)
    _unitId = body.data[0].id
  })

  test('GET /units/:id', async () => {
    const res = await fetch(`${HOST}/api/ul/units/${_unitId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    expect(body.data.id).toBe(_unitId)
  })

  test('PUT /units/:id', async () => {
    const param = {
      type: 'car',
    }
    const res = await fetch(`${HOST}/api/ul/units/${_unitId}`, {
      method: 'PUT',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
  })

  test('GET /tenantUnits/:tenantId', async () => {
    const res = await fetch(`${HOST}/api/ul/tenantUnits/${_tenantId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
  })

  test('PUT /tenantUnits/:tenantId/:unitId', async () => {
    const param = {
      role: 'owner'
    }
    const res = await fetch(`${HOST}/api/ul/tenantUnits/${_tenantId}/${_unitId}`, {
      method: 'PUT',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
  })

  test('GET /users', async () => {
    const res = await fetch(`${HOST}/api/ul/users`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + _adminUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    expect(body.data).toBeInstanceOf(Array)
    expect(body.data.length).toBeGreaterThan(0)
  })

  test('GET /users/:id', async () => {
    const res = await fetch(`${HOST}/api/ul/users/${_tempUserId}`, {
      method: 'GET',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    expect(body.data.id).toBe(_tempUserId)
  })

  test('PUT /users/:id', async () => {
    const param = {
      name: '<Dummy name (Updated)>',
    }
    const res = await fetch(`${HOST}/api/ul/users/${_tempUserId}`, {
      method: 'PUT',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _adminUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
  })

  test('queryDatabase', async () => {
    const param = {
      sql: 'SElECT COUNT(*) FROM Amenities',
    }
    const res = await fetch(`${HOST}/api/ul/queryDatabase`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
  })

  test('runSql', async () => {
    const param = {
      sql: `UPDATE Tenants SET name='<Name (Updated)>' WHERE id='${_tenantId}'`,
    }
    const res = await fetch(`${HOST}/api/ul/runSql`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
    expect(body.data.success).toBe(true)
  })

  test('getUploadUrl', async () => {
    const res = await fetch(`${HOST}/api/ul/getUploadUrl?path=/dummy`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
    expect(body.data.uploadUrl).not.toBeUndefined()
    expect(body.data.uploadUrl).not.toBeNull()
  })

  test('getTenAmenBkgs', async () => {
    const res = await fetch(`${HOST}/api/ul/getTenAmenBkgs?start=${encodeURIComponent('2023-01-01')}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
    expect(body.data).toBeInstanceOf(Array)
  })

  test('uploadToReplaceUnits', async () => {
    const param = [['Block', 'Floor', 'Number']]
    const block = 'A'
    for (let floor = 1; floor <= 35; ++floor) {
      for (let number = 1; number <= 16; ++number) {
        param.push([block.toString(), floor.toString(), number.toString()])
      }
    }
    const res = await fetch(`${HOST}/api/ul/uploadToReplaceUnits?ut=res`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
    expect(body.data.success).toBe(true)
  })

  test('getUserProfile', async () => {
    const res = await fetch(`${HOST}/api/ul/getUserProfile/${_tempUserId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
    expect(body.data.id).toBe(_tempUserId)
  })

  test('updateUserProperty', async () => {
    const param = {
      field: 'name',
      value: '<User Name (Updated)>'
    }
    const res = await fetch(`${HOST}/api/ul/updateUserProperty/${_tempUserId}`, {
      method: 'PUT',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _adminUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.success).toBe(true)
  })

  test('genUserConfirmCode', async () => {
    const param = {
      email: 'dummy@email.com',
      userId: _tempUserId,
    }
    const res = await fetch(`${HOST}/api/ul/genUserConfirmCode`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
    expect(body.data).not.toBeNull()
  })

  test('getDashboardData', async () => {
    const res = await fetch(`${HOST}/api/ul/getDashboardData`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
    expect(body.data.numOfResidences).not.toBeUndefined()
    expect(body.data.numOfCarparks).not.toBeUndefined()
    expect(body.data.numOfShops).not.toBeUndefined()
    expect(body.data.numOfTenants).not.toBeUndefined()
    expect(body.data.amenities).toBeInstanceOf(Array)
    expect(body.data.amenityBookings).toBeInstanceOf(Array)
  })

  test('getAllTenentsWithUnits', async () => {
    const res = await fetch(`${HOST}/api/ul/getAllTenentsWithUnits`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
    expect(body.data).toBeInstanceOf(Array)
    expect(body.data.length).toBeGreaterThan(0)
    expect(body.data[0]).not.toBeUndefined()
    expect(body.data[0].TenantId).toBe(_tenantId)
  })

  test('setAmenityBkgStatus: Change status to "paid"', async () => {
    const param = {
      bkgId: _tenAmenBkgId,
      status: 'paid',
    }
    const res = await fetch(`${HOST}/api/ul/setAmenityBkgStatus`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
    expect(body.data.updated).toBe(true)
    expect(body.data.loopId).not.toBeUndefined()
    expect(body.data.loopId).not.toBeNull()
  })

  test('setAmenityBkgStatus: Change status to "unpaid"', async () => {
    const param = {
      bkgId: _tenAmenBkgId,
      status: 'unpaid',
    }
    const res = await fetch(`${HOST}/api/ul/setAmenityBkgStatus`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
    expect(body.data.updated).toBe(true)
  })

  test('setAmenityBkgStatus: Change status to "cancelled"', async () => {
    const param = {
      bkgId: _tenAmenBkgId,
      status: 'cancelled',
    }
    const res = await fetch(`${HOST}/api/ul/setAmenityBkgStatus`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
    expect(body.data.updated).toBe(true)
    expect(body.data.loopId).not.toBeUndefined()
    expect(body.data.loopId).not.toBeNull()
  })

  test('_deleteOneTenant', async () => {
    const param = {
      tenantId: _tenantId,
    }
    const res = await fetch(`${HOST}/api/ul/_deleteOneTenant`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    // console.log(body)
    expect(body.data).not.toBeUndefined()
    expect(body.data.success).toBe(true)
  })

  // Create a new tenant again for further testing
  test('POST /tenants: Create a temporary tenant', async () => {
    const param = {
      name: '<Tenant C>',
      password: 'password',
      phone: '12223334444',
      email: 'dummy@email.com',
      status: 0,
      fcmDeviceToken: null,
      lastSignin: null,
      recType: 0,
      meta: '{}'
    }
    const res = await fetch(`${HOST}/api/ul/tenants`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
    expect(body.data).not.toBeUndefined()
    _tenantId = body.data.id // save the new id
  })

  /////////////////////////////////////// Cleanup //////////////////////////////////

  test('DELETE /marketplaces/:id', async () => {
    const res = await fetch(`${HOST}/api/ul/marketplaces/${_marketplaceId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
  })

  test('DELETE /notices/:id', async () => {
    const res = await fetch(`${HOST}/api/ul/notices/${_noticeId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
  })

  test('DELETE /tenantAmenityBookings/:id', async () => {
    const res = await fetch(`${HOST}/api/ul/tenantAmenityBookings/${_tenAmenBkgId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
  })

  test('DELETE /amenities/:id', async () => {
    const res = await fetch(`${HOST}/api/ul/amenities/${_amenityId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
  })

  test('DELETE /folders/:id', async () => {
    const res = await fetch(`${HOST}/api/ul/folders/${_folderId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
  })

  test('DELETE /estates/:id', async () => {
    const res = await fetch(`${HOST}/api/ul/estates/${_estateId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
  })

  test('DELETE /tenantUnits/:tenantId/:unitId', async () => {
    const res = await fetch(`${HOST}/api/ul/tenantUnits/${_tenantId}/${_unitId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
  })

  test('DELETE /units/:id', async () => {
    const res = await fetch(`${HOST}/api/ul/units/${_unitId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
  })

  test('DELETE /tenants/:id', async () => {
    const res = await fetch(`${HOST}/api/ul/tenants/${_tenantId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + _tempUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
  })

  test('DELETE /users/:id', async () => {
    const res = await fetch(`${HOST}/api/ul/users/${_tempUserId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'Bearer ' + _adminUserToken
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
  })

})