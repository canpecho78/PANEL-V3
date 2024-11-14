import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Método no permitido' })
  }

  try {
    // Conectar a MongoDB y obtener los pedidos
    const client = await clientPromise
    const db = client.db(process.env.MONGODB_NAME_COLLECTION)
    const pedidosCollection = db.collection(`${process.env.MONGODB_HISTORIAL}`)  

    // Obtener todos los pedidos ordenados por fecha descendente
    const pedidos = await pedidosCollection
      .find({})
      .sort({ fecha: -1 })
      .toArray()

    // Transformar los datos para que coincidan con la interfaz Pedido
    const pedidosFormateados = pedidos.map(pedido => ({
      iD: pedido.ID,
      numeroOrden: pedido.numeroOrden,
      fecha: pedido.fecha,
      hora: pedido.hora,
      pedido: pedido.pedido,
      combo: pedido.combo || 'Sin combo',
      algoMasExtra: pedido.algoMasExtra || 'Sin extras',
      nombre: pedido.nombre,
      telefono: pedido.telefono,
      direccionEnvio: pedido.direccionEnvio,
      referenciaOcomentario: pedido.referenciaOcomentario,
      efectivoTarjeta: pedido.efectivoTarjeta,
      estado: pedido.estado || 'pendiente'
    }))

    return res.status(200).json(pedidosFormateados)
  } catch (error) {
    console.error('Error al obtener el historial de pedidos:', error)
    return res.status(500).json({ 
      message: 'Error al obtener el historial de pedidos',
      error: error instanceof Error ? error.message : 'Error desconocido'
    })
  }
}