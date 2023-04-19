const MongoDriver = require('mongodb')

const DB_NAME = 'iot-nervous-system'

const MONGO_URI = 'mongodb://localhost:27017'

const client = new MongoDriver.MongoClient(MONGO_URI)

client.on('open', () => console.log('MongoDb connected successfully'))
client.on('close', () => console.log('MongoDb connection closed'))

const dbName = process.env.ENV === 'test' ? `${DB_NAME}-test` : DB_NAME
const db = client.db(dbName)

const getCollectionWrapper = (collection, ...options) => {
  return db.collection(collection, ...options)
}

const dbProxy = new Proxy(db, {
  get (_, prop) {
    if (prop === 'collection') {
      return getCollectionWrapper
    }
    return Reflect.get(...arguments)
  }
})

const hooks = {
  client,
  db: dbProxy,
  Id: MongoDriver.ObjectId,
  collection: collName => dbProxy.collection(collName)
}

module.exports = hooks
