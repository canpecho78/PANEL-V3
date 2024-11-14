import { NextApiRequest, NextApiResponse } from 'next'
import { PrismaClient } from '@prisma/client'
import {  subDays, startOfDay, endOfDay } from 'date-fns'

const prisma = new PrismaClient()

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      // Obtener ventas diarias (últimos 7 días)
      const sevenDaysAgo = subDays(new Date(), 7)
      const ventasDiarias = await prisma.enviados_enviados.groupBy({
        by: ['fecha'],
        where: {
          estado: 'enviado',
          fecha: {
            gte: startOfDay(sevenDaysAgo),
            lte: endOfDay(new Date()),
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          fecha: 'desc',
        },
      })

      // Obtener pedidos por estado
      const pedidosPorEstado = await prisma.historialDePedidos.groupBy({
        by: ['estado'],
        _count: {
          id: true,
        },
      })

      // Obtener productos más vendidos
      const productosMasVendidos = await prisma.enviados_enviados.groupBy({
        by: ['pedido'],
        where: {
          estado: 'enviado',
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: 'desc',
          },
        },
        take: 5,
      })

      // Formatear la respuesta
      const response = {
        ventasDiarias: ventasDiarias.map(item => ({
          fecha: item.fecha.toISOString().split('T')[0],
          ventas: item._count.id,
        })),
        pedidosPorEstado: pedidosPorEstado.map(item => ({
          estado: item.estado || 'sin estado',
          cantidad: item._count.id,
        })),
        productosMasVendidos: productosMasVendidos.map(item => ({
          producto: item.pedido,
          cantidad: item._count.id,
        })),
      }

      res.status(200).json(response)
    } catch (err) {
      console.error('Error al obtener las estadísticas:', err)
      res.status(500).json({ 
        error: 'Error al obtener las estadísticas',
        details: err instanceof Error ? err.message : 'Error desconocido'
      })
    } finally {
      await prisma.$disconnect()
    }
  } else {
    res.setHeader('Allow', ['GET'])
    res.status(405).end(`Method ${req.method} Not Allowed`)
  }
}