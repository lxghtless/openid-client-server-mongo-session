<h2 align="center">@lxghtless/openid-client-server-mongo-session</h2>

<p align="center">
    A Mongo DB session store for 
	<a href="https://www.npmjs.com/package/@optum/openid-client-server">
		@optum/openid-client-server
	</a>.
</p>

<p align="center">
	<a href="https://www.npmjs.com/package/@lxghtless/openid-client-server-mongo-session">
		<img src="https://img.shields.io/npm/v/@lxghtless/openid-client-server-mongo-session?color=blue" />
	</a>
	<a href="https://www.typescriptlang.org/">
		<img src="https://aleen42.github.io/badges/src/typescript.svg" />
	</a>
	<a href="https://eslint.org/">
		<img src="https://aleen42.github.io/badges/src/eslint.svg" />
	</a>
</p>

<p align="center">
  <h3 align="center">Install</h3>
</p>

<pre align="center">npm i @lxghtless/openid-client-server-mongo-session</pre>

<br />

<pre align="center">yarn add @lxghtless/openid-client-server-mongo-session</pre>

### Basic Usage

```ts
import {
    MongoSessionStore,
    MongoSessionStoreOptions
} from '@lxghtless/openid-client-server-mongo-session'

const mongoUrl = 'mongodb://mongodb0.example.com:27017'
const storeOptions: MongoSessionStoreOptions = {
    dbName: 'openid-session-db',
    collectionName: 'openIdSessions'
}

const sessionStore = await MongoSessionStore.createSessionStore(
    mongoUrl,
    storeOptions
)
```

### Pre-Created MongoClient

```ts
import {MongoClient} from 'mongodb'
import {
    MongoSessionStore,
    MongoSessionStoreOptions
} from '@lxghtless/openid-client-server-mongo-session'

const mongoUrl = 'mongodb://mongodb0.example.com:27017'
const storeOptions: MongoSessionStoreOptions = {
    dbName: 'openid-session-db',
    collectionName: 'openIdSessions'
}

const mongoClient = new MongoClient(mongoUrl)
const sessionStore = new MongoSessionStore(mongoClient, storeOptions)
```
