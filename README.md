# EstateManage.Net (Beta)

![Estate Manage](https://repository-images.githubusercontent.com/569517058/3376365d-a1c2-409f-8342-4e481e2584d0)

> EstateManage.Net is currently a `Work In Progress`.
>
> This is the backend repo for the estate admin. There is a [tenant mobile app repo](https://github.com/simonho288/EstateManage_tenantapp)

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
$ wrangler d1 create EstateMan_dev # Write down the database id. This is the value of <YOUR_STAGING_DATABASE_ID> needs below
$ wrangler d1 create EstateMan # Write down the database id. This is <YOUR_PRODUCTION_DATABASE_ID>
```

3. Create a `wrangler.toml` file

- In the root direction. Create a `wrangler.toml` by copy the `example.wrangler.toml`.
- Replace the <YOUR_XXX> values with the real values.
- For your convenience, you can generate encryption keys via this online webapp: https://www.allkeysgenerator.com/Random/Security-Encryption-Key-Generator.aspx

### Setup the variables for frontend

For frontend config, create a `frontend/src/libs/config.js` with below contents:

```javascript
export let Config = {
  unitQrAppDownloadUrl: '<YOUR_URL_FOR_MOBILE_APP_DOWNLOAD>',
  tenantAppAndroidUrl: '<URL_OF_YOUR_ANDROID_APP_ON_PLAYSTORE>',
  tenantAppIOSUrl: '<URL_OF_YOUR_IOS_APP_ON_APPSTORE>',
}
```

### Initialize the D1 database for development

- Generate a encryption key via the webapp (mentioned above).
- Copy the value to the 'DBINIT_SECRET' in the file `wrangler.toml`.
- Run below commands in terminal to initialise the D1 database:

```sh
$ curl http://localhost:3000/api/nl/initialize_db -H "Accept: application/json" -H "Authorization: Bearer <DBINIT_SECRET>"
$ curl http://localhost:3000/api/nl/insert_sample_others -H "Accept: application/json" -H "Authorization: Bearer <DBINIT_SECRET>"
$ curl http://localhost:3000/api/nl/insert_sample_units -H "Accept: application/json" -H "Authorization: Bearer <DBINIT_SECRET>"
```

## Local Development Server

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

3. Login to the Admin console

- Browse http://localhost:3000/public/index.html
- The login info is assigned by INITIAL_ADMIN_EMAIL & INITIAL_ADMIN_PASSWORD in the `.dev.vars` file.

Important Note: You'll need to restart the backend every time when the frontend code has changed.

## Testing

There are two unit tests for frontend and backend respectively.

### 1/2 Backend Unit Tests

The testing is performed in wrangler local. Please follow below steps:

Step 1: At project root, start the local server: `npm start`

Step 2: Reset the database by these two commands:

- WARNING: Reset the database will remove all existing data in db.
- NOTE: Below commands require the `DBINIT_SECRET` value which you entered in the `.dev.vars` file. See above section 'Setup the backend specific values'

```sh
$ curl http://localhost:3000/api/nl/insert_sample_others -H "Accept: application/json" -H "Authorization: Bearer <DBINIT_SECRET VALUE>"
```

And then below command:

```sh
$ curl http://localhost:3000/api/nl/insert_sample_units -H "Accept: application/json" -H "Authorization: Bearer <DBINIT_SECRET VALUE>"
```

Step 3: Open another terminal session and start unit tests by running this command: `npm run test:backend`

### 2/2 Frontend Unit Tests

- At project root, run this command: `npm run test:frontend`

## Deployment (NOT FULLY TESTED)

1. Publish the CFW:

Make sure you have a Cloudflare Workers account. Then execute below commands:

```sh
# At project root
$ npm run build:frontend:deploy
$ npm run deploy
```

2. Create D1 sample database:

<TBD>
