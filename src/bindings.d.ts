export interface Env {
  DB: D1Database
  ENCRYPTION_KEY: string
  API_SECRET: string
  IS_DEBUG: boolean
}

export interface Bindings {
  //   // USERNAME: string
  //   // PASSWORD: string
  //   // BLOG_EXAMPLE: KVNamespace
  DB: D1Database
  ENCRYPTION_KEY: string
  API_SECRET: string
  IS_DEBUG: boolean
  env: Env
}

declare global {
  // function getMiniflareBindings(): Bindings
}
