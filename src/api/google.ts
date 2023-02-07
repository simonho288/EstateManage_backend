import { Hono } from 'hono'
import { Bindings, Env } from '@/bindings'
// import { nanoid } from 'nanoid'
import getCurrentLine from 'get-current-line'

// import { Constant } from '../const'
import { Util } from '../util'

const googleApi = new Hono<{ Bindings: Bindings }>()

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
googleApi.get('/auth', async (c) => {
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
googleApi.get('/auth/callback', async (c) => {
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
    let result = await resp.json()
  },

}

export { googleApi, FirebaseUtil }