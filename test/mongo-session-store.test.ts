import {MongoSessionStore, MongoSessionStoreOptions} from '../src'
import mongoUnit from 'mongo-unit'
import {Json} from '@optum/openid-client-server/dist/json'
import {v4 as uuid} from 'uuid'
import {dissoc} from 'ramda'

const {before, after, describe, it} = intern.getPlugin('interface.bdd')
const {expect} = intern.getPlugin('chai')

describe('mongo-session-store', () => {
    const databaseName = 'unit-test-db'
    const collectionName = 'unit-test-session-collection'
    const mongoClientOptions = {
        useUnifiedTopology: true
    }

    let mongoUrl: string

    before(async () => {
        mongoUrl = await mongoUnit.start({version: '3.6.0'})
    })

    after(async () => {
        await mongoUnit.stop()
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
        const storeOptions: MongoSessionStoreOptions = {
            dbName: databaseName,
            collectionName
        }
        const sessionStore = await MongoSessionStore.createSessionStore(
            mongoUrl,
            storeOptions,
            mongoClientOptions
        )

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

        await sessionStore.client.close()
    })

    it('should delete a session as expected', async () => {
        const sessionId = uuid()
        const sessionPatch: Json = {}
        const storeOptions: MongoSessionStoreOptions = {
            dbName: databaseName,
            collectionName
        }
        const sessionStore = await MongoSessionStore.createSessionStore(
            mongoUrl,
            storeOptions,
            mongoClientOptions
        )

        await sessionStore.set(sessionId, sessionPatch)

        let session = await sessionStore.get(sessionId)

        expect(session).to.not.be.undefined

        await sessionStore.destroy(sessionId)

        session = await sessionStore.get(sessionId)

        expect(session).to.be.undefined

        await sessionStore.client.close()
    })

    it('should get by key value pair', async () => {
        const sessionId = uuid()
        const csrfString = uuid()
        const sessionPatch: Json = {
            csrfString
        }
        const storeOptions: MongoSessionStoreOptions = {
            dbName: databaseName,
            collectionName
        }
        const sessionStore = await MongoSessionStore.createSessionStore(
            mongoUrl,
            storeOptions,
            mongoClientOptions
        )

        await sessionStore.set(sessionId, sessionPatch)

        let session = await sessionStore.get(sessionId)

        expect(session).to.not.be.undefined

        session = await sessionStore.getByPair('csrfString', csrfString)

        expect(session).to.not.be.undefined
        expect(session?.csrfString).to.equal(csrfString)

        await sessionStore.client.close()
    })
})
