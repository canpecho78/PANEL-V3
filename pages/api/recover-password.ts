import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '@/lib/mongodb'
import { sendRecoveryEmail } from '@/lib/email'
import crypto from 'crypto'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' })
  }

  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({ message: 'Email is required' })
    }

    const client = await clientPromise
    const db = client.db(process.env.MONGODB_NAME_COLLECTION)

    // Check if user exists
    const user = await db.collection(`${process.env.MONGODB_USERS}`).findOne({ email })

    if (!user) {
      // To prevent email enumeration, we'll return a success message even if the user doesn't exist
      return res.status(200).json({ message: 'If an account with that email exists, we have sent a password reset link.' })
    }

    // Generate a unique token
    const token = crypto.randomBytes(32).toString('hex')
    const expirationTime = new Date()
    expirationTime.setHours(expirationTime.getHours() + 1) // Token expires in 1 hour

    // Save the token in the database
    await db.collection(`${process.env.MONGODB_USERS}`).updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetPasswordToken: token,
          resetPasswordExpires: expirationTime
        } 
      }
    )

    // Send recovery email
    const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`
    await sendRecoveryEmail(email, resetLink)

    res.status(200).json({ message: 'If an account with that email exists, we have sent a password reset link.' })
  } catch (error) {
    console.error('Password recovery error:', error)
    res.status(500).json({ message: 'An error occurred while processing your request.' })
  }
}