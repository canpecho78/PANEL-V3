'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, BarChart, Bar, Tooltip } from "recharts"
import { Button } from "@/components/ui/button"

interface EstadisticasPedidosProps {
  Dashboard: () => void
  authToken: string
}

interface DatosEstadisticas {
  ventasDiarias: { fecha: string; ventas: number }[]
  pedidosPorEstado: { estado: string; cantidad: number }[]
  productosMasVendidos: { producto: string; cantidad: number }[]
}

export default function EstadisticasPedidos({ Dashboard }: EstadisticasPedidosProps) {
  const [datos, setDatos] = useState<DatosEstadisticas | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        router.push('/login')
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
          fetchEstadisticas(token)
        } else {
          throw new Error('Not authenticated')
        }
      } catch (error) {
        console.error('Authentication error:', error)
        setError('Error de autenticación. Por favor, inicie sesión nuevamente.')
        router.push('/login')
      }
    }

    checkAuth()
  }, [router])

  const fetchEstadisticas = async (token: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/estadisticas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
      if (!response.ok) {
        throw new Error('Error al obtener las estadísticas')
      }
      const data = await response.json()
      setDatos(data)
    } catch (error) {
      console.error('Error:', error)
      setError('No se pudieron cargar las estadísticas. Por favor, intente nuevamente.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return <Card className="w-full"><CardContent className="p-6">Verificando autenticación...</CardContent></Card>
  }

  if (loading) {
    return <Card className="w-full"><CardContent className="p-6">Cargando estadísticas...</CardContent></Card>
  }

  if (error) {
    return <Card className="w-full"><CardContent className="p-6">{error}</CardContent></Card>
  }

  if (!datos) {
    return <Card className="w-full"><CardContent className="p-6">No se pudieron cargar las estadísticas</CardContent></Card>
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <span>Estadísticas de Pedidos</span>
          <Button onClick={Dashboard} variant="outline">
            Volver al Dashboard
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="ventas" className="space-y-4">
          <TabsList>
            <TabsTrigger value="ventas">Pedidos Diarios</TabsTrigger>
            <TabsTrigger value="estados">Pedidos por Estado</TabsTrigger>
            <TabsTrigger value="productos">Productos Más Vendidos</TabsTrigger>
          </TabsList>
          <TabsContent value="ventas" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos Diarios (Enviados)</CardTitle>
                <CardDescription>Resumen de pedidos enviados en los últimos 7 días</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={datos.ventasDiarias}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="fecha" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="ventas" stroke="#8884d8" name="Pedidos" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="estados" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos por Estado</CardTitle>
                <CardDescription>Distribución de pedidos según su estado actual</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datos.pedidosPorEstado}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="estado" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cantidad" fill="#82ca9d" name="Cantidad" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="productos" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Productos Más Vendidos (Enviados)</CardTitle>
                <CardDescription>Top 5 productos con mayor número de pedidos enviados</CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={datos.productosMasVendidos} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="producto" type="category" width={150} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="cantidad" fill="#8884d8" name="Cantidad" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}