
import { describe, expect, test, jest } from '@jest/globals'
import { Util } from '../src/util'
import { FirebaseUtil } from '../src/api/google'
import getCurrentLine from 'get-current-line'

const env = getMiniflareBindings()

describe('Test the /src/api/google.ts', () => {
  const deviceToken = 'dgGMQEQyTxq40CaxYMkyfn:APA91bFFno2XTtSQi472ilVnM6fxA2sHdYnM2DdjDj0kQTDsqW-Oo89aJ-NRm--y4xg8N1VLWpfhZuRTKi0mVtgltWonJXD3HBLi9bc-AdH6FUBJay1JMbkcpGZntA3w9sFyv6loOZub'
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
  })

  test('fcmSubscribeDeviceToTopic()', async () => {
    expect(await FirebaseUtil.fcmSubscribeDeviceToTopic(env.FCM_SERVER_KEY, deviceToken, 'dummy')).toBeTruthy()
  })

  test('fcmGetDeviceSubscription()', async () => {
    expect(await FirebaseUtil.fcmGetDeviceSubscription(env.FCM_SERVER_KEY, deviceToken)).toContain('dummy')
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
    let result = await FirebaseUtil.fcmSendNotificationMessage(env.FIREBASE_PROJECT_ID, 'testing', 'Sent from unit test', env.NOTIFICATION_ICON_URL, topicsCond, accessToken)
    expect(result).toMatch(/^projects\//)
  })

})
