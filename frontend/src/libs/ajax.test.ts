import 'jest-fetch-mock'
import { describe, expect, test, beforeEach } from '@jest/globals'

import { App } from '../components/app'
import { Ajax } from './ajax'
import { Config } from "./config.js"

describe('Ajax', () => {
  let app = new App($(''))
  globalThis.app = app

  let _amenities: any

  test('userLogin()', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      data: {
        apiToken: '<mocked_token>'
      }
    })) // mock response for fetch()

    let result = await Ajax.userLogin('dummy@admin.com', 'password')
    expect(result).not.toBeNull()
    expect(result.data).not.toBeUndefined()
    expect(result.data.apiToken).not.toBeNull()
    app.apiToken = result.data.apiToken
  })

  test('getRecsByCrit()', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      data: [{
        id: "JO9nGmV2jjueUYU1V52LK",
        name: '{"en":"Party Room"}',
        photo: "https://f004.backblazeb2.com/file/vpms-hk/assets/sample_party_room.jpg",
        status: "open",
        fee: 10,
        availableDays: '{"mon":true,"tue":true,"wed":false,"thu":true,"fri":true,"sat":true,"sun":true}'
      }, {
        id: "34EflyDfS3vPWOle1fQzA",
        name: '{ "en": "Table Tennis" }',
        photo: "https://f004.backblazeb2.com/file/vpms-hk/assets/sample_table_tennis.jpg",
        status: "open",
        fee: 30,
        availableDays: '{"mon":true,"tue":true,"wed":true,"thu":false,"fri":true,"sat":true,"sun":true}'
      }],
      success: true,
    })) // mock response for fetch()

    let fields = {
      fields: "id,name,photo,status,fee,availableDays",
      sort: "name"
    }
    let result = await Ajax.getRecsByCrit('amenities', fields)
    expect(result).not.toBeNull()
    expect(result.data).not.toBeUndefined()
    // console.log(result)
    expect(result.data).not.toBeUndefined()
    expect(result.data).toBeInstanceOf(Array)
    expect(result.data.length).toBeGreaterThan(0)
    expect(result.data[0].id).not.toBeNull()
    _amenities = result.data
  })

  test('queryDatabase()', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      data: [{
        "id": "AprTvXkFWkxp6X765kfo3",
        "type": "res",
        "block": "A",
        "floor": "1",
        "number": "1",
        "role": "owner"
      }, {
        "id": "wiJkuhpLS_rG0ZdT2TxjD",
        "type": "car",
        "block": "A",
        "floor": "B2",
        "number": "1",
        "role": "tenant"
      }]
    }))
    let sql = `SELECT * FROM Dummy'`
    let result = await Ajax.queryDatabase(sql)
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
    expect(result.data).toBeInstanceOf(Array)
    expect(result.data.length).toBeGreaterThan(0)
    expect(result.data[0].id).not.toBeNull()
  })

  test('runSql()', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      data: {}
    }))
    let sql = `SELECT * FROM Dummy`
    let result = await Ajax.runSql(sql)
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
    expect(result.data).not.toBeUndefined()
  })

  test('uploadBlobToObjStore()', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      data: {
        "uploadUrl": "https://estateman.f776d2c7755479f2c24ad783910810dd.r2.cloudflarestorage.com/users/adminuserid123/1674167951705_272.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=49e1a3024603d420d67a8e0eca5c4463%2F20230119%2Fauto%2Fs3%2Faws4_request&X-Amz-Date=20230119T223937Z&X-Amz-Expires=600&X-Amz-Signature=9efa2b7295a193afce81526ac4de2d1022b7c94db6c6aae3d84f591e5bdce8b8&X-Amz-SignedHeaders=host&x-id=PutObject",
        "endpoint": "https://pub-5602a55ba72f42d5bf24c0a521a5b7eb.r2.dev/users/adminuserid123/1674167951705_272.jpg"
      }
    }))
    let result = await Ajax.uploadBlobToObjStore(new Blob(), 'jpg')
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
    expect(result.data).not.toBeUndefined()
  })

  test('getRecById()', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      "data": {
        "id": "oXZhejHr0t3ygt6xMcBoV",
        "userId": "adminuserid123",
        "dateCreated": "2023-01-19T22:37:54.542Z",
        "name": '{"en":"Test 1"}',
        "details": '{"en":"<p>test</p>"}',
        "photo": "https://pub-5602a55ba72f42d5bf24c0a521a5b7eb.r2.dev/users/adminuserid123/1674167923167_85306.jpg",
        "status": "open",
        "fee": 12,
        "currency": "HKD",
        "availableDays": '{"mon":true,"tue":true,"wed":true,"thu":true,"fri":true,"sat":true,"sun":true}',
        "bookingTimeBasic": "time",
        "timeBased": '{"timeOpen":"08:00","timeClose":"20:00","timeMinimum":"30","timeMaximum":"60","timeIncrement":"30"}',
        "sectionBased": "[]",
        "bookingAdvanceDays": null,
        "autoCancelHours": null,
        "contact": '{"email":{"name":null,"address":null},"whatsapp":{"name":null,"number":null}}',
        "isRepetitiveBooking": 0
      },
      "success": true
    }))
    let result = await Ajax.getRecById('amenities', '<dummy>')
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
    expect(result.data).not.toBeUndefined()
  })

  test('saveRec()', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }))
    let param = _amenities[0]
    let result = await Ajax.saveRec('amenities', param, '<dummy>')
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
    expect(result.data).not.toBeUndefined()
    expect(result.data.success).not.toBeUndefined()
    expect(result.data.success).toBe(true)
  })

  test('deleteRecById()', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ success: true }))
    let result = await Ajax.deleteRecById('amenities', _amenities[0].id)
    // console.log(result)
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
    expect(result.data).not.toBeUndefined()
    expect(result.data.success).not.toBeUndefined()
    expect(result.data.success).toBe(true)
  })

  test('getTenAmenBkgs()', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: [] }))
    let result = await Ajax.getTenAmenBkgs('2023-01-01')
    // console.log(result)
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
    expect(result.data).not.toBeUndefined()
    expect(result.data).toBeInstanceOf(Array)
  })

  test('uploadToReplaceUnits()', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({ data: { success: true } }))
    let param = [["A", "G", "1"], ["A", "G", "2"], ["A", "G", "3"], ["A", "G", "4"], ["A", "G", "5"], ["A", "G", "6"], ["A", "G", "7"], ["A", "G", "8"], ["A", "G", "9"], ["A", "G", "10"], ["A", "1", "1"], ["A", "1", "2"], ["A", "1", "3"], ["A", "1", "4"], ["A", "1", "5"], ["A", "1", "6"], ["A", "1", "7"], ["A", "1", "8"], ["A", "1", "9"], ["A", "1", "10"]]
    let result = await Ajax.uploadToReplaceUnits('shp', param)
    // console.log(result)
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
    expect(result.data).not.toBeUndefined()
    expect(result.data.success).not.toBeUndefined()
    expect(result.data.success).toBe(true)
  })

  test('getUserProfile()', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      "data": {
        "id": "<dummy>",
        "dateCreated": "2023-01-18T18:15:32.604Z",
        "name": "<Estate Admin Name>",
        "language": "en",
        "email": "<dummy email address>",
        "password": "*****",
        "tel": "<Admin Phone no>",
        "role": "admin",
        "isValid": 1,
        "meta": '{"state":"ok","emailConfirmResendCnt":0}'
      }
    }))
    let param = {}
    let result = await Ajax.getUserProfile('<dummy>')
    // console.log(result)
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
    expect(result.data).not.toBeUndefined()
    expect(result.data.id).not.toBeUndefined()
  })

  test('updateUser()', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      success: true
    }))
    let result = await Ajax.updateUser('<dummy>', 'name', '<new name>')
    // console.log(result)
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
    expect(result.data).not.toBeUndefined()
    expect(result.data.success).not.toBeUndefined()
    expect(result.data.success).toBe(true)
  })

  test('genUserConfirmCode()', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      data: "164083"
    }))
    let result = await Ajax.genUserConfirmCode('<dummy>', 'dummy@email.com')
    // console.log(result)
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
    expect(result.data).not.toBeUndefined()
  })

  test('userRegister()', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      data: { success: true }
    }))
    let result = await Ajax.userRegister('dummy@email.com', '<dummy>', 'en', 'password', '<dummp-turnstile-code>')
    // console.log(result)
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
    expect(result.data).not.toBeUndefined()
    expect(result.data.success).not.toBeUndefined()
    expect(result.data.success).toBe(true)
  })

  test('getDashboardData()', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      "data": {
        "numOfResidences": 20,
        "numOfCarparks": 150,
        "numOfShops": 20,
        "numOfTenants": 2,
        "amenities": [{
          "id": "<dummy id 1>",
          "name": '{"en":"Table Tennis"}',
          "photo": "https://f004.backblazeb2.com/file/vpms-hk/assets/sample_table_tennis.jpg"
        }, {
          "id": "<dummy id 2>",
          "name": '{"en":"Party Room"}',
          "photo": "https://f004.backblazeb2.com/file/vpms-hk/assets/sample_party_room.jpg"
        }],
        "amenityBookings": []
      }
    }))
    let result = await Ajax.getDashboardData()
    // console.log(result)
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
    expect(result.data).not.toBeUndefined()
    expect(result.data.numOfResidences).not.toBeUndefined()
    expect(result.data.numOfCarparks).not.toBeUndefined()
    expect(result.data.numOfShops).not.toBeUndefined()
    expect(result.data.amenityBookings).toBeInstanceOf(Array)
  })

  test('getAllTenentsWithUnits()', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      "data": [{
        "TenantId": "<dummy tenant id>",
        "name": "<Tenant A>",
        "phone": "12223334444",
        "email": "dummy@email.com",
        "status": 1,
        "role": "tenant",
        "UnitId": "<dummy unit id>",
        "block": "A",
        "floor": "B2",
        "number": "1",
        "type": "car"
      }]
    }))
    let result = await Ajax.getAllTenentsWithUnits()
    // console.log(result)
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
    expect(result.data).not.toBeUndefined()
    expect(result.data).toBeInstanceOf(Array)
  })

  test('setAmenityBkgStatus()', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      data: {
        "updated": true,
        "loopId": "tusSNlLGgRohCIucwEWtB"
      }
    }))
    let result = await Ajax.setAmenityBkgStatus('<dummy bkgid>', 'paid')
    // console.log(result)
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
    expect(result.data).not.toBeUndefined()
    expect(result.data.updated).not.toBeUndefined()
    expect(result.data.updated).toBe(true)
  })

})
