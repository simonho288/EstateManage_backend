
import { describe, expect, test, jest } from '@jest/globals'
import { Util } from '../src/util'
import { FirebaseUtil } from '../src/api/google'
import getCurrentLine from 'get-current-line'

const env = getMiniflareBindings()

describe('Test the /src/api/google.ts', () => {
  let deviceToken: string
  let accessToken: string

  beforeEach((): void => {
    jest.setTimeout(15000)
  })

  test('Check environment variables', () => {
    expect(env.GOOGLE_CLIENT_ID).not.toBeUndefined()
    expect(env.GOOGLE_CLIENT_SECRET).not.toBeUndefined()
    expect(env.SYSTEM_HOST).not.toBeUndefined()
    expect(env.FCM_SERVER_KEY).not.toBeUndefined()
    expect(env.NOTIFICATION_ICON_URL).not.toBeUndefined()
    expect(env.FIREBASE_PROJECT_ID).not.toBeUndefined()
    expect(env.GOOGLE_SRVACC_EMAIL).not.toBeUndefined()
    expect(env.GOOGLE_SRVACC_PRIVATE_KEY).not.toBeUndefined()
    expect(env.GOOGLE_CLIENT_ID).not.toBeUndefined()
    expect(env.GOOGLE_CLIENT_SECRET).not.toBeUndefined()
    expect(env.TEST_DEVICE_TOKEN).not.toBeUndefined()

    deviceToken = env.TEST_DEVICE_TOKEN
  })

  test('fcmSubscribeDeviceToTopic()', async () => {
    expect(await FirebaseUtil.fcmSubscribeDeviceToTopic(env.FCM_SERVER_KEY, deviceToken, 'dummy')).toBeTruthy()
  })

  test('fcmGetDeviceSubscription()', async () => {
    let result = await FirebaseUtil.fcmGetDeviceSubscription(env.FCM_SERVER_KEY, deviceToken)
    expect(result.error).toBeUndefined() // If the error is MissingIIdToken, it needs to get a new device token and set it to the "TEST_DEVICE_TOKEN" in the file .dev.vars
    expect(result.data).toContain('dummy')
  })

  test('fcmUnsubscribeDeviceFromTopic()', async () => {
    expect(await FirebaseUtil.fcmUnsubscribeDeviceFromTopic(env.FCM_SERVER_KEY, deviceToken, 'dummy')).toBeTruthy()
  })

  test('getGoogleAuthToken()', async () => {
    const scope = 'https://www.googleapis.com/auth/firebase.messaging'
    let at = await FirebaseUtil.getGoogleAuthToken(env.GOOGLE_SRVACC_EMAIL, env.GOOGLE_SRVACC_PRIVATE_KEY, scope)
    expect(at).not.toBeUndefined()
    accessToken = at!
  })

  test('fcmSendNotificationMessage()', async () => {
    const topicsCond = `'dummy' in topics`
    const data = {}
    let result = await FirebaseUtil.fcmSendNotificationMessage(accessToken, env.FIREBASE_PROJECT_ID, 'testing', 'Sent from unit test', env.NOTIFICATION_ICON_URL, topicsCond, data)
    expect(result).toMatch(/^projects\//)
  })

})
