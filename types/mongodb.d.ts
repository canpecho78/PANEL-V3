import { MongoClient as MongoClientType, Db } from 'mongodb'

declare module 'mongodb' {
  interface ConnectOptions {
    useNewUrlParser?: boolean
    useUnifiedTopology?: boolean
  }

  export class MongoClient {
    constructor(uri: string, options?: ConnectOptions)
    connect(): Promise<MongoClientType>
    db(name?: string): Db
  }
}