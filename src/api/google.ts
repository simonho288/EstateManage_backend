import { Hono } from 'hono'
import { Bindings, Env } from '@/bindings'
// import { nanoid } from 'nanoid'
import getCurrentLine from 'get-current-line'

// import { Constant } from '../const'
import { Util } from '../util'

const googleApiRoutes = new Hono<{ Bindings: Bindings }>()

// Callback when Google auth successful. This must be added in the Google Developer Console->Credentials->Authorized redirect URIs
const REDIRECT_URI = 'http://localhost:3000/api/google/auth/callback'

/**
 * Perform Google Authentication which used by frontend.
 * The frontend is to redirect the webpage to this api.
 * Such as:
 * const url = `/api/google/auth?callback_url=${encodeURIComponent(callbackUri)}`
 * location.href = url
 * Where the callbackUri is the frontend webpage which
 * is returned when the Google Authentication successful.
 */
googleApiRoutes.get('/auth', async (c) => {
  Util.logCurLine(getCurrentLine())

  if (c.env.GOOGLE_CLIENT_ID == null) throw new Error(`GOOGLE_CLIENT_ID envvar not specified`)
  if (c.env.GOOGLE_CLIENT_SECRET == null) throw new Error(`GOOGLE_CLIENT_SECRET envvar not specified`)

  const googleScope = encodeURI('https://www.googleapis.com/auth/cloud-platform+https://www.googleapis.com/auth/firebase.messaging')

  let { callback_url } = c.req.query()
  const state = { // Our state will be used when the authenication finish
    returnUri: callback_url
  }
  const googleAuthUri = `https://accounts.google.com/o/oauth2/v2/auth?scope=${googleScope}&access_type=offline&state=${encodeURI(JSON.stringify(state))}&redirect_uri=${encodeURI(REDIRECT_URI)}&response_type=code&client_id=${c.env.GOOGLE_CLIENT_ID}`

  return c.redirect(googleAuthUri, 301)
})

/**
 * Return URL called by Google OAuth 2.0 with token if
 * the user has approved the authorization.
 */
googleApiRoutes.get('/auth/callback', async (c) => {
  Util.logCurLine(getCurrentLine())

  let { code } = c.req.query() as any
  let { state } = c.req.query() as any
  state = JSON.parse(state)

  // Obtain the Google access token
  const data = {
    'code': code,
    'client_id': c.env.GOOGLE_CLIENT_ID,
    'client_secret': c.env.GOOGLE_CLIENT_SECRET,
    'redirect_uri': REDIRECT_URI,
    'grant_type': 'authorization_code'
  }
  let result = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  }) as any
  result = await result.json()
  if (result == null) throw new Error('No result from Google API!')
  let accessToken = result.access_token
  let refreshToken = result.refresh_token

  // Call back with the tokens
  return c.redirect(`${state.returnUri}?access_token=${accessToken}&refresh_token=${refreshToken}`, 301)
})

