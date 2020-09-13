/* eslint-disable unicorn/no-null */
// TODO: switch to root import once @optum/openid-client-server publishes the next package update
import {Json} from '@optum/openid-client-server/dist/json'
import {Session, SessionStore} from '@optum/openid-client-server/dist/session'
import assert from 'assert'
import {Collection, MongoClient, MongoClientOptions} from 'mongodb'

export interface MongoSessionStoreOptions {
    collectionName: string
    dbName: string
}

/**
 * Class representing a SessionStore with a Mongo DB implementation
 * @implements SessionStore
 */
export class MongoSessionStore implements SessionStore {
    client: MongoClient
    storeOptions: MongoSessionStoreOptions
    _sessionCollection: Collection<Session> | undefined

    /**
     * Create a MongoSessionStore.
     * @param {MongoClient} client - MongoClient instance.
     */
    constructor(client: MongoClient, storeOptions: MongoSessionStoreOptions) {
        this.client = client
        this.storeOptions = storeOptions
        assert(
            this.storeOptions.collectionName,
            'storeOptions.collectionName is required by MongoSessionStore'
        )
        assert(
            this.storeOptions.dbName,
            'storeOptions.dbName is required by MongoSessionStore'
        )
    }

    static async createSessionStore(
        url: string,
        storeOptions: MongoSessionStoreOptions,
        options?: MongoClientOptions
    ): Promise<MongoSessionStore> {
        return new MongoSessionStore(
            await MongoClient.connect(url, options),
            storeOptions
        )
    }

    get sessionCollection(): Collection<Session> {
        if (!this._sessionCollection) {
            this._sessionCollection = this.client
                .db(this.storeOptions.dbName)
                .collection<Session>(this.storeOptions.collectionName)
        }
        return this._sessionCollection
    }

    /*
        NOTE: consider removing this from the interface in @optum/openid-client-server
        as it doesn't appear to be used
    */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async clear(): Promise<void> {}

    async destroy(sessionId: string): Promise<void> {
        await this.sessionCollection.deleteOne({sessionId})
    }

    // TODO: Consider change return type to Promise<Session | null | undefined> in @optum/openid-client-server to support responses like MongoClient.
    async get(sessionId: string): Promise<Session | undefined> {
        const session = await this.sessionCollection.findOne({sessionId})

        if (session) {
            return session
        }
    }

    // TODO: Consider change return type to Promise<Session | null | undefined> in @optum/openid-client-server to support responses like MongoClient.
    async getByPair(key: string, value: string): Promise<Session | undefined> {
        const queryFilter: {[x: string]: string} = {}
        queryFilter[key] = value

        const session = await this.sessionCollection.findOne(queryFilter)

        if (session) {
            return session
        }
    }

    // TODO: Consider moving to Partial<Session> from Json type in @optum/openid-client-server
    async set(sessionId: string, sessionPatch: Json): Promise<void> {
        let session = await this.get(sessionId)

        if (!session) {
            session = {
                sessionId,
                createdAt: Date.now(),
                csrfString: null,
                codeVerifier: null,
                tokenSet: null,
                userInfo: null,
                sessionState: null,
                fromUrl: null,
                securedPathFromUrl: null
            }
        }

        this.sessionCollection.findOneAndUpdate(
            {sessionId},
            {$set: Object.assign(session, sessionPatch)},
            {upsert: true}
        )
    }
}

export default MongoSessionStore
