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
    let sql = `SELECT Units.id,Units.type,Units.block,Units.floor,Units.number,TenantUnits.role FROM Units INNER JOIN TenantUnits ON TenantUnits.unitId=Units.id WHERE TenantUnits.tenantId='2dh71lyQgEC4dLJGm3T97' AND Units.userId='adminuserid123'`
    let result = await Ajax.queryDatabase(sql)
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
    expect(result.data).toBeInstanceOf(Array)
    expect(result.data.length).toBeGreaterThan(0)
    expect(result.data[0].id).not.toBeNull()
  })

  test('runSql()', async () => {
    fetchMock.mockResponseOnce(JSON.stringify({
      data: [{
      }]
    }))
    let sql = `SELECT Units.id,Units.type,Units.block,Units.floor,Units.number,TenantUnits.role FROM Units INNER JOIN TenantUnits ON TenantUnits.unitId=Units.id WHERE TenantUnits.tenantId='2dh71lyQgEC4dLJGm3T97' AND Units.userId='adminuserid123'`
    let result = await Ajax.runSql(sql)
    expect(result).not.toBeNull()
    expect(result).not.toBeUndefined()
    expect(result.data).toBeInstanceOf(Array)
    expect(result.data.length).toBeGreaterThan(0)
    expect(result.data[0].id).not.toBeNull()
  })

})
