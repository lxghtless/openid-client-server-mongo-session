import {MongoSessionStore, MongoSessionStoreOptions} from '../src'
import mongoUnit from 'mongo-unit'
import {Json} from '@optum/openid-client-server/dist/json'
import {v4 as uuid} from 'uuid'
import {dissoc} from 'ramda'
import {TokenSet} from 'openid-client'

const {before, beforeEach, after, afterEach, describe, it} = intern.getPlugin(
    'interface.bdd'
)
const {expect} = intern.getPlugin('chai')

describe('mongo-session-store', () => {
    const databaseName = 'unit-test-db'
    const collectionName = 'unit-test-session-collection'
    const mongoClientOptions = {
        useUnifiedTopology: true
    }
    const storeOptions: MongoSessionStoreOptions = {
        dbName: databaseName,
        collectionName
    }
    let sessionStore: MongoSessionStore

    let mongoUrl: string

    before(async () => {
        mongoUrl = await mongoUnit.start({version: '3.6.0'})
    })

    after(async () => {
        await mongoUnit.stop()
    })

    beforeEach(async () => {
        sessionStore = await MongoSessionStore.createSessionStore(
            mongoUrl,
            storeOptions,
            mongoClientOptions
        )
    })

    afterEach(async () => {
        await sessionStore.client.close()
    })

    it('should set new sessions with patch & existing session', async () => {
        const sessionId = uuid()
        const csrfString = uuid()
        const sessionPatch: Json = {
            userInfo: {
                sub: uuid(),
                name: 'Unit Test'
            }
        }

        await sessionStore.set(sessionId, sessionPatch)

        let session = await sessionStore.get(sessionId)

        expect(session).to.not.be.undefined
        expect(session?.userInfo).to.deep.equal(
            dissoc('_id', sessionPatch.userInfo)
        )

        await sessionStore.set(sessionId, {
            csrfString
        })

        session = await sessionStore.get(sessionId)

        expect(session?.userInfo).to.deep.equal(
            dissoc('_id', sessionPatch.userInfo)
        )
        expect(session?.csrfString).to.equal(csrfString)
    })

    it('should return with TokenSet instance if session.tokenSet is defined', async () => {
        const sessionId = uuid()
        const sessionPatch: Json = {
            tokenSet: {
                access_token: uuid(),
                id_token: uuid(),
                refresh_token: uuid(),
                token_type: 'bearer',
                expires_at: 123456789101112
            }
        }

        await sessionStore.set(sessionId, sessionPatch)

        const session = await sessionStore.get(sessionId)

        expect(session).to.not.be.undefined
        expect(session?.tokenSet instanceof TokenSet).to.be.true
    })

    it('should delete a session as expected', async () => {
        const sessionId = uuid()
        const sessionPatch: Json = {}

        await sessionStore.set(sessionId, sessionPatch)

        let session = await sessionStore.get(sessionId)

        expect(session).to.not.be.undefined

        await sessionStore.destroy(sessionId)

        session = await sessionStore.get(sessionId)

        expect(session).to.be.undefined
    })

    it('should get by key value pair', async () => {
        const sessionId = uuid()
        const csrfString = uuid()
        const sessionPatch: Json = {
            csrfString
        }

        await sessionStore.set(sessionId, sessionPatch)

        let session = await sessionStore.get(sessionId)

        expect(session).to.not.be.undefined

        session = await sessionStore.getByPair('csrfString', csrfString)

        expect(session).to.not.be.undefined
        expect(session?.csrfString).to.equal(csrfString)
    })
})
