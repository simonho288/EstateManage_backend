# Estate Manager

<TODO>

## Features

- Cloudflare Workers
- database using D1
- upload to R2
- TypeScript
- `wrangler` for develop and deploy
- Test with Jest `miniflare environment`

## Usage

Install dependencies:

```sh
yarn install
```

Setup the variables:

- Rename example.wrangler.toml -> wrangler.toml
- Enter the values inside wrangler.toml

Run a development server:

```sh
yarn dev
```

Publish:

```sh
yarn deploy
```

Create D1 sample database:

```sh
$ wrangler d1 create EstateMan
$ wrangler d1 execute EstateMan --local --file ./createTables.sql
```
Ref: https://developers.cloudflare.com/d1/wrangler-commands/
