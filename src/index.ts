import { Env } from '@/bindings'
import { nanoid } from 'nanoid'
import { Hono } from 'hono'
import { logger } from 'hono/logger'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/serve-static.module'
// import { basicAuth } from 'hono/basic-auth'
import { prettyJSON } from 'hono/pretty-json'
import { userLoggedInApi } from './api/userLoggedIn'
import { nonLoggedInApi } from './api/nonLoggedIn'
import jwt from '@tsndr/cloudflare-worker-jwt'

import { Constant } from './const'
import { Util } from './util'

const app = new Hono()
// app.use('/sampleData/*', serveStatic({ root: './' }))
app.use('*', logger())
// app.use('/user/*', cors({ origin: '*' }))
// app.use('/user/register', cors({ origin: '*' }))
// app.use('/user/auth', cors({
//   origin: 'http://localhost:3001',
//   allowHeaders: ['Content-Type', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Methods'],
//   allowMethods: ['POST', 'GET', 'OPTIONS'],
//   exposeHeaders: ['Content-Length', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Methods'],
//   maxAge: 5,
//   credentials: false,
// }))
// app.use('/api/*', cors())
// app.use('*', cors({
//   origin: 'http://localhost:3001',
//   allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
//   allowMethods: ['POST', 'GET', 'OPTIONS'],
//   exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
// }))
app.use('/static/*', serveStatic({ root: './' }))

app.onError((err, c) => {
  return c.json({
    error: true,
    status: 500,
    message: err.message,
  })
})

app.get('/test', async (c) => {
  return c.text('done')
})

app.get('/', (c) => c.text('No action'))
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))

// Non logged-in (neither user nor tenant) APIs
app.use('/api/nl/*', cors())
app.route('/api/nl', nonLoggedInApi)

// User logged-in APIs
app.use('/api/ul/*', cors())
app.route('/api/ul', userLoggedInApi)

// TODO: Tenant logged-in APIs
// app.use('/api/tl/*', cors())
// app.route('/api/tl', userLoggedInApi)

export default app
