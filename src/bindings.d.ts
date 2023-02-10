export interface Env {
  DB: D1Database
  ENCRYPTION_KEY: string
  USER_ENCRYPTION_KEY: string
  TENANT_ENCRYPTION_KEY: string
  API_SECRET: string
  DBINIT_SECRET: string
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
  INITIAL_ADMIN_EMAIL: string
  INITIAL_ADMIN_PASSWORD: string
  INITIAL_TENANT_EMAIL: string
  INITIAL_TENANT_PASSWORD: string
  NOTIFICATION_ICON_URL: string
  FIREBASE_PROJECT_ID: string
  FCM_SERVER_KEY: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  GOOGLE_SRVACC_EMAIL: string
  GOOGLE_SRVACC_PRIVATE_KEY: string
  TEST_DEVICE_TOKEN: string
}

export interface Bindings {
  env: Env
  DB: D1Database
  ENCRYPTION_KEY: string
  USER_ENCRYPTION_KEY: string
  TENANT_ENCRYPTION_KEY: string
  API_SECRET: string
  DBINIT_SECRET: string
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
  INITIAL_ADMIN_EMAIL: string
  INITIAL_ADMIN_PASSWORD: string
  INITIAL_TENANT_EMAIL: string
  INITIAL_TENANT_PASSWORD: string
  NOTIFICATION_ICON_URL: string
  FIREBASE_PROJECT_ID: string
  FCM_SERVER_KEY: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  GOOGLE_SRVACC_EMAIL: string
  GOOGLE_SRVACC_PRIVATE_KEY: string
  TEST_DEVICE_TOKEN: string
}

declare global {
  function getMiniflareBindings(): Bindings
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
