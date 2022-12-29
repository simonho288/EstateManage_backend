# Estate Manager

<TODO>

## Features

- Cloudflare Workers: Serverless functions execute over 100 countries for users everywhere in the world.
- CFW D1 database (first queryable serverless distributed database)
- Media files upload to R2
- HonoJS ultrafast web framework works with high performance Cloudflare Workers edge serverless (300% faster than Lambda@Edge)
- TypeScript: Both frontend & backend. Easily for development & reduce programming errors
- Fomantic-UI for frontend web admin. Easy to use & over 50 built-in components and fully documented.
- Copy & paste all units from spreadsheet for estate inital setup. Easy & fast to setup the estate no matter your estate has more than thousands of units (residences, carparks and shops)
- A Flutter mobile app for tenant (source codes in another github repo) to access the backend with JWT authorization
- In web admin, implemented Cloudflare Turnstile for user signup to prevent abuse or bot visitors and protect the data privacy.
- `wrangler2` for local development and deploy
- Test with Jest `miniflare environment` (Later)

## Usage

### Installation

1. Install the packages for backend & frontend

```sh
# At project root
$ npm install
$ cd frontend
$ npm install
```

2. Then build the Semantic-UI for frontend

```sh
# At project root
$ cd frontend
$ npm run build:semantic-ui
```

3. Create D1 database

You'll need to create two databases (live & staging)

```sh
# At project root
$ wrangler d1 create EstateMan # Write down the database id
$ wrangler d1 create EstateMan_dev # Write down the database id as well
```

- Edit the `/wrangler.toml` file
- In [[env.staging.d1_databases]] section, paste the two database id to 'database_id' (live) & 'preview_database_id' (staging)

### Setup the variables

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

### Initialize the D1 database

Use Postman. Enter the Bearer Token. Invoke the below REST APIs:

1. http://localhost:3000/api/nl/initialize_db
2. http://localhost:3000/api/nl/insert_sample_others
3. http://localhost:3000/api/nl/insert_sample_units

NOTES:

- Copy the 'DBINIT_SECRET' value from file `.dev.vars` and paste to the Postman->the 3 REST APIs (above URLs)->Authorization->Type=Bearer Token->Token textbox

## Development

Note: There is required two source codes to start.

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

Note: Restart the server when the frontend codes is changed.

## Deployment

1. Publish the CFW (NOT FULLY TESTED):

```sh
# At project root
$ npm run deploy
```

2. Create D1 sample database:

<TBD>
