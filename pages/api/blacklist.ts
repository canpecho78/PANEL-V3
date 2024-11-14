import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'
//import { getServerSession } from "next-auth/next"
//import { authOptions } from "./auth/[...nextauth]"

const BLACKLIST_EXECUTION_ENDPOINT = (`${process.env.NEXT_PUBLIC_WS_BLACKLIST}`)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // const session = await getServerSession(req, res, authOptions)
  // console.log(session)
  // if (!session) {
  //   return res.status(401).json({ error: 'Unauthorized' })
  // }


  const client = await clientPromise
  const db = client.db(process.env.MONGODB_NAME_COLLECTION)
  const blacklistCollection = db.collection(`${process.env.MONGODB_BLACKLIST}`)

  switch (req.method) {
    case 'GET':
      try {
        const blacklist = await blacklistCollection.find({}).toArray()
        const blacklistedNumbers = blacklist.map(item => item.number)
        res.status(200).json({ numbers: blacklistedNumbers })
      } catch (err) {
        console.error("Error al obtener la lista negra:", err)
        res.status(500).json({ error: 'Error al obtener la lista negra' })
      }
      break

    case 'POST':
      try {
        const { number, intent } = req.body

        if (!number || !intent) {
          return res.status(400).json({ error: 'Número de teléfono e intención son requeridos' })
        }

        // Actualizar MongoDB
        if (intent === 'add') {
          await blacklistCollection.updateOne(
            { number },
            { $set: { number } },
            { upsert: true }
          )
        } else if (intent === 'remove') {
          await blacklistCollection.deleteOne({ number })
        } else {
          return res.status(400).json({ error: 'Intención no válida' })
        }

        // Ejecutar la acción en el endpoint externo
        const executionResponse = await fetch(BLACKLIST_EXECUTION_ENDPOINT, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            //'Authorization': `Bearer ${process.env.EXECUTION_API_TOKEN}` // Asegúrate de tener este token en tus variables de entorno
          },
          body: JSON.stringify({ number, intent })
        })

        if (!executionResponse.ok) {
          throw new Error(`Error en la ejecución: ${executionResponse.statusText}`)
        }

        const executionResult = await executionResponse.json()

        res.status(200).json({ 
          status: 'ok', 
          number, 
          intent,
          executionResult 
        })
      } catch (err) {
        console.error("Error al actualizar la lista negra:", err)
        res.status(500).json({ error: 'Error al actualizar la lista negra' })
      }
      break

    default:
      res.setHeader('Allow', ['GET', 'POST'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}