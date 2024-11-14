'use client'

import { useState, useEffect, useCallback } from 'react'
import { Bell, Package, Clock, CheckCircle, Truck, AlertCircle, SkipBack, XCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation'

interface Pedido {
  _id: string
  numeroOrden: string
  fecha: string
  pedido: string
  combo: string
  algoMasExtra: string
  nombre: string
  telefono: string
  direccionEnvio: string
  referenciaOcomentario: string
  efectivoTarjeta: string
  estado: 'pendiente' | 'en proceso' | 'completado'
  nuevoEstado?: 'Pendiente' | 'Procesando' | 'Listo para enviar' | 'Enviado'
  atendido: boolean
  selected?: boolean
}

type EstadoPedido = 'Pendiente' | 'Procesando' | 'Listo para enviar' | 'Enviado'

interface PedidosRecientesProps {
  Dashboard: () => void
  
}

export default function Component({ Dashboard }: PedidosRecientesProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [nuevoPedido, setNuevoPedido] = useState<boolean>(false)
  const { toast } = useToast()
  const router = useRouter()

  const fetchPedidos = useCallback(async () => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    try {
      const response = await fetch(`/api/pedidos`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })
      if (response.status === 401) {
        localStorage.removeItem('token')
        router.push('/')
        return
      }
      if (!response.ok) {
        throw new Error('Failed to fetch pedidos')
      }
      const data = await response.json()
      
      setPedidos(prevPedidos => {
        const updatedPedidos = data.map((pedido: Pedido) => ({
          ...pedido,
          atendido: prevPedidos.find(p => p.numeroOrden === pedido.numeroOrden)?.atendido ?? false,
          selected: prevPedidos.find(p => p.numeroOrden === pedido.numeroOrden)?.selected ?? false
        }))

        const newOrders = updatedPedidos.filter((pedido: Pedido) => 
          !prevPedidos.some(p => p.numeroOrden === pedido.numeroOrden)
        )

        if (newOrders.length > 0) {
          setNuevoPedido(true)
          setTimeout(() => setNuevoPedido(false), 3000)
        }

        return updatedPedidos
      })
    } catch (error) {
      console.error('Error fetching pedidos:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos",
        variant: "destructive",
      })
    }
  }, [toast, router])

  useEffect(() => {
    fetchPedidos()
    const interval = setInterval(fetchPedidos, 10000)
    return () => clearInterval(interval)
  }, [fetchPedidos])

  const eliminarOrden = async (numeroOrden: string) => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    try {
      const response = await fetch(`/api/pedidos/${numeroOrden}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      })
      if (response.status === 401) {
        localStorage.removeItem('token')
        router.push('/')
        return
      }
      if (!response.ok) {
        throw new Error('Failed to delete order')
      }
      setPedidos(prevPedidos => prevPedidos.filter(pedido => pedido.numeroOrden !== numeroOrden))
      toast({
        title: "Éxito",
        description: `Orden ${numeroOrden} eliminada con éxito`,
      })
      return true
    } catch (error) {
      console.error('Error al eliminar la orden:', error)
      toast({
        title: "Error",
        description: "No se pudo eliminar la orden",
        variant: "destructive",
      })
      throw error
    }
  }

  const handleCambioEstado = (numeroOrden: string, nuevoEstado: EstadoPedido) => {
    setPedidos(pedidos.map(pedido => 
      pedido.numeroOrden === numeroOrden ? { ...pedido, nuevoEstado, atendido: true } : pedido
    ))
  }

  const handleEnviarEstado = async (pedido: Pedido) => {
    if (!pedido.nuevoEstado) return
    
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    try {
      const updatedData = {
        nuevoEstado: pedido.nuevoEstado,
        telefono: pedido.telefono,
      }

      const response = await fetch(`/api/pedidos/${pedido.numeroOrden}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updatedData),
      })

      if (response.status === 401) {
        localStorage.removeItem('token')
        router.push('/')
        return
      }

      const additionalResponse = await fetch(`${process.env.NEXT_PUBLIC_WS_ENDPOINT}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          numeroOrden: pedido.numeroOrden,
          ...updatedData
        }),
      })

      if (response.ok && additionalResponse.ok) {
        if (pedido.nuevoEstado === 'Enviado') {
          await eliminarOrden(pedido.numeroOrden)
        } else {
          setPedidos(pedidosActuales => pedidosActuales.map(p => 
            p.numeroOrden === pedido.numeroOrden
              ? { ...p, estado: pedido.nuevoEstado!.toLowerCase() as 'pendiente' | 'en proceso' | 'completado' , nuevoEstado: undefined, atendido: true }
              : p
          ))
        }
        toast({
          title: "Éxito",
          description: `Estado de la orden ${pedido.numeroOrden} actualizado a ${pedido.nuevoEstado}`,
        })
      } else {
        throw new Error('Error al actualizar el estado del pedido')
      }
    } catch (error) {
      console.error('Error al enviar la actualización:', error)
      toast({
        title: "Error",
        description: `No se pudo actualizar el estado de la orden ${pedido.numeroOrden}`,
        variant: "destructive",
      })
    }
  }

  const getStatusColor = (estado: string): { variant: "default" | "secondary" | "destructive" | "outline"; className: string } => {
    switch (estado) {
      case 'pendiente':
        return { variant: "outline", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" }
      case 'procesando':
        return { variant: "destructive", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" }
      case 'listo para enviar': 
        return { variant: "secondary", className: "bg-cyan-100 text-green-800 hover:bg-cyan-100" }
      case 'enviado':
        return { variant: "outline", className: "bg-green-100 text-green-800 hover:bg-green-100" }
      case 'Cancelado':
        return { variant: "destructive", className: "bg-red-100 text-red-800 hover:bg-red-100" }
      default:
        return { variant: "outline", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" }
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado) {
      case 'pendiente':
        return <Clock className="h-4 w-4 mr-1" />
      case 'procesando':
        return <Package className="h-4 w-4 mr-1" />
      case 'listo para enviar': 
        return <CheckCircle className="h-4 w-4 mr-1" />
      case 'enviado':
        return <CheckCircle className="h-4 w-4 mr-1" />
      case 'Cancelado':
        return <XCircle className="h-4 w-4 mr-1" />
      default:
        return <AlertCircle className="h-4 w-4 mr-1" />
    }
  }

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center justify-between">
          Pedidos Recientes
          <div className="flex items-center space-x-2">
            <Badge variant={nuevoPedido ? "destructive" : "outline"} className="transition-all duration-300">
              <Bell className="h-4 w-4 mr-1" />
              {nuevoPedido ? "Nuevo Pedido" : "Sin Nuevos Pedidos"}
            </Badge>
            <Button onClick={Dashboard} variant="outline">
              <SkipBack className="mr-2 h-4 w-4" /> Regresar
            </Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[700px] w-full rounded-md border p-4">
          {pedidos.length === 0 ? (
            <p className="text-center text-muted-foreground">No hay pedidos recientes.</p>
          ) : (
            pedidos.map((pedido) => (
              <Card key={pedido.numeroOrden} className={`mb-4 ${pedido.atendido ? '' : 'border-red-500 border-2'}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-lg font-semibold">Orden: {pedido.numeroOrden}</h3>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusColor(pedido.estado).variant} className={getStatusColor(pedido.estado).className}>
                        {getStatusIcon(pedido.estado)}
                        {pedido.estado === 'completado' ? 'Enviado' : pedido.estado}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">Fecha: {new Date(pedido.fecha).toLocaleString()}</p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                    <div><strong>Cliente:</strong> {pedido.nombre}</div>
                    <div><strong>Teléfono:</strong> {pedido.telefono}</div>
                    <div><strong>Pedido:</strong> {pedido.pedido}</div>
                    <div><strong>Combo:</strong> {pedido.combo}</div>
                    <div><strong>Extra:</strong> {pedido.algoMasExtra}</div>
                    <div><strong>Pago:</strong> {pedido.efectivoTarjeta}</div>
                  </div>
                  <div className="mb-2"><strong>Dirección:</strong> {pedido.direccionEnvio}</div>
                  <div className="mb-2"><strong>Referencia:</strong> {pedido.referenciaOcomentario}</div>
                  <div className="flex items-center justify-between mt-2">
                    <Select 
                      value={pedido.nuevoEstado || ''} 
                      onValueChange={(value: EstadoPedido) => handleCambioEstado(pedido.numeroOrden, value)}
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Cambiar estado" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Pendiente">Pendiente</SelectItem>
                        <SelectItem value="Procesando">Procesando</SelectItem>
                        <SelectItem value="Listo para enviar">Listo para enviar</SelectItem>
                        <SelectItem value="Enviado">Enviado</SelectItem>
                        <SelectItem value="Cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button 
                      onClick={() => handleEnviarEstado(pedido)} 
                      disabled={!pedido.nuevoEstado} 
                      className="w-auto"
                      title="Actualizar y notificar al cliente"
                    >
                      <Truck className="mr-2 h-4 w-4" /> Actualizar Estado
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}