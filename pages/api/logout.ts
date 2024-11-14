import { NextApiRequest, NextApiResponse } from 'next'
import { serialize } from 'cookie'

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Set-Cookie', serialize('session', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV !== 'development',
    expires: new Date(0),
    sameSite: 'strict',
    path: '/'
  }))
  res.status(200).json({ message: 'Logged out successfully' })
}