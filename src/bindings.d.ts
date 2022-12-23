export interface Env {
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
  MAILGUN_API_KEY: string
  MAILGUN_API_URL: string
  SYSTEM_HOST: string
  SYSTEM_EMAIL_SENDER: string
  TURNSTILE_SECRET: string
}

export interface Bindings {
  env: Env
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
  MAILGUN_API_KEY: string
  MAILGUN_API_URL: string
  SYSTEM_HOST: string
  SYSTEM_EMAIL_SENDER: string
  TURNSTILE_SECRET: string
}

declare global {
  function getMiniflareBindings(): Bindings
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

export interface EmailData {
  from: string
  to: string
  subject: string
  text: string
  html: string
  cc?: string
  bcc?: string
  'h-Reply-To'?: string
  'o:testmode'?: boolean
}
