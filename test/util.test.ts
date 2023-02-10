
import { describe, expect, test, jest } from '@jest/globals'
import { Util } from '../src/util'
import getCurrentLine from 'get-current-line'

const env = getMiniflareBindings()

describe('Test the /src/util.ts', () => {

  beforeEach((): void => {
    jest.setTimeout(15000)
  })

  test('getRandomInt()', () => {
    let v = Util.getRandomInt(0, 100)
    expect(v).toBeGreaterThanOrEqual(0)
    expect(v).toBeLessThanOrEqual(100)
  })

  test('genRandomCode6Digits()', () => {
    for (let i = 0; i < 100; i++) {
      expect(Util.genRandomCode6Digits().length).toBe(6)
    }
  })

  test('getDateStringByTzofs()', () => {
    expect(Util.getDateStringByTzofs(new Date().getTime(), -8).length).toBe(10)
  })

  test('encryptString() & decryptString()', async () => {
    const orig = 'this is the original value'
    let encrypted = await Util.encryptString(orig, env.USER_ENCRYPTION_KEY, Util.getRandomInt(10001, 99999))
    expect(encrypted).not.toBeNull()
    let decrypted = await Util.decryptString(encrypted, env.USER_ENCRYPTION_KEY)
    expect(decrypted).toEqual(orig)
  })

  test('urlEncodeObject()', () => {
    let param = {
      a: 'b',
      b: 2,
      c: 35.78,
      d: 'e+1*2/3'
    }
    expect(Util.urlEncodeObject(param)).toBe('a=b&b=2&c=35.78&d=e%2B1*2%2F3')
  })

  test('sendMailgun()', async () => {
    let res = await Util.sendMailgun(env.MAILGUN_API_URL, env.MAILGUN_API_KEY, {
      from: env.SYSTEM_EMAIL_SENDER,
      to: env.INITIAL_ADMIN_EMAIL,
      subject: 'EstateManage.Net Unit Test: Email send testing',
      text: 'This is sent by test/util.test.ts',
      html: '<p>This is sent by test/util.test.ts</p>'
    })
    expect(res).not.toBeNull()
    expect(res.id).not.toBeUndefined()
    expect(res.id).not.toBeNull()
  })

  test('makeWorkableSql()', () => {
    let sql = `
    -- This is comment 1
    DROP TABLE IF EXISTS Loops; -- This comment should be removed
    -- Below is 2nd statement
    CREATE TABLE Loops( -- This comment should be removed
      id TEXT NOT NULL UNIQUE PRIMARY KEY,
      name TEXT NOT NULL
    ); -- This comment should be removed
    `
    let res = Util.makeWorkableSql(sql)
    expect(res).not.toBeNull()
    expect(res).toBeInstanceOf(Array)
    expect(res.length).toBe(2)
  })

  test('getQueryParam()', () => {
    let url = `https://www.example.com/path?a=1&b2=${encodeURIComponent('a_string')}&query=${encodeURIComponent('specical char #!&@(^#(-=?.,.<>_&&$^')}`
    expect(Util.getQueryParam(url, 'a')).toBe('1')
    expect(Util.getQueryParam(url, 'b2')).toBe('a_string')
    expect(Util.getQueryParam(url, 'query')).toBe('specical%20char%20%23!%26%40(%5E%23(-%3D%3F.%2C.%3C%3E_%26%26%24%5E')
    expect(Util.getQueryParam(url, 'not_found')).toBeNull()
  })

  test('logCurLine()', () => {
    expect(Util.logCurLine(getCurrentLine())).toBeUndefined()
  })

  test('logException()', () => {
    expect(Util.logException('dummy')).toBeUndefined()
    expect(Util.logException(new Error('dummy error'))).toBeUndefined()
  })

  test('isJsonString()', () => {
    expect(Util.isJsonString('<dummy>')).toBeFalsy()
    expect(Util.isJsonString(JSON.stringify({}))).toBeTruthy()
    expect(Util.isJsonString(JSON.stringify({ a: '<dummy>' }))).toBeTruthy()
    expect(Util.isJsonString('{"a": "<dummy>"}')).toBeTruthy()
  })

  test('intlStrFromJson()', () => {
    expect(Util.intlStrFromJson('{"en": "<dummy>"}')).toBe('<dummy>')
  })

})
