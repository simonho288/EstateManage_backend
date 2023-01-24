import 'jest-fetch-mock'
import { describe, expect, test, beforeEach } from '@jest/globals'

import { App } from '../components/app'
import { Util } from './util'
import { Config } from "./config.js"

describe('AutoForm', () => {
  document.head.innerHTML = ''
  document.body.innerHTML = '<div id="app"></div>'

  let _app = new App($('#app'))
  globalThis.app = _app

  test('getRandomInt()', async () => {
    expect(Util.getRandomInt(0, 100)).toBeLessThanOrEqual(100)
  })

  test('nextChar()', async () => {
    expect(Util.nextChar('a')).toBe('b')
  })

  test('isValidEmail()', async () => {
    expect(Util.isValidEmail('test123@example456.com')).toBeTruthy()
    expect(Util.isValidEmail('@example.com')).toBeFalsy()
  })

  test('escapeHTML()', async () => {
    expect(Util.escapeHTML('<div>#@!732</div>')).toBe('&lt;div&gt;#@!732&lt;/div&gt;')
  })

  test('groupBy()', async () => {
    const data = [
      { a: "abc", b: 1, c: 1 },
      { a: "pqr", b: 1, c: 1 },
      { a: "klm", b: 1, c: 2 },
      { a: "xyz", b: 1, c: 2 },
    ];
    let rst = Util.groupBy(data, 'c')
    expect(rst[1]).not.toBeUndefined()
    expect(rst[1]).toBeInstanceOf(Array)
    expect(rst[1][0]).not.toBeUndefined()
    expect(rst[1][0].a).not.toBeUndefined()
    expect(rst[1][0].a).toBe('abc')
    expect(rst[1][0].b).toBe(1)
    expect(rst[1][0].c).toBe(1)
    expect(rst[1][1].a).toBe('pqr')
    expect(rst[1][1].b).toBe(1)
    expect(rst[1][1].c).toBe(1)
    expect(rst[2][0]).not.toBeUndefined()
    expect(rst[2][0].a).not.toBeUndefined()
    expect(rst[2][0].a).toBe('klm')
    expect(rst[2][0].b).toBe(1)
    expect(rst[2][0].c).toBe(2)
    expect(rst[2][1].a).toBe('xyz')
    expect(rst[2][1].b).toBe(1)
    expect(rst[2][1].c).toBe(2)
  })

  test('floorNameToValue()', () => {
    let v: any
    v = Util.floorNameToValue('5')
    expect(v).not.toBeUndefined()
    expect(v.type).not.toBeUndefined()
    expect(v.type).toBe('numeric')
    expect(v.value).not.toBeUndefined()
    expect(v.value).toBe(5)
    v = Util.floorNameToValue('4')
    expect(v).not.toBeUndefined()
    expect(v.type).not.toBeUndefined()
    expect(v.type).toBe('numeric')
    expect(v.value).not.toBeUndefined()
    expect(v.value).toBe(4)
    v = Util.floorNameToValue('3')
    expect(v).not.toBeUndefined()
    expect(v.type).not.toBeUndefined()
    expect(v.type).toBe('numeric')
    expect(v.value).not.toBeUndefined()
    expect(v.value).toBe(3)
    v = Util.floorNameToValue('2')
    expect(v).not.toBeUndefined()
    expect(v.type).not.toBeUndefined()
    expect(v.type).toBe('numeric')
    expect(v.value).not.toBeUndefined()
    expect(v.value).toBe(2)
    v = Util.floorNameToValue('1')
    expect(v).not.toBeUndefined()
    expect(v.type).not.toBeUndefined()
    expect(v.type).toBe('numeric')
    expect(v.value).not.toBeUndefined()
    expect(v.value).toBe(1)
    v = Util.floorNameToValue('G')
    expect(v).not.toBeUndefined()
    expect(v.type).not.toBeUndefined()
    expect(v.type).toBe('groundfloor')
    expect(v.value).not.toBeUndefined()
    expect(v.value).toBe(0)
    v = Util.floorNameToValue('B1')
    expect(v).not.toBeUndefined()
    expect(v.type).not.toBeUndefined()
    expect(v.type).toBe('basement')
    expect(v.value).not.toBeUndefined()
    expect(v.value).toBe(-1)
    v = Util.floorNameToValue('B2')
    expect(v).not.toBeUndefined()
    expect(v.type).not.toBeUndefined()
    expect(v.type).toBe('basement')
    expect(v.value).not.toBeUndefined()
    expect(v.value).toBe(-2)
    v = Util.floorNameToValue('B3')
    expect(v).not.toBeUndefined()
    expect(v.type).not.toBeUndefined()
    expect(v.type).toBe('basement')
    expect(v.value).not.toBeUndefined()
    expect(v.value).toBe(-3)
    v = Util.floorNameToValue('B4')
    expect(v).not.toBeUndefined()
    expect(v.type).not.toBeUndefined()
    expect(v.type).toBe('basement')
    expect(v.value).not.toBeUndefined()
    expect(v.value).toBe(-4)
    v = Util.floorNameToValue('B5')
    expect(v).not.toBeUndefined()
    expect(v.type).not.toBeUndefined()
    expect(v.type).toBe('basement')
    expect(v.value).not.toBeUndefined()
    expect(v.value).toBe(-5)
    v = Util.floorNameToValue('B6')
    expect(v).not.toBeUndefined()
    expect(v.type).not.toBeUndefined()
    expect(v.type).toBe('basement')
    expect(v.value).not.toBeUndefined()
    expect(v.value).toBe(-6)
    v = Util.floorNameToValue('B7')
    expect(v).not.toBeUndefined()
    expect(v.type).not.toBeUndefined()
    expect(v.type).toBe('basement')
    expect(v.value).not.toBeUndefined()
    expect(v.value).toBe(-7)
    v = Util.floorNameToValue('B8')
    expect(v).not.toBeUndefined()
    expect(v.type).not.toBeUndefined()
    expect(v.type).toBe('basement')
    expect(v.value).not.toBeUndefined()
    expect(v.value).toBe(-8)
    v = Util.floorNameToValue('B9')
    expect(v).not.toBeUndefined()
    expect(v.type).not.toBeUndefined()
    expect(v.type).toBe('basement')
    expect(v.value).not.toBeUndefined()
    expect(v.value).toBe(-9)
  })

  test('isJsonString()', () => {
    expect(Util.isJsonString(JSON.stringify({}))).toBe(true)
    expect(Util.isJsonString(JSON.stringify({ a: 1, b: '2' }))).toBe(true)
    expect(Util.isJsonString(JSON.stringify({ a: 1, b: '2', c: { d: 1, e: '2' } }))).toBe(true)
    expect(Util.isJsonString(JSON.stringify({ a: 1, b: '2', c: { d: 1, e: '2' }, f: [1, '2'] }))).toBe(true)
    expect(Util.isJsonString(JSON.stringify({ a: 1, b: '2', c: { d: 1, e: '2' }, f: [1, '2', { '3': { 4: '5' } }] }))).toBe(true)
  })

  test('intlStrFromJson()', () => {
    expect(Util.intlStrFromJson(JSON.stringify({
      en: 'English Text',
      'zh-cht': '中文正體',
      'zh-chs': '中文简体'
    }))).toBe('English Text')
  })

  test('intlStrToJson()', () => {
    expect(Util.intlStrToJson('English Text')).toBe('{"en":"English Text"}')
  })

  test('audiencesToString()', () => {
    expect(Util.audiencesToString({
      owner: true,
      tenant: false,
      occupant: false,
      agent: false,
    })).toBe('own')
    expect(Util.audiencesToString({
      owner: true,
      tenant: true,
      occupant: false,
      agent: false,
    })).toBe('own,ten')
    expect(Util.audiencesToString({
      owner: true,
      tenant: true,
      occupant: true,
      agent: false,
    })).toBe('own,ten,occ')
    expect(Util.audiencesToString({
      owner: true,
      tenant: true,
      occupant: true,
      agent: true,
    })).toBe('own,ten,occ,agt')
  })

  test('sortUnits()', async () => {
    let units = [] as Array<any>
    for (let i = 0; i < 10; ++i) {
      units.push({
        id: Util.getRandomInt(1, 100000).toString(),
        type: 'res',
        block: 'A',
        floor: Util.getRandomInt(1, 100).toString(),
        number: '1'
      })
    }

    let r = Util.sortUnits('residences', units)
    let lastFloor = -99999
    for (let i = 0; i < r.length; ++i) {
      let fl = parseInt(r[i].floor)
      expect(fl).toBeGreaterThanOrEqual(lastFloor)
    }
  })

  test('validateUnitCsv()', async () => {
    let csv = 'Block\tFloor\tNumber\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\tG\t1\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\tG\t2\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\tG\t3\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\tG\t4\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\tG\t5\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\tG\t6\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\tG\t7\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\tG\t8\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\tG\t9\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\tG\t10\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\t1\t1\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\t1\t2\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\t1\t3\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\t1\t4\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\t1\t5\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\t1\t6\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\t1\t7\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\t1\t8\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\t1\t9\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\t\nA\t1\t10'
    let r = Util.validateUnitCsv(csv)
    expect(r).toBeInstanceOf(Array)
    for (let i = 0; i < r.length; ++i) {
      let u = r[i]
      expect(u).toBeInstanceOf(Array)
      expect(u.length).toBe(3)
      expect(u[0]).toBe('A')
    }
  })

  test('parseBlocknamesStr()', () => {
    let r = Util.parseBlocknamesStr(["A"], "A")
    expect(r).toBeInstanceOf(Array)
    expect(r.length).toBeGreaterThan(0)
    expect(r[0]).toBe('A')
    r = Util.parseBlocknamesStr(["A"], "*")
    expect(r).toBeInstanceOf(Array)
    expect(r.length).toBeGreaterThan(0)
    expect(r[0]).toBe('A')
  })

  test('parseFloornamesStr()', () => {
    let r = Util.parseFloornamesStr(['G', '1'], '*')
    expect(r).toBeInstanceOf(Array)
    expect(r.length).toBe(2)
    expect(r[0]).toBe('G')
    expect(r[1]).toBe('1')

    r = Util.parseFloornamesStr(['G', '1'], '1-10')
    expect(r).toBeInstanceOf(Array)
    expect(r.length).toBe(1)
    expect(r[0]).toBe('1')

    r = Util.parseFloornamesStr(['G', '1'], '1,2,4,5')
    expect(r).toBeInstanceOf(Array)
    expect(r.length).toBe(4)
    expect(r[0]).toBe('1')
    expect(r[1]).toBe('2')
    expect(r[2]).toBe('4')
    expect(r[3]).toBe('5')

    r = Util.parseFloornamesStr(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '15', '16', '17', '18', '19', '20', '21', '22', '23', '25', '26', '27', '28', '29', '30', '31', '32', '33', '35'], '8-10')
    expect(r).toBeInstanceOf(Array)
    expect(r.length).toBe(3)
    expect(r[0]).toBe('8')
    expect(r[1]).toBe('9')
    expect(r[2]).toBe('10')

    r = Util.parseFloornamesStr(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '15', '16', '17', '18', '19', '20', '21', '22', '23', '25', '26', '27', '28', '29', '30', '31', '32', '33', '35'], '1,2,3,8-10')
    expect(r).toBeInstanceOf(Array)
    expect(r.length).toBe(6)
    expect(r[0]).toBe('1')
    expect(r[1]).toBe('2')
    expect(r[2]).toBe('3')
    expect(r[3]).toBe('8')
    expect(r[4]).toBe('9')
    expect(r[5]).toBe('10')
  })

  test('parseNumbernamesStr()', function () {
    let r = Util.parseNumbernamesStr(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], '*')
    expect(r).toBeInstanceOf(Array)
    expect(r.length).toBe(16)
    for (let i = 0, j = 1; i < 16; ++i, ++j) {
      expect(r[i]).toBe(j.toString())
    }

    r = Util.parseNumbernamesStr(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], '1,2,3')
    expect(r).toBeInstanceOf(Array)
    expect(r.length).toBe(3)
    expect(r[0]).toBe('1')
    expect(r[1]).toBe('2')
    expect(r[2]).toBe('3')

    r = Util.parseNumbernamesStr(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], '1-3')
    expect(r.length).toBe(3)
    expect(r[0]).toBe('1')
    expect(r[1]).toBe('2')
    expect(r[2]).toBe('3')

    r = Util.parseNumbernamesStr(['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14', '15', '16'], '1,2,3,7-9')
    expect(r.length).toBe(6)
    expect(r[0]).toBe('1')
    expect(r[1]).toBe('2')
    expect(r[2]).toBe('3')
    expect(r[3]).toBe('7')
    expect(r[4]).toBe('8')
    expect(r[5]).toBe('9')
  })

})