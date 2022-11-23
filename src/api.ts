/**
 * Hono doc: https://honojs.dev/docs/api/context/
 */

import { Hono } from 'hono'
import * as UserModel from './models/user'
import * as AmenityModel from './models/amenity'
import { Bindings } from './bindings'
import { cors } from 'hono/cors'

// export interface Env {
//   D1DB: D1Database;
// }

const api = new Hono<{ Bindings: Bindings }>()
api.use('/posts/*', cors())

api.get('/', (c) => {
  return c.json({ message: 'Hello' })
})

/*
api.get('/posts', async (c) => {
  const posts = await model.getPosts(c.env.BLOG_EXAMPLE)
  return c.json({ posts: posts, ok: true })
})

api.post('/posts', async (c) => {
  const param = await c.req.json()
  const newPost = await model.createPost(c.env.BLOG_EXAMPLE, param as model.Param)
  if (!newPost) {
    return c.json({ error: 'Can not create new post', ok: false }, 422)
  }
  return c.json({ post: newPost, ok: true }, 201)
})

api.get('/posts/:id', async (c) => {
  const id = c.req.param('id')
  const post = await model.getPost(c.env.BLOG_EXAMPLE, id)
  if (!post) {
    return c.json({ error: 'Not Found', ok: false }, 404)
  }
  return c.json({ post: post, ok: true })
})

api.put('/posts/:id', async (c) => {
  const id = c.req.param('id')
  const post = await model.getPost(c.env.BLOG_EXAMPLE, id)
  if (!post) {
    // 204 No Content
    return new Response(null, { status: 204 })
  }
  const param = await c.req.json()
  const success = await model.updatePost(c.env.BLOG_EXAMPLE, id, param as model.Param)
  return c.json({ ok: success })
})

api.delete('/posts/:id', async (c) => {
  const id = c.req.param('id')
  const post = await model.getPost(c.env.BLOG_EXAMPLE, id)
  if (!post) {
    // 204 No Content
    return new Response(null, { status: 204 })
  }
  const success = await model.deletePost(c.env.BLOG_EXAMPLE, id)
  return c.json({ ok: success })
})
*/

api.get('/try_d1_get', async (c) => {
  console.log(c.env);
  // const stmt = await c.env.D1DB.prepare('SELECT * FROM posts WHERE name = ?1').bind('Joe');
  const stmt = await c.env.DB.prepare('SELECT * FROM posts WHERE PostID=?1');
  const { results } = await stmt.bind(1).all();
  // console.log(results);
  return c.json(results);
})

// D1 Client API: https://developers.cloudflare.com/d1/client-api/
api.get('/try_d1_patchdb', async (c) => {
  let cmd = `
DROP TABLE IF EXISTS Posts;
CREATE TABLE Posts (PostID INT, Title TEXT, Body TEXT, PRIMARY KEY ('PostID'));
INSERT INTO Posts (PostID, Title, Body) VALUES (1, 'Alfreds Futterkiste', 'Maria Anders'),(4, 'Around the Horn', 'Thomas Hardy'),(11, 'Bs Beverages', 'Victoria Ashworth'),(13, 'Bs Beverages', 'Random Name');
  `;
  const out = await c.env.DB.exec(cmd);
  // console.log(results);
  return c.json(out);
})

// api.get('/create_sample_posts', async (c) => {
//   for (let i = 0; i < 10; ++i) {
//     await model.createPost(c.env.BLOG_EXAMPLE, {
//       title: `test title ${i + 1}`,
//       body: `test body ${i + 1}`,
//     })
//   }
//   return c.json({ ok: 'success' })
// })

api.get('/create_sample_units', async (c) => {
  return c.json({ ok: 'success' })
})

////////////////////////////////////////////////////////////////////////

api.get('/users/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await UserModel.getById(c.env.DB, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.get('/users', async (c) => {
  try {
    const { fields } = c.req.query()
    const records = await UserModel.getAll(c.env.DB, fields)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/users', async (c) => {
  try {
    const param = await c.req.json()
    const newRec = await UserModel.create(c.env.DB, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/users/:id', async (c) => {
  // const id = c.req.param('id')
  let result = await UserModel.updateById(c.env.DB, c.req.param('id'), await c.req.json())
  return c.json({ ok: result })
})

api.delete('/users/:id', async (c) => {
  const result = await UserModel.deleteById(c.env.DB, c.req.param('id'))
  return c.json({ ok: result })
})

api.get('/amenities/:id', async (c) => {
  try {
    const id = c.req.param('id')
    const { fields } = c.req.query()
    const record = await AmenityModel.getById(c.env.DB, id, fields)
    if (!record) throw new Error('Not found')
    return c.json({ data: record, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.get('/amenities', async (c) => {
  try {
    const { userId, fields } = c.req.query()
    const records = await AmenityModel.getAll(c.env.DB, userId, fields)
    return c.json({ data: records, ok: true })
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.post('/amenities', async (c) => {
  try {
    const param = await c.req.json()
    const newRec = await AmenityModel.create(c.env.DB, param)
    return c.json({ data: newRec, ok: true }, 201)
  } catch (ex: any) {
    return c.json({ error: ex.message, stack: ex.stack, ok: false }, 422)
  }
})

api.put('/amenities/:id', async (c) => {
  // const id = c.req.param('id')
  let result = await AmenityModel.updateById(c.env.DB, c.req.param('id'), await c.req.json())
  return c.json({ ok: result })
})

api.delete('/amenities/:id', async (c) => {
  const result = await AmenityModel.deleteById(c.env.DB, c.req.param('id'))
  return c.json({ ok: result })
})

export { api }
