import { EmailData } from '@/bindings'
import { Buffer } from 'buffer'
import { Constant } from './const'

const enc = new TextEncoder()
const dec = new TextDecoder()

// Used by encryptString/decryptString
const getPasswordKey = (password: string): PromiseLike<CryptoKey> =>
  crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveKey',
  ])

// Used by encryptString/decryptString
const deriveKey = (
  passwordKey: CryptoKey,
  salt: Uint8Array,
  keyUsage: CryptoKey['usages'],
  iterations: number = 10000,
): PromiseLike<CryptoKey> =>
  crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: iterations,
      hash: 'SHA-256',
    },
    passwordKey,
    { name: 'AES-GCM', length: 256 },
    false,
    keyUsage,
  )

// Used by encryptString/decryptString
const arrayBufferToHexString = (a: ArrayBuffer) => {
  var h = ''
  var b = new Uint8Array(a)
  for (var i = 0; i < b.length; i++) {
    var hi = b[i].toString(16)
    h += hi.length === 1 ? '0' + hi : hi
  }
  return h
}

// Used by encryptString/decryptString
const hexStringToArrayBuffer = (hexString: string) => {
  // remove the leading 0x
  hexString = hexString.replace(/^0x/, '')

  // ensure even number of characters
  if (hexString.length % 2 != 0) {
    throw new Error('WARNING: expecting an even number of characters in the hexString')
  }

  // check for some non-hex characters
  var bad = hexString.match(/[G-Z\s]/i)
  if (bad) {
    throw new Error(`WARNING: found non-hex characters: ${bad}`)
  }

  // split the string into pairs of octets
  var pairs = hexString.match(/[\dA-F]{2}/gi)

  // convert the octets to integers
  var integers = pairs!.map((s) => parseInt(s, 16))

  var array = new Uint8Array(integers)

  return array.buffer
}

// Expose to the project
export let Util = {

  sleep(time: number) {
    return new Promise(resolve => setTimeout(resolve, time));
  },

  getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1) + min)
  },

  genRandomCode6Digits(): string {
    let rnd = this.getRandomInt(100, 999999)
    return String(rnd).padStart(6, '0')
  },

  // Where: (examples)
  // datetime: Date.now() or new Date('1970-01-01 00:00:00 GMT+0000').getTime()
  // offsetHours: Canada = -8, Hong Kong = 8
  getDateStringByTzofs(datetime: number, offsetHours: number): string {
    let offset = offsetHours * 60 * 60 * 1000
    let nowUtc = Date.now()
    let now = nowUtc + offset
    let nowDt = new Date(now)
    let today = `${nowDt.getUTCFullYear()}-${nowDt.getUTCMonth() + 1}-${nowDt.getUTCDate()}`
    return today
  },

  // Ref: https://github.com/bradyjoslin/encrypt-workers-kv
  async encryptString(str: string, encKey: string, iterations: number = 10000)
    : Promise<string> {
    try {
      const secretData = new TextEncoder().encode(str)
      const salt = crypto.getRandomValues(new Uint8Array(16))
      const iv = crypto.getRandomValues(new Uint8Array(12))
      const passwordKey = await getPasswordKey(encKey)
      const aesKey = await deriveKey(passwordKey, salt, ['encrypt'], iterations)
      const encryptedContent = await crypto.subtle.encrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        aesKey,
        secretData,
      )

      const encryptedContentArr = new Uint8Array(encryptedContent)
      let iterationsArr = new Uint8Array(enc.encode(iterations.toString()))

      let buff = new Uint8Array(
        iterationsArr.byteLength +
        salt.byteLength +
        iv.byteLength +
        encryptedContentArr.byteLength,
      )
      let bytes = 0
      buff.set(iterationsArr, bytes)
      buff.set(salt, (bytes += iterationsArr.byteLength))
      buff.set(iv, (bytes += salt.byteLength))
      buff.set(encryptedContentArr, (bytes += iv.byteLength))

      return arrayBufferToHexString(buff.buffer)
    } catch (e: any) {
      throw new Error(`Error encrypting value: ${e.message}`)
    }
  },

  // Ref: https://github.com/bradyjoslin/encrypt-workers-kv
  async decryptString(encrypted: string, encKey: string)
    : Promise<string> {
    try {
      const encryptedData = hexStringToArrayBuffer(encrypted)
      const encryptedDataBuff = new Uint8Array(encryptedData)

      let bytes = 0
      const iterations = Number(
        dec.decode(encryptedDataBuff.slice(bytes, (bytes += 5))),
      )

      const salt = new Uint8Array(encryptedDataBuff.slice(bytes, (bytes += 16)))
      const iv = new Uint8Array(encryptedDataBuff.slice(bytes, (bytes += 12)))
      const data = new Uint8Array(encryptedDataBuff.slice(bytes))

      const passwordKey = await getPasswordKey(encKey)
      const aesKey = await deriveKey(passwordKey, salt, ['decrypt'], iterations)
      const decryptedContent = await crypto.subtle.decrypt(
        {
          name: 'AES-GCM',
          iv: iv,
        },
        aesKey,
        data,
      )

      return dec.decode(decryptedContent)
    } catch (e: any) {
      throw new Error(`Error decrypting value: ${e.message}`)
    }
  },

  urlEncodeObject(obj: { [s: string]: any }) {
    return Object.keys(obj)
      .map(k => encodeURIComponent(k) + "=" + encodeURIComponent(obj[k]))
      .join("&");
  },

  async sendMailgun(mailgunUrl: string, apiKey: string, data: EmailData) {
    const dataUrlEncoded = this.urlEncodeObject(data)
    const _btoa = (str: string) => Buffer.from(str, 'utf8').toString('base64')
    const opts = {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + _btoa(`api:${apiKey}`),
        'Content-Type': 'application/x-www-form-urlencoded',
        // 'Content-Length': dataUrlEncoded.length.toString(),
      },
      body: dataUrlEncoded,
    }

    return await fetch(mailgunUrl, opts)
  },

  async turnstileVerify(token: string, ip: string, secret: string): Promise<boolean> {
    // Validate the token by calling the "/siteverify" API.
    let formData = new FormData()
    formData.append('secret', secret)
    formData.append('response', token)
    formData.append('remoteip', ip)

    const result = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      body: formData,
      method: 'POST',
    })

    const outcome = await result.json() as any
    if (!outcome.success) {
      throw new Error('The provided Turnstile token was not valid! ' + JSON.stringify(outcome))
    }

    return true
  },

  // Remove all comments, empty lines & carriage returns in SQL.
  // Then split it all into multiple single SQL statement
  makeWorkableSql(sql: string): string[] {
    let linesSrc = sql.split('\n')
    let stmts: string[] = []
    let results: string[] = []
    for (let i = 0; i < linesSrc.length; ++i) {
      let line = linesSrc[i].trim()

      if (line != '') {
        // Remove comment
        let idx = line.indexOf('--')
        if (idx >= 0) {
          line = line.substring(0, idx - 1)
        }

        stmts.push(line)

        if (line.includes(';')) {
          results.push(stmts.join(''))
          stmts = []
        }
      }
    }

    return results
  },

  getQueryParam(url: string, name: string): string | null {
    let q = url.match(new RegExp('[?&]' + name + '=([^&#]*)'))
    if (!q) return null
    return q && q[1]
  }

}