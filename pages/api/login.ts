import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '@/lib/mongodb'
import { compare } from 'bcryptjs'
import jwt from 'jsonwebtoken'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email, password } = req.body

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' })
    }

    // Connect to MongoDB
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_NAME_COLLECTION)

    // Find user
    const user = await db.collection('users').findOne({ email })

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Compare password
    const isPasswordValid = await compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    // Create JWT token
    if (!process.env.JWT_SECRET) {
      throw new Error('JWT_SECRET is not defined')
    }

    const token = jwt.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        codigo: user.codigo
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '30d'
      }
    )

    // Return success response
    return res.status(200).json({
      token,
      user: {
        id: user._id.toString(),
        email: user.email,
        codigo: user.codigo
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ message: 'Internal server error' })
  }
}