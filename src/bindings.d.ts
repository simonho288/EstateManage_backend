export interface Bindings {
  USERNAME: string
  PASSWORD: string
  BLOG_EXAMPLE: KVNamespace
  DB: D1Database
}

declare global {
  function getMiniflareBindings(): Bindings
}
