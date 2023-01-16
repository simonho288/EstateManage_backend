# EstateManage.Net (Beta)

![Estate Manage](https://repository-images.githubusercontent.com/569517058/3376365d-a1c2-409f-8342-4e481e2584d0)

## Features Of The Platform

Please check it out the [Estate Manage website](https://www.estatemanage.net)

## Features Of Programming Codes

- Cloudflare Workers (CFW): Serverless functions execute over 100 countries for users everywhere in the world.
- You don't need to configure auto-scaling or load-balancer. CFW runs on high performance global network.
- CFW performance is about 300% faster than Lambda@Edge, supports 0ms worldwide cold starts.
- Data stores in CFW D1 database (first queryable serverless distributed database).
- HonoJS ultrafast web framework on backend.
- Media files (image, PDF...) upload to popular object store such as AWS S3, Cloudflare R2 or Backblaze B2.
- TypeScript: Both frontend & backend. Easier to develop & reduce programming errors.
- Fomantic-UI for frontend web admin. Easy to use with over 50 built-in powerful and beautiful components and it's fully documented.
- In web admin, implemented Cloudflare Turnstile in user signup page to prevent abuse or bot visitors and protect data privacy.
- Copy & paste all units from the spreadsheet for estate's initial setup. Easy & fast to setup the estate no matter your estate has more than thousands of units (residences, carparks and shops).
- A Flutter mobile app for your tenants to download (source codes will be published on another GitHub repo soon)
- `wrangler2` for local development and deploy.
- Test with Jest `miniflare environment`. (later)

## Usage

### Installation

1. Install the packages for backend & frontend. Build the fomantic-ui distribution

```sh
# At project root
$ npm install
$ cd frontend
$ npm install
$ npm run build:semantic-ui
```

2. Create D1 database

You'll need to create two databases (live & staging)

```sh
# At project root
$ wrangler d1 create EstateMan # Write down the database id
$ wrangler d1 create EstateMan_dev # Write down the database id as well
```

- Edit the `/wrangler.toml` file
- In [[env.staging.d1_databases]] section, paste the two database id to 'database_id' (live) & 'preview_database_id' (staging)

### Setup the variables for frontend

- Rename example.wrangler.toml -> wrangler.toml
- Enter the values inside wrangler.toml

For frontend config, create a `frontend/src/libs/config.js` with below contents:

```javascript
export let Config = {
  unitQrAppDownloadUrl: '<YOUR_URL_FOR_MOBILE_APP_DOWNLOAD>',
  tenantAppAndroidUrl: '<URL_OF_YOUR_ANDROID_APP_ON_PLAYSTORE>',
  tenantAppIOSUrl: '<URL_OF_YOUR_IOS_APP_ON_APPSTORE>',
}
```

### Setup the backend specific values, API keys, encryption keys...

Create a file `.dev.vars` at root directory, for Cloudflare Workers in local development. The file contents are:

```
[env.staging.vars]
IS_DEBUG = 1
USER_ENCRYPTION_KEY = "<512-bits encryption key>"
TENANT_ENCRYPTION_KEY = "<512-bits encryption key>"
API_SECRET = "<256-bits encryption key>"
DBINIT_SECRET = "<256-bits encryption key>"
SYSTEM_HOST = "http://localhost:3000" # CFW local server default port. (May change in future)
SYSTEM_EMAIL_SENDER = "<YOUR_EMAIL_SENDER_NAME_WITH_EMAIL>" # e.g. EstateMan <no_reply@propmanagement.com>
#### For Initial Database
INITIAL_ADMIN_EMAIL = "<YOUR_EMAIL_FOR_ADMIN_LOGIN>"
INITIAL_ADMIN_PASSWORD = "<YOUR_PASSWORD_FOR_ADMIN_LOGIN>" # Should be at least 8 chars
INITIAL_TENANT_EMAIL = "<YOUR_EMAIL_FOR_TENANT_LOGIN>"
INITIAL_TENANT_PASSWORD = "<YOUR_PASSWORD_FOR_TENANT_LOGIN>" # Should be at least 8 chars
##### Amazon S3
S3_ACCESS_KEY = "<YOUR_S3_ACCESS_KEY>"
S3_ACCESS_SECRET = "<YOUR_S3_SECRET_KEY>"
S3_BUCKET = "<YOUR_S3_BUCKET_NAME>"
S3_REGION = "<YOUR_S3_REGION_CODE>"
S3_HOST = "<YOUR_S3_HOST_URL_FOR_API_ACCESS>" # should be https://s3.amazonaws.com
S3_ENDPOINT = "<YOUR_S3_PUBLIC_ENDPOINT_URL>"
##### or Cloudflare R2
# S3_ACCESS_KEY = "<YOUR_R2_ACCESS_KEY>"
# S3_ACCESS_SECRET = "<YOUR_R2_SECRET_KEY>"
# S3_BUCKET = "<YOUR_R2_BUCKET_NAME>"
# S3_REGION = "auto" # 'auto' should be used for Cloudflare R2
# S3_HOST = "<YOUR_R2_HOST_URL_FOR_API_ACCESS>"
# S3_ENDPOINT = "<YOUR_R2_PUBLIC_ENDPOINT_URL>"
##### or Backblaze B2
# S3_ACCESS_KEY = "<YOUR_B2_ACCESS_KEY>"
# S3_ACCESS_SECRET = "<YOUR_B2_SECRET_KEY>"
# S3_BUCKET = "<YOUR_B2_BUCKET_NAME>"
# S3_REGION = "<YOUR_B2_REGION_CODE>"
# S3_HOST = "<YOUR_B2_HOST_URL_FOR_API_ACCESS>"
# S3_ENDPOINT = "<YOUR_B2_PUBLIC_ENDPOINT_URL>"
##### Mailgun
MAILGUN_API_KEY = "<YOUR_MAILGUN_API_KEY>"
MAILGUN_API_URL = "<YOUR_MAILGUN_API_ACCESS_URL>"
TURNSTILE_SECRET = "<YOUR_CLOUDFLARE_TURNSTILE_SECRET>"
```

Notes:

- For your convenience, you can generate encryption keys online: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx

### Initialize the D1 database

Step 1:

Run the [Postman](https://www.postman.com/), add below three APIs. 

1. http://localhost:3000/api/nl/initialize_db
2. http://localhost:3000/api/nl/insert_sample_others
3. http://localhost:3000/api/nl/insert_sample_units

Step 2:

Enter the Bearer Token for each API. 

1. Copy the 'DBINIT_SECRET' value from file `.dev.vars`.
2. In Postman -> select the REST API -> Authorization -> Select [Bearer Token] -> Paste the DBINIT_SECRET to the Token textbox
3. Repeat above step till all three APIs are done

Step 3:

Invoke the above three REST APIs in sequence.

## Development

Note: It needs to start frontend & backend respectively.

1. Start the ParcelJS for monitor frontend codes:

```sh
# At project root
$ cd frontend
$ npm run watch
```

Note: ParcelJS monitors the source codes in ~/frontend. But you still need to reload the CFW local server. See below step 2

2. Start the Cloudflare Workers local dev server:

```sh
# At project root
$ npm start
```

Important Note: You'll need to restart the backend every time when the frontend code has changed.

## Testing

The testing is performed in wrangler local. Please follow below steps:

- Start the local server: `npm start`
- Open another terminal and start testing: `npm start`

## Deployment (TODO)

1. Publish the CFW (NOT FULLY TESTED):

```sh
# At project root
$ npm run deploy
```

2. Create D1 sample database:

<TBD>

## Tenant Mobile App

Source code available on this [repo: /estate-manage-tenantapp](https://github.com/simonho288/estate-manage-tenantapp)
