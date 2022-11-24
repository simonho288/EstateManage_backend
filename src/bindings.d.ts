export interface Bindings {
  USERNAME: string
  PASSWORD: string
  BLOG_EXAMPLE: KVNamespace
  DB: D1Database
  ENCRYPTION_KEY: string
}

export interface Env {
  DB: D1Database
  ENCRYPTION_KEY: string
}

declare global {
  // function getMiniflareBindings(): Bindings
}
