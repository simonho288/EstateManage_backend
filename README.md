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

### Install the dependencies:

```sh
# At project root
$ npm install
$ cd frontend
$ npm install
$ npm run build:semantic-ui
```

### Setup the variables:

- Rename example.wrangler.toml -> wrangler.toml
- Enter the values inside wrangler.toml

### Initialize the D1 database:

Use Postman. Enter the Bearer Token. Invoke the below Rest APIs:

1. http://localhost:8787/api/nl/initialize_db
2. http://localhost:8787/api/nl/insert_sample_others
3. http://localhost:8787/api/nl/insert_sample_units

IMPORTANT NOTE: Don't invoke the `insert_sample_others` & `insert_sample_units` on live server because it creates sample Admin user.

## Development

Note: There is required two source codes to start.

1. Start the parcelJs for monitor frontend codes:

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
