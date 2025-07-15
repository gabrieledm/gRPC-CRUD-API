const path = require('path')
const { MongoClient } = require('mongodb')

const fileName = path.basename(__filename).replace('.js', '')

const dbName = 'blog'

let mongoClient
let dataBaseObject

/**
 * Execute the connection to MongoDB
 *
 * @returns {Promise<Db>} l' istanza dell' oggetto Mongo utilizzato per la connessione
 */
const connect = async () => {
  try {
    if (!dataBaseObject) {
      const dbUrl = 'mongodb://localhost:27017'
      console.info(`${fileName} >> connect >> Connection to ${dbUrl}`)
      mongoClient = await new MongoClient(dbUrl).connect()
      dataBaseObject = mongoClient.db(dbName)
      console.info(
        `${fileName} >> connect >> Connection to DB started: ${dbName}`,
      )
    }
    return dataBaseObject
  } catch (error) {
    console.error(
      `${fileName} >> connect >> error >> ${error.message}`,
    )
    return process.exit(1)
  }
}

/**
 * Execute the disconnection from MongoDB
 * @returns {Promise<void>}
 */
const disconnect = async () => {
  if (mongoClient) {
    await mongoClient.close()
    dataBaseObject = null
    console.info(
      `${fileName} >> disconnect >> Closed DB connection: ${dbName}`,
    )
  }
}

/**
 * Inserts a new document into the received collection
 *
 * @param {string} collectionName Name of the collection in which inserts the document
 * @param doc the document to be added
 */
const insertOneDocIntoCollectionSync = async (
  collectionName,
  doc,
) => {
  try {
    await connect()
    return dataBaseObject.collection(collectionName).insertOne(doc)
  } catch (error) {
    console.error(
      `${fileName} >> insertOneDocIntoCollectionSync >> Error: ${error.message}`,
    )
    throw error
  }
}

/**
 * Updates a document into the received collection
 *
 * @param {string} collectionName Name of the collection in which inserts the document
 * @param filters The filters used for the search
 * @param doc the fields to update
 */
const updateOneDocIntoCollectionSync = async (
  collectionName,
  filters,
  doc,
) => {
  try {
    await connect()
    return dataBaseObject
      .collection(collectionName)
      .updateOne(filters, { $set: doc })
  } catch (error) {
    console.error(
      `${fileName} >> insertOneDocIntoCollectionSync >> Error: ${error.message}`,
    )
    throw error
  }
}

/**
 * Removes a document from the received collection
 *
 * @param {string} collectionName Name of the collection in which inserts the document
 * @param filters the filters for the document to be deleted
 */
const removeOneDocFromCollectionSync = async (
  collectionName,
  filters,
) => {
  try {
    await connect()
    return dataBaseObject
      .collection(collectionName)
      .deleteOne(filters)
  } catch (error) {
    console.error(
      `${fileName} >> removeOneDocFromCollectionSync >> Error: ${error.message}`,
    )
    throw error
  }
}

/**
 * Returns a single document according to received filters
 *
 * @param {string} collectionName Name of the collection in which performs the search
 * @param keysToFind The filters used for the search
 * @param fieldToView Fields to view from extracted document
 * @return {Promise<*>}
 */
const findSingleDocByKeySync = async (
  collectionName,
  keysToFind,
  fieldToView,
) => {
  try {
    await connect()
    return dataBaseObject
      .collection(collectionName)
      .findOne(keysToFind, fieldToView)
  } catch (error) {
    console.error(
      `${fileName} >> findSingleDocByKeySync >> Error: ${error.message}`,
    )
    throw error
  }
}

/**
 * Returns many documents according to received filters
 *
 * @param {string} collectionName Name of the collection in which performs the search
 * @param keysToFind The filters used for the search
 * @param fieldToView Fields to view from extracted document
 * @return {Promise<*>}
 */
const findDocsByKeySync = async (
  collectionName,
  keysToFind,
  fieldToView,
) => {
  try {
    await connect()
    return dataBaseObject
      .collection(collectionName)
      .find(keysToFind, fieldToView)
      .sort({ _id: 1 })
      .toArray()
  } catch (error) {
    console.error(
      `${fileName} >> findDocsByKeySync >> Error: ${error.message}`,
    )
    throw error
  }
}

module.exports = {
  connect,
  disconnect,
  insertOneDocIntoCollectionSync,
  updateOneDocIntoCollectionSync,
  removeOneDocFromCollectionSync,
  findSingleDocByKeySync,
  findDocsByKeySync,
}
