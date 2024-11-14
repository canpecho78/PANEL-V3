import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_NAME_COLLECTION)

    switch (req.method) {
      case 'GET':
        const users = await db.collection(`${process.env.MONGODB_USERS}`).find({}).limit(10).toArray()
        res.json(users)
        break
      default:
        res.setHeader('Allow', ['GET'])
        res.status(405).end(`Method ${req.method} Not Allowed`)
    }
  } catch (e) {
    console.error(e)
    res.status(500).json({ error: 'An error occurred while connecting to the database' })
  }
}