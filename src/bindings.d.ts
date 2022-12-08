export interface Env {
  DB: D1Database
  ENCRYPTION_KEY: string
  API_SECRET: string
  // S3_ACCESS_KEY: string
  // S3_ACCESS_SECRET: string
  // S3_BUCKET: string
  // S3_REGION: string
  // S3_ENDPOINT: string
  // IS_DEBUG: string
}

export interface Bindings {
  DB: D1Database
  ENCRYPTION_KEY: string
  API_SECRET: string
  S3_ACCESS_KEY: string
  S3_ACCESS_SECRET: string
  S3_BUCKET: string
  S3_REGION: string
  S3_HOST: string
  S3_ENDPOINT: string
  IS_DEBUG: string
  env: Env
}

declare global {
  // function getMiniflareBindings(): Bindings
  // const IS_DEBUG: string
  // const ENCRYPTION_KEY: string
  // const API_SECRET: string
  // const S3_ACCESS_KEY: string
  // const S3_ACCESS_SECRET: string
  // const S3_BUCKET: string
  // const S3_REGION: string
  // const S3_HOST: string
  // const S3_ENDPOINT: string
}
