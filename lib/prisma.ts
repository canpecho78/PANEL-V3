import { PrismaClient } from '@prisma/client'



const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: ['query'],
  datasources: {
    db: {
      url: `${process.env.MONGODB_URI}/${process.env.MONGODB_NAME_COLLECTION}`
    }
  }
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export default prisma