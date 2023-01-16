/**
 * This is a test module for testing Non-Logged-In APIs. Make sure the backend is started before running tests.
 * To run tests, type: "npm test"
 * This testing is based on this repo: https://github.com/cloudflare/miniflare-typescript-esbuild-jest
 * 
 * Jest docs: https://jestjs.io/docs/28.x/getting-started
 */

import { describe, expect, test } from '@jest/globals'
import fetch from 'node-fetch'

const HOST = 'http://localhost:3000'

const env = getMiniflareBindings()
// const { DB } = getMiniflareBindings()

describe('userLoggedInApi', () => {
  let _apiToken: string
  let _userId: string
  let _tenantToken: string
  let _tenantId: string
  let _unitId: string
  let _estate: any

  test('Check environment variables', () => {
    expect(env.INITIAL_ADMIN_EMAIL).not.toBeNull()
    expect(env.INITIAL_ADMIN_PASSWORD).not.toBeNull()
  })


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
        // 'Authorization': 'Bearer ' + env.DBINIT_SECRET
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.data).not.toBeNull()
    expect(body.data.apiToken).not.toBeNull()
    _apiToken = body.data.apiToken // save the api token
    expect(body.data.userId).not.toBeNull()
    _userId = body.data.userId // save the user id
  })

  test('User confirm email', async () => {
    const res = await fetch(`${HOST}/api/nl/user/confirm_email/${_userId}`)
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const str = await res.text()
    expect(str).not.toBeNull()
  })

  test('Tenant login', async () => {
    const param = {
      userId: _userId,
      mobileOrEmail: env.INITIAL_TENANT_EMAIL,
      password: env.INITIAL_TENANT_PASSWORD,
      fcmDeviceToken: null,
    }
    const res = await fetch(`${HOST}/api/nl/tenant/auth`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.data).not.toBeNull()
    expect(body.data.token).not.toBeNull()
    _tenantToken = body.data.token // save the tenant token
    expect(body.data.tenant).not.toBeNull()
    expect(body.data.tenant.id).not.toBeNull()
    _tenantId = body.data.tenant.id // save the tenant
  })

  test('Tenant confirm email', async () => {
    const res = await fetch(`${HOST}/api/nl/tenant/confirm_email/${_tenantId}`)
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const str = await res.text()
    expect(str).not.toBeNull()
  })

  test('Get a unit', async () => {
    const param = {
      userId: _userId,
    }
    const res = await fetch(`${HOST}/api/nl/_getOneUnit`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + env.DBINIT_SECRET
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.data).not.toBeNull()
    expect(body.data).toBeInstanceOf(Array)
    _unitId = body.data[0].id // save the unit id
  })

  test('Simulate scan QR-Code', async () => {
    const param = {
      url: `https://dummy.com/?a=${_userId}&b=${_unitId}`,
    }
    const res = await fetch(`${HOST}/api/nl/scanUnitQrcode`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer ' + env.DBINIT_SECRET
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.data).not.toBeNull()
    expect(body.data.success).toBe(true)
    expect(body.data.estate).not.toBeUndefined()
    expect(body.data.estate.id).not.toBeNull()
    _estate = body.data.estate
  })

  test('Create and delete a temporary tenant', async () => {
    const param = {
      userId: _userId,
      unitId: _unitId,
      name: 'Testing Tenant',
      email: 'dummy@example.com',
      password: 'dummypassword',
      phone: '1112223333',
      role: 'tenant',
    }
    const res = await fetch(`${HOST}/api/nl/createNewTenant`, {
      method: 'POST',
      body: JSON.stringify(param),
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': 'Bearer ' + env.DBINIT_SECRET
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.data).not.toBeUndefined()
    expect(body.data).not.toBeNull()
    expect(body.data.tenantId).not.toBeUndefined()
    const tenantId = body.data.tenantId


    // Delete that tenant just created
    const res2 = await fetch(`${HOST}/api/ul/_deleteOneTenant`, {
      method: 'POST',
      body: JSON.stringify({ tenantId: tenantId }),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + _apiToken
      }
    })
    expect(res2).not.toBeNull()
    expect(res2.status).toBe(200)
    const body2 = await res2.json() as any
    console.log(body2)
    expect(body2.data).not.toBeUndefined()
    expect(body2.data).not.toBeNull()
    expect(body2.data.success).toBe(true)
  })

})


/*
describe('Root', () => {
  it('GET /', async () => {
    const res = await userLoggedInApi.request('http://localhost/')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ message: 'Hello' })
  })
})
*/

/*
describe('Blog API', () => {
  test('List', async () => {
    const res = await app.fetch(new Request('http://localhost/posts'), env)
    expect(res.status).toBe(200)
    const body = await res.json<{ posts: Post[] }>()
    expect(body['posts']).not.toBeUndefined()
    expect(body['posts'].length).toBe(0)
  })

  let newPostId = ''

  test('CRUD', async () => {
    // POST /posts
    let payload = JSON.stringify({ title: 'Morning', body: 'Good Morning' })
    let req = new Request('http://localhost/posts', {
      method: 'POST',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
    })
    let res = await app.fetch(req, env)
    expect(res.status).toBe(201)
    let body = await res.json<{ post: Post }>()
    const newPost = body['post']
    expect(newPost.title).toBe('Morning')
    expect(newPost.body).toBe('Good Morning')
    newPostId = newPost.id

    // GET /posts
    res = await app.fetch(new Request('http://localhost/posts'), env)
    expect(res.status).toBe(200)
    const body2 = await res.json<{ posts: Post[] }>()
    expect(body2['posts']).not.toBeUndefined()
    expect(body2['posts'].length).toBe(1)

    // GET /posts/:id
    res = await app.fetch(new Request(`https://localhost/posts/${newPostId}`), env)
    expect(res.status).toBe(200)
    body = await res.json<{ post: Post }>()
    let post = body['post'] as Post
    expect(post.id).toBe(newPostId)
    expect(post.title).toBe('Morning')

    // PUT /posts/:id
    payload = JSON.stringify({ title: 'Night', body: 'Good Night' })
    req = new Request(`https://localhost/posts/${newPostId}`, {
      method: 'PUT',
      body: payload,
      headers: { 'Content-Type': 'application/json' },
    })
    res = await app.fetch(req, env)
    expect(res.status).toBe(200)
    let body3 = await res.json<{ ok: Boolean }>()
    expect(body3['ok']).toBeTruthy()

    // GET /posts/:id'
    res = await app.fetch(new Request(`https://localhost/posts/${newPostId}`), env)
    expect(res.status).toBe(200)
    body = await res.json<{ post: Post }>()
    post = body['post']
    expect(post.title).toBe('Night')
    expect(post.body).toBe('Good Night')

    // DELETE /posts/:id
    req = new Request(`https://localhost/posts/${newPostId}`, {
      method: 'DELETE',
    })
    res = await app.fetch(req, env)
    expect(res.status).toBe(200)
    body3 = await res.json<{ ok: Boolean }>()
    expect(body3['ok']).toBeTruthy()

    // GET /posts/:id
    res = await app.fetch(new Request(`https://localhost/posts/${newPostId}`), env)
    expect(res.status).toBe(404)
  })
})
*/