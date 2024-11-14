import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'
import { hash } from 'bcryptjs'




export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Método no permitido' })
  }

  try {
    const { email, password, codigo, nombre, apellido, username, telefono } = req.body

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_NAME_COLLECTION)

    // Verificar si el email ya existe
    const existingUser = await db.collection(`${process.env.MONGODB_USERS}`).findOne({ email })
    if (existingUser) {
      return res.status(400).json({ message: 'Este correo ya existe' })
    }

    // Contraseña encriptada
    const hashedPassword = await hash(password, 10)

    // Crear nuevo usuario
    const result = await db.collection(`${process.env.MONGODB_USERS}`).insertOne({
      email,
      password: hashedPassword,
      codigo,
      nombre,
      apellido,
      username,
      telefono,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    return res.status(201).json({ 
      message: 'Usuario creado exitosamente', 
      userId: result.insertedId,
      user: {
        email,
        codigo,
        nombre,
        apellido,
        username,
        telefono
      }
    })
  } catch (error) {
    console.error('Error en el registro:', error)
    return res.status(500).json({ message: 'Error interno del servidor' })
  }
}