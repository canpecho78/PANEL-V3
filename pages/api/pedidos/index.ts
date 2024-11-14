import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_NAME_COLLECTION)

  switch (req.method) {
    case 'GET':
      try {
        const pedidos = await db.collection(`${process.env.MONGODB_PEDIDOS}`)
          .find({})
          .sort({ fecha: -1 })
          .toArray()

        res.status(200).json(pedidos)
      } catch (err) {
        console.error("Error al obtener los pedidos:", err)
        res.status(500).json({ error: 'Error al obtener los pedidos' })
      }
      break

    case 'POST':
      try {
        const nuevoPedido = req.body
        const result = await db.collection(`${process.env.MONGODB_PEDIDOS}`).insertOne(nuevoPedido)
        res.status(201).json(result)

        await db.collection(`${process.env.MONGODB_HISTORIAL}`).insertOne({
          ...nuevoPedido,
          fecha: new Date()
        })

      } catch (err) {
        console.error("Error al crear el pedido:", err)
        res.status(500).json({ error: 'Error al crear el pedido' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
