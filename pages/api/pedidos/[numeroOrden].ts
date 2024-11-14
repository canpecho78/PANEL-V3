import { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../../lib/mongodb'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const client = await clientPromise
  const db = client.db(process.env.MONGODB_NAME_COLLECTION)
  const { numeroOrden } = req.query

  switch (req.method) {
    case 'PATCH':
      try {
        const { nuevoEstado } = req.body

        // Verificar si el pedido existe antes de actualizarlo
        const pedidoExistente = await db.collection(`${process.env.MONGODB_PEDIDOS}`).findOne({ numeroOrden: numeroOrden })
        
        if (!pedidoExistente) {
          return res.status(404).json({ error: 'Pedido no encontrado' })
        }

        // Actualizar en la colección de pedidos
        const resultPedidos = await db.collection(`${process.env.MONGODB_PEDIDOS}`).updateOne(
          { numeroOrden: numeroOrden },
          { 
            $set: { 
              estado: nuevoEstado.toLowerCase(),
              nuevoEstado: nuevoEstado
            }
          }
        )

        // Actualizar en la colección de historial
        const resultHistorial = await db.collection(`${process.env.MONGODB_HISTORIAL}`).updateOne(
          { numeroOrden: numeroOrden },
          { 
            $set: { 
              estado: nuevoEstado.toLowerCase(),
              nuevoEstado: nuevoEstado
            }
          },
          { upsert: true } // Crear el documento si no existe
        )

        if (resultPedidos.matchedCount === 0) {
          return res.status(404).json({ error: 'Pedido no encontrado' })
        }

        res.status(200).json({ 
          message: 'Pedido actualizado con éxito',
          pedidos: resultPedidos.modifiedCount,
          historial: resultHistorial.modifiedCount
        })
      } catch (error) {
        console.error('Error al actualizar el pedido:', error)
        res.status(500).json({ error: 'Error al actualizar el pedido' })
      }
      break

    case 'DELETE':
      try {
        // Encontrar el pedido a eliminar
        const pedidoAEliminar = await db.collection(`${process.env.MONGODB_PEDIDOS}`).findOne({ numeroOrden: numeroOrden })
        
        if (!pedidoAEliminar) {
          return res.status(404).json({ error: 'Pedido no encontrado' })
        }

        // Formatear la fecha actual según el formato de tu base de datos
        const fechaActual = new Date()
        const fechaFormateada = fechaActual.toISOString().split('T')[0].replace(/-/g, '-')
        const horaFormateada = fechaActual.toTimeString().split(' ')[0].substring(0, 5)

        // Verificar si ya existe en la colección de enviados
        const pedidoEnviado = await db.collection(`${process.env.MONGODB_ENVIADOS}`).findOne({ numeroOrden: numeroOrden })

        if (!pedidoEnviado) {
          // Preparar el documento para la colección de enviados
          const pedidoParaEnviados = {
            ...pedidoAEliminar,
            fecha: fechaFormateada,
            hora: horaFormateada,
            fechaEliminacion: {
              $date: fechaActual.toISOString()
            }
          }

          // Insertar en la colección de enviados
          await db.collection(`${process.env.MONGODB_ENVIADOS}`).insertOne(pedidoParaEnviados)
        }

        // Eliminar de la colección de pedidos
        const result = await db.collection(`${process.env.MONGODB_PEDIDOS}`).deleteOne({ numeroOrden: numeroOrden })

        if (result.deletedCount === 0) {
          return res.status(500).json({ error: 'Error al eliminar el pedido' })
        }

        res.status(200).json({ 
          message: 'Pedido transferido al historial y eliminado con éxito',
          numeroOrden: numeroOrden
        })
      } catch (error) {
        console.error('Error durante la eliminación del pedido:', error)
        res.status(500).json({ error: 'Error al procesar la eliminación del pedido' })
      }
      break

    default:
      res.setHeader('Allow', ['PATCH', 'DELETE'])
      res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}
