import { Env } from '@/bindings'
import { Hono } from 'hono'
import getCurrentLine from 'get-current-line'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/serve-static.module'
import { nonLoggedInApi } from './api/nonLoggedIn'
import { userLoggedInApi } from './api/userLoggedIn'
import { tenantLoggedInApi } from './api/tenantLoggedIn'
import { googleApi } from './api/google'
import { Util } from './util'

const app = new Hono()

app.use('/public/*', serveStatic({ root: './' }))

app.onError((err, c) => {
  return c.json({
    error: true,
    status: 500,
    message: err.message,
  })
})

app.get('/test', async (c) => {
  Util.logCurLine(getCurrentLine())
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

// Tenant logged-in APIs
app.use('/api/tl/*', cors())
app.route('/api/tl', tenantLoggedInApi)

// Google related APIs
app.use('/api/google/*', cors())
app.route('/api/google', googleApi)

export default app
