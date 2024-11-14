'use client'

import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ShoppingBag, 
  BarChart2, 
  User, 
  LogOut, 
  ChevronDown, 
  ChevronUp,
  Home,
  Menu
} from 'lucide-react'
import PedidosRecientes from '@/pages/dashboard/pedidos-recientes'
import PedidosEnviados from '@/pages/dashboard/pedidos-enviados'
import HistorialPedidos from '@/pages/dashboard/historial-pedidos'
import EstadisticasPedidos from '@/pages/dashboard/estadisticas-pedidos'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Dashboard() {
  const router = useRouter()
  const [isOrdersOpen, setIsOrdersOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('welcome')
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No token found');
        }
        const response = await fetch('/api/check-auth', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.ok) {
          setIsAuthenticated(true);
        } else {
          throw new Error('Authentication failed');
        }
      } catch (error) {
        console.error('Error checking authentication:', error);
        router.push('/');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth()
  }, [router])

  
const handleLogout = async () => {
  try {
    localStorage.removeItem('token');
    router.push('/');
  } catch (error) {
    console.error('Error durante el cierre de sesión:', error);
  }
};

  const handleReturnHome = () => {
    setActiveSection('welcome')
  }

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen)

  const Sidebar = () => (
    <div className="h-full bg-white shadow-md">
      <div className="p-4">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Anka%20Studios-N4yoD8K3i61BOc8d98cvw7dekX0Hx5.png"
          alt="Anka Studios Logo"
          width={75}
          height={75}
          className="mb-1"
          priority
        />
      </div>
     
      <nav className="mt-4">
        <div>
          <button
            onClick={() => setIsOrdersOpen(!isOrdersOpen)}
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            <ShoppingBag className="mr-2" size={20} />
            Pedidos
            {isOrdersOpen ? (
              <ChevronUp className="ml-auto" size={20} />
            ) : (
              <ChevronDown className="ml-auto" size={20} />
            )}
          </button>
          {isOrdersOpen && (
            <div className="pl-8">
              <button onClick={() => { setActiveSection('recent-orders'); setIsSidebarOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                Pedidos Recientes
              </button>
              <button onClick={() => { setActiveSection('sent-orders'); setIsSidebarOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                Pedidos Enviados     
              </button>
              <button onClick={() => { setActiveSection('history'); setIsSidebarOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">
                Historial de Pedidos
              </button>
            </div>
          )}
        </div>
        <button onClick={() => { setActiveSection('statistics'); setIsSidebarOpen(false); }} className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100 w-full">
          <BarChart2 className="mr-2" size={20} />
          Estadísticas de Pedidos
        </button>
        <div className="absolute bottom-0 w-full">
          <Link href="/dashboard/perfil" className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100">
            <User className="mr-2" size={20} />
            Perfil
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
          >
            <LogOut className="mr-2" size={20} />
            Cerrar Sesión
          </button>
        </div>
      </nav>
    </div>
  )

  if (isLoading) {
    return <div>Cargando...</div>
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-white shadow-md p-1 flex justify-between items-center md:hidden">
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Anka%20Studios-N4yoD8K3i61BOc8d98cvw7dekX0Hx5.png"
          alt="Anka Studios Logo"
          width={50}
          height={50}
          priority  
        />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" onClick={toggleSidebar}>
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="p-0">
            <Sidebar />
          </SheetContent>
        </Sheet>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden md:block w-64 bg-white shadow-md">
          <Sidebar />
        </aside>

        <main className="flex-1 p-4 md:p-8 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              {activeSection === 'welcome' && 'Bienvenido al Dashboard'}
              {activeSection === 'recent-orders' && 'Pedidos Recientes'}
              {activeSection === 'statistics' && 'Estadísticas de Pedidos'}
            </h2>
            <Button variant="outline" onClick={handleReturnHome}>
              <Home className="mr-2 h-4 w-4" /> Inicio
            </Button>
          </div>

          {activeSection === 'welcome' && (
            <>
              <p className="text-gray-600 mb-6">Selecciona una opción del menú para comenzar.</p>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">$45,231.89</div>
                    <p className="text-xs text-muted-foreground">+20.1% desde el último mes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Nuevos Clientes</CardTitle>
                    <User className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+2350</div>
                    <p className="text-xs text-muted-foreground">+180.1% desde el último mes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pedidos Activos</CardTitle>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+12,234</div>
                    <p className="text-xs text-muted-foreground">+19% desde el último mes</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pedidos Pendientes</CardTitle>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">+573</div>
                    <p className="text-xs text-muted-foreground">+201 desde ayer</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {activeSection === 'recent-orders' && (
            <PedidosRecientes 
              Dashboard={() => setActiveSection('welcome')}
            />
          )}
          {activeSection === 'sent-orders' && (
            <PedidosEnviados 
              Dashboard={() => setActiveSection('welcome')} authToken={''}            />
          )}

          {activeSection === 'history' && (
            <HistorialPedidos 
              Dashboard={() => setActiveSection('welcome')} authToken={''}            />
          )}

          {activeSection === 'statistics' && (
            <EstadisticasPedidos 
              Dashboard={() => setActiveSection('welcome')} authToken={''}            />
          )}

          {activeSection === 'statistics' && (
            <Card>
              <CardHeader>
                <CardTitle>Estadísticas de Pedidos</CardTitle>
              </CardHeader>
              <CardContent>
                <p>Aquí irían los gráficos y estadísticas detalladas de los pedidos.</p>
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </div>
  )
}