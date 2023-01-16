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

  test('Initialize db (reset database)', async () => {
    const res = await fetch(`${HOST}/api/nl/initialize_db`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + env.DBINIT_SECRET
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
  })

  test('Create sample records 1 - Others', async () => {
    const res = await fetch(`${HOST}/api/nl/insert_sample_others`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + env.DBINIT_SECRET
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
  })

  test('Create sample records 2 - Units', async () => {
    const res = await fetch(`${HOST}/api/nl/insert_sample_units`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + env.DBINIT_SECRET
      }
    })
    expect(res).not.toBeNull()
    expect(res.status).toBe(200)
    const body = await res.json() as any
    expect(body.success).toBe(true)
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