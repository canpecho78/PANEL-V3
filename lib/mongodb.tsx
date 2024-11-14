import { MongoClient, MongoClientOptions } from 'mongodb'

if (!process.env.MONGODB_URI) {
  throw new Error('Por favor agrega tu Mongo URI a .env.local')
}

const uri = process.env.MONGODB_URI
const options: MongoClientOptions = {}

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined
}

let client: MongoClient
let clientPromise: Promise<MongoClient>

if (process.env.NODE_ENV === 'development') {
  // En desarrollo, usa una variable global para preservar la conexión
  if (!global._mongoClientPromise) {
    client = new MongoClient(uri, options)
    global._mongoClientPromise = client.connect()
  }
  clientPromise = global._mongoClientPromise as Promise<MongoClient>
} else {
  // En producción, es mejor no usar una variable global
  client = new MongoClient(uri, options)
  clientPromise = client.connect()
}

export default clientPromise