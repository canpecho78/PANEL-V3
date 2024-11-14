import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'    

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_NAME_COLLECTION)

  switch (req.method) {
    case 'GET':
      try {
        const pedidos = await db.collection(`${process.env.MONGODB_ENVIADOS}`).find({}).sort({ fecha: -1 }).toArray()
        res.status(200).json(pedidos)
      } catch (err) {
        console.error("Error al obtener los pedidos:", err)
        res.status(500).json({ error: 'Error al obtener los pedidos' })
      }
      break

    default:
      res.setHeader('Allow', ['GET'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}