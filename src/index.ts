import { Env } from '@/bindings'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/serve-static.module'
// import { basicAuth } from 'hono/basic-auth'
import { prettyJSON } from 'hono/pretty-json'
import { api } from './api'
import jwt from '@tsndr/cloudflare-worker-jwt'

import { Util } from './util'

const app = new Hono()
// app.use('/sampleData/*', serveStatic({ root: './' }))
app.use('/user/auth', cors({
  origin: 'http://localhost:3001',
  allowHeaders: ['Content-Type', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Methods'],
  allowMethods: ['POST', 'GET', 'OPTIONS'],
  exposeHeaders: ['Content-Length', 'Access-Control-Allow-Origin', 'Access-Control-Allow-Methods'],
  maxAge: 5,
  credentials: false,
}))
app.use('/api/*', cors())
// app.use('*', cors({
//   origin: 'http://localhost:3001',
//   allowHeaders: ['X-Custom-Header', 'Upgrade-Insecure-Requests'],
//   allowMethods: ['POST', 'GET', 'OPTIONS'],
//   exposeHeaders: ['Content-Length', 'X-Kuma-Revision'],
// }))
app.use('/static/*', serveStatic({ root: './' }))

// SAMPLE DATA APIs (temporary)
import { createSampleOthers } from './data/sampleDb/createOthers'
import { createSampleUnits } from './data/sampleDb/createUnits'
app.get('/create_sample_others', async (c) => {
  console.log('/create_sample_others')
  try {
    let output = await createSampleOthers(c.env as Env)
    return c.json(output)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})
app.get('/create_sample_units', async (c) => {
  try {
    let output = await createSampleUnits(c.env as Env)
    console.log(output)
    return c.json(output)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

// User authenication. If successful, generate a JWT & return in JSON
app.options('/user/auth', (c) => c.text('', 200))
app.post('/user/auth', async (c) => {
  type Param = { email: string, password: string }

  try {
    let param = await c.req.json() as Param
    if (!param.email || !param.password) throw new Error('Unspecified email or password')

    // User authenicate
    let email = param.email
    let drst = await c.env.DB.prepare(`SELECT id,password FROM Users WHERE email=?`).bind(email).first()
    if (drst == null) throw new Error('Invalid email or password')
    if (await Util.decryptString(drst.password, c.env.ENCRYPTION_KEY) != param.password)
      throw new Error('Invalid email or password')

    // Creating a expirable JWT & return it in JSON
    const token = await jwt.sign({
      userId: drst.id,
      exp: Math.floor(Date.now() / 1000) + (24 * (60 * 60)) // Expires: Now + 1 day
      // exp: Math.floor(Date.now() / 1000) + 60 // Expires: Now + 1 min
    }, c.env.API_SECRET)
    // console.log('token', token)

    // // Verify token before decoding
    // const isValid = await jwt.verify(token, c.env.API_SECRET)
    // console.log('isValid', isValid)

    // // Decoding token
    // const { payload } = jwt.decode(token)
    // console.log('payload', payload)

    return c.json({ token })
  } catch (ex) {
    let error = (ex as Error).message
    return c.json({ error })
  }
})

// app.get('/', (c) => c.text('Pretty Blog API'))
app.get('/', (c) => c.text(JSON.stringify(c.env)))
app.notFound((c) => c.json({ message: 'Not Found', ok: false }, 404))

// const middleware = new Hono<{ Bindings: Bindings }>()
// middleware.use('*', prettyJSON())

// middleware.use('/posts/*', async (c, next) => {
//   if (c.req.method !== 'GET') {
//     const auth = basicAuth({ username: c.env.USERNAME, password: c.env.PASSWORD })
//     return auth(c, next)
//   } else {
//     await next()
//   }
// })

// app.route('/api', middleware)
app.route('/api', api)

export default app
