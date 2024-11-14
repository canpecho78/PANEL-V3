'use client'

import { useState, useEffect, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Package, Clock, CheckCircle, AlertCircle, Eye } from 'lucide-react'
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface Pedido {
  [x: string]: ReactNode
  iD: number
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
  estado: 'pendiente' | 'en proceso' | 'completado' | 'procesando' | 'listo para enviar' | 'enviado'
}

interface HistorialPedidoProps {
  Dashboard: () => void
  authToken: string
}

export default function Component({ Dashboard }: HistorialPedidoProps) {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [loading, setLoading] = useState(true)
  const [blacklistedNumbers, setBlacklistedNumbers] = useState<Set<string>>(new Set())
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/')
        return
      }

      try {
        const response = await fetch('/api/check-auth', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        })
        if (response.ok) {
          setIsAuthenticated(true)
          fetchPedidos(token)
          fetchBlacklistedNumbers(token)
        } else {
          throw new Error('Not authenticated')
        }
      } catch (error) {
        console.error('Authentication error:', error)
        router.push('/')
      }
    }

    checkAuth()
  }, [router])

  const fetchPedidos = async (token: string) => {
    try {
      const response = await fetch('/api/historial', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const pedidosData = await response.json()
      setPedidos(pedidosData)
      setLoading(false)
    } catch (error) {
      console.error('Error fetching pedidos enviados:', error)
      setLoading(false)
    }
  }

  const fetchBlacklistedNumbers = async (token: string) => {
    try {
      const response = await fetch('/api/blacklist', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const blacklistedData = await response.json()
      setBlacklistedNumbers(new Set(blacklistedData.numbers))
    } catch (error) {
      console.error('Error fetching blacklisted numbers:', error)
    }
  }

  const getStatusColor = (estado: string): { variant: "default" | "secondary" | "destructive" | "outline"; className: string } => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return { variant: "outline", className: "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" }
      case 'procesando':
      case 'en proceso':
        return { variant: "destructive", className: "bg-blue-100 text-blue-800 hover:bg-blue-100" }
      case 'listo para enviar': 
        return { variant: "secondary", className: "bg-cyan-100 text-green-800 hover:bg-cyan-100" }
      case 'enviado':
      case 'completado':
        return { variant: "outline", className: "bg-green-100 text-green-800 hover:bg-green-100" }
      default:
        return { variant: "outline", className: "bg-gray-100 text-gray-800 hover:bg-gray-100" }
    }
  }

  const getStatusIcon = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'pendiente':
        return <Clock className="h-4 w-4 mr-1" />
      case 'procesando':
      case 'en proceso':
        return <Package className="h-4 w-4 mr-1" />
      case 'listo para enviar': 
        return <CheckCircle className="h-4 w-4 mr-1" />
      case 'enviado':
      case 'completado':
        return <CheckCircle className="h-4 w-4 mr-1" />
      default:
        return <AlertCircle className="h-4 w-4 mr-1" />
    }
  }

  const formatStatus = (estado: string): string => {
    switch (estado.toLowerCase()) {
      case 'completado':
        return 'Enviado'
      default:
        return estado.charAt(0).toUpperCase() + estado.slice(1)
    }
  }

  const handleSwitchChange = async (checked: boolean, telefono: string) => {
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/')
      return
    }

    try {
      const response = await fetch("/api/blacklist", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          number: pedidos.find(pedido => pedido.telefono === telefono)?.telefono,
          intent: checked ? 'add' : 'remove'
        })
      })
      if (!response.ok) {
        throw new Error('Network response was not ok')
      }
      const result = await response.json()
      console.log('Blacklist update result:', result)
      setBlacklistedNumbers(prev => {
        const newSet = new Set(prev)
        if (checked) {
          newSet.add(telefono)
        } else {
          newSet.delete(telefono)
        }
        return newSet
      })
    } catch (error) {
      console.error('Error updating blacklist:', error)
    }
  }

  if (!isAuthenticated) {
    return null // or a loading indicator
  }

  if (loading) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-lg text-gray-500">Cargando historial de pedidos...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-7xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold flex items-center justify-between">
          Historial de Pedidos
          <Button onClick={Dashboard} variant="outline">
            Volver al Dashboard
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[700px] w-full rounded-md border p-4">
          {pedidos.length === 0 ? (
            <p className="text-center text-muted-foreground">No hay pedidos en el historial.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número de Orden</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Hora</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pedidos.map((pedido) => (
                  <TableRow key={pedido.iD}>
                    <TableCell>{pedido.numeroOrden}</TableCell>
                    <TableCell>{new Date(pedido.fecha).toLocaleDateString()}</TableCell>
                    <TableCell>{new Date(pedido.fecha).toLocaleTimeString()}</TableCell>
                    <TableCell>{pedido.nombre}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={getStatusColor(pedido.estado).variant}
                        className={getStatusColor(pedido.estado).className}
                      >
                        {getStatusIcon(pedido.estado)}
                        {formatStatus(pedido.estado)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-1" />
                              Ver Detalles
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[800px]">
                            <DialogHeader>
                              <DialogTitle>Detalles del Pedido {pedido.numeroOrden}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div>
                                <h4 className="font-semibold mb-2">Resumen del Pedido</h4>
                                <p><strong>Fecha:</strong> {new Date(pedido.fecha).toLocaleString()}</p>
                                <p><strong>Hora:</strong> {new Date(pedido.fecha).toLocaleTimeString()}</p>
                                <p><strong>Cliente:</strong> {pedido.nombre}</p>
                                <p><strong>Teléfono:</strong> {pedido.telefono}</p>
                                <p><strong>Dirección:</strong> {pedido.direccionEnvio}</p>
                                <p><strong>Referencia:</strong> {pedido.referenciaOcomentario}</p>
                                <p><strong>Forma de Pago:</strong> {pedido.efectivoTarjeta}</p>
                                <p><strong>Estado:</strong> {formatStatus(pedido.estado)}</p>
                              </div>
                              <div>
                                <h4 className="font-semibold mb-2">Detalles del Pedido</h4>
                                <p><strong>Pedido:</strong> {pedido.pedido}</p>
                                <p><strong>Combo:</strong> {pedido.combo}</p>
                                <p><strong>Extras:</strong> {pedido.algoMasExtra}</p>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        <div className="flex items-center space-x-2">
                          <Switch
                            id={`switch-${pedido.iD}`}
                            checked={blacklistedNumbers.has(pedido.telefono)}
                            onCheckedChange={(checked) => handleSwitchChange(checked, pedido.telefono)}
                          />
                          <Label htmlFor={`switch-${pedido.iD}`} className="text-sm text-gray-700">
                            Pausar asistente para este usuario/cliente
                          </Label>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}