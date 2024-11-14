import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {


        try{
        const { email } = req.body

        if (!email) {
            return res.status(400).json({ message: 'Correo necesario!' })
        }

        const client = await clientPromise
        const db = client.db(process.env.MONGODB_NAME_COLLECTION)



        // Verificar si el email ya existe
        const existingSubscription = await db.collection(`${process.env.MONGODB_SUBSCRIPTIONS}`).findOne({ email })
        if (existingSubscription) {
            return res.status(400).json({ message: 'El correo electrónico ya está suscrito' })
        }

        // Aquí iría la lógica para manejar la suscripción

        const result = await db.collection(`${process.env.MONGODB_SUBSCRIPTIONS}`).insertOne({
            email
        })



        res.status(200).json({result, message: 'Subscription successful' })
    }catch (error) {
        console.error(error)
        return res.status(500).json({ message: 'Internal server error' })
    }
    }
}