const FirebaseUtil = {

  // Call Firebase Messaging API to get the device token which topics are subscribed to
  async fcmGetDeviceSubscription(fcmServerKey: string, deviceToken: string): Promise<Array<string>> {
    Util.logCurLine(getCurrentLine())

    let resp = await fetch(`https://iid.googleapis.com/iid/info/${deviceToken}?details=true`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `key=${fcmServerKey}`
      }
    })
    if (resp.ok == false) throw new Error(`Call FCM failed`)
    let result = await resp.json() as any
    if (result && result.rel && result.rel.topics) {
      return Object.getOwnPropertyNames(result.rel.topics)
    }

    throw new Error(`rel.topics not found in the result of fcm`)
  },

  // Call Firebase Messaging API to subscribe a device token to specified topic
  async fcmSubscribeDeviceToTopic(fcmServerKey: string, deviceToken: string, topic: string): Promise<void> {
    Util.logCurLine(getCurrentLine())

    let json = {
      to: `/topics/${topic}`,
      registration_tokens: [deviceToken]
    }

    let resp = await fetch('https://iid.googleapis.com/iid/v1:batchAdd', {
      method: 'POST',
      body: JSON.stringify(json),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `key=${fcmServerKey}`
      }
    })
    if (resp.ok == false) throw new Error(`Call FCM failed`)
    let result = await resp.json()
  },

  // Call Firebase Messaging API to unsubscribe a device token from the specified topic
  async fcmUnsubscribeDeviceFromTopic(fcmServerKey: string, deviceToken: string, topic: string): Promise<void> {
    Util.logCurLine(getCurrentLine())

    let json = {
      to: `/topics/${topic}`,
      registration_tokens: [deviceToken]
    }

    let resp = await fetch('https://iid.googleapis.com/iid/v1:batchRemove', {
      method: 'POST',
      body: JSON.stringify(json),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `key=${fcmServerKey}`
      }
    })
    if (resp.ok == false) throw new Error(`Call FCM failed`)
  },

  // Call Firebase Messaging API to send notifications. Where fbProjectId = env.FIREBASE_PROJECT_ID, and...
  // topicsCondition is combination of topics: e.g. 'foo' in topics || 'bar' in topics.
  // Docs: https://firebase.google.com/docs/cloud-messaging/js/topic-messaging
  async fcmSendNotificationMessage(fbProjectId: string, title: string, body: string, image: string, topicsCondition: string, accessToken: string): Promise<string> {
    Util.logCurLine(getCurrentLine())

    let json = {
      message: {
        condition: topicsCondition,
        notification: {
          body: body,
          title: title,
          image: image,
        }
      }
    }

    let resp = await fetch(`https://fcm.googleapis.com/v1/projects/${fbProjectId}/messages:send`, {
      method: 'POST',
      body: JSON.stringify(json),
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    })
    let result = await resp.json() as any
    if (resp.ok == false) throw new Error(`Call FCM failed: ${result.error.message}`)
    return result.name
  },

  /**
   * This function is copied from this gist: https://gist.github.com/markelliot/6627143be1fc8209c9662c504d0ff205
   *
   * Get a Google auth token given service user credentials. This function
   * is a very slightly modified version of the one found at
   * https://community.cloudflare.com/t/example-google-oauth-2-0-for-service-accounts-using-cf-worker/258220
   * 
   * @param {string} user   the service user identity, typically of the 
   *   form [user]@[project].iam.gserviceaccount.com
   * @param {string} key    the private key corresponding to user
   * @param {string} scope  the scopes to request for this token, a 
   *   listing of available scopes is provided at
   *   https://developers.google.com/identity/protocols/oauth2/scopes
   * @returns a valid Google auth token for the provided service user and scope or undefined
   */
  async getGoogleAuthToken(user: string, key: string, scope: string): Promise<string | undefined> {
    function objectToBase64url(object: object) {
      return arrayBufferToBase64Url(
        new TextEncoder().encode(JSON.stringify(object)),
      )
    }
    function arrayBufferToBase64Url(buffer: ArrayBuffer) {
      return btoa(String.fromCharCode(...new Uint8Array(buffer)))
        .replace(/=/g, "")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
    }
    function str2ab(str: string) {
      const buf = new ArrayBuffer(str.length)
      const bufView = new Uint8Array(buf)
      for (let i = 0, strLen = str.length; i < strLen; i++) {
        bufView[i] = str.charCodeAt(i)
      }
      return buf
    }
    async function sign(content: string, signingKey: string) {
      const buf = str2ab(content)
      const plainKey = signingKey
        .replace("-----BEGIN PRIVATE KEY-----", "")
        .replace("-----END PRIVATE KEY-----", "")
        .replace(/(\r\n|\n|\r)/gm, "")
      const binaryKey = str2ab(atob(plainKey))
      const signer = await crypto.subtle.importKey(
        "pkcs8",
        binaryKey,
        {
          name: "RSASSA-PKCS1-V1_5",
          hash: { name: "SHA-256" }
        },
        false,
        ["sign"]
      )
      const binarySignature = await crypto.subtle.sign({ name: "RSASSA-PKCS1-V1_5" }, signer, buf)
      return arrayBufferToBase64Url(binarySignature)
    }

    const jwtHeader = objectToBase64url({ alg: "RS256", typ: "JWT" })
    try {
      const assertiontime = Math.round(Date.now() / 1000)
      const expirytime = assertiontime + 3600
      const claimset = objectToBase64url({
        "iss": user,
        "scope": scope,
        "aud": "https://oauth2.googleapis.com/token",
        "exp": expirytime,
        "iat": assertiontime,
      })

      const jwtUnsigned = jwtHeader + "." + claimset
      const signedJwt = jwtUnsigned + "." + await sign(jwtUnsigned, key)
      const body = "grant_type=urn%3Aietf%3Aparams%3Aoauth%3Agrant-type%3Ajwt-bearer&assertion=" + signedJwt
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Cache-Control": "no-cache",
          "Host": "oauth2.googleapis.com"
        },
        body: body
      })
      const oauth = await response.json() as any
      if (oauth.error) throw oauth.error_description
      return oauth.access_token;
    } catch (err) {
      console.log(err)
    }
  }

}


export { googleApiRoutes as googleApi, FirebaseUtil }