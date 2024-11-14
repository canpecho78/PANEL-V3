import { prisma } from './lib/prisma'

async function main() {
  try {
    const user = await prisma.users.findFirst()
    console.log('¡Conexión exitosa!')
    console.log('Primer usuario:', user)
  } catch (error) {
    console.error('Error al conectar con la base de datos:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()