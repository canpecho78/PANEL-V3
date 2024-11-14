'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import Login from '@/components/Login'
import Register from '@/components/Register'

export default function Home() {
  const [email, setEmail] = useState('')
  const [isLogin, setIsLogin] = useState(true)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (response.ok) {
        toast({
          title: "Suscripción exitosa",
          description: "Gracias por suscribirte a nuestras actualizaciones.",
        })
        setEmail('')
      } else {
        throw new Error('Error en la suscripción')
      }
    } catch (err) {
      console.error("Error en la suscripción:", err)
      toast({
        title: "Error",
        description: "Hubo un problema al procesar tu suscripción. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <nav className="max-w-0xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center h-16">
          <div className="flex-shrink-0">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Anka%20Studios-N4yoD8K3i61BOc8d98cvw7dekX0Hx5.png"
              alt="Anka Studios Logo"
              width={40}
              height={40}
              priority
            />
          </div>
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <a href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Inicio</a>
              <a href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Características</a>
              <a href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Precios</a>
              <a href="#" className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium">Contacto</a>
            </div>
          </div>
          <div>
            <Button variant="outline" onClick={() => setIsLogin(true)}>Iniciar sesión</Button>
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow">
        {isLogin ? (
          <Login onSwitchToRegister={() => setIsLogin(false)} />
        ) : (
          <Register onSwitchToLogin={() => setIsLogin(true)} />
        )}

        {/* Features Section */}
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="lg:text-center">
              <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Características</h2>
              <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
                Una mejor manera de gestionar tus servicios como empresa
              </p>
              <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
                Descubre por qué Anka Studios es la solución perfecta para gestionar tus servicios como empresa.
              </p>
            </div>

            <div className="mt-10">
              <dl className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
                {[
                  {
                    name: 'Flexibilidad de formato',
                    description: 'Elige el formato que mejor se ajuste a tus necesidades.',
                  },
                  {
                    name: 'Colaboración en tiempo real',
                    description: 'Trabaja con tu equipo en tiempo real, sin importar dónde estén.',
                  },
                  {
                    name: 'Rendimiento optimizado',
                    description: 'Disfruta de un rendimiento rápido y fluido en todos tus proyectos.',
                  },
                  {
                    name: 'Soporte 24/7',
                    description: 'Nuestro equipo de soporte está siempre disponible para ayudarte.',
                  },
                ].map((feature) => (
                  <div key={feature.name} className="relative">
                    <dt>
                      <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                        {/* Icon placeholder */}
                      </div>
                      <p className="ml-16 text-lg leading-6 font-medium text-gray-900">{feature.name}</p>
                    </dt>
                    <dd className="mt-2 ml-16 text-base text-gray-500">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-indigo-700">
          <div className="max-w-2xl mx-auto text-center py-16 px-4 sm:py-20 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
              <span className="block">¿Listo para empezar?</span>
              <span className="block">Empieza tu prueba gratuita hoy.</span>
            </h2>
            <p className="mt-4 text-lg leading-6 text-indigo-200">
              Únete a miles de clientes y empieza a disfrutar de nuestros servicios
            </p>
            <form onSubmit={handleSubmit} className="mt-8 sm:flex justify-center">
              <Label htmlFor="email-subscription" className="sr-only">Dirección de correo electrónico</Label>
              <Input
                id="email-subscription"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full px-5 py-3 placeholder-gray-500 focus:ring-offset-indigo-700 focus:ring-white focus:ring-offset-2 focus:ring-2"
                placeholder="Ingresa tu email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <div className="mt-3 sm:mt-0 sm:ml-3">
                <Button type="submit" className="w-full flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50 sm:w-auto">
                  Comenzar prueba gratuita
                </Button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-center space-x-6">
            {['Facebook', 'Instagram', 'Twitter', 'GitHub', 'LinkedIn'].map((item) => (
              <a key={item} href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">{item}</span>
                {/* Social icon placeholder */}
              </a>
            ))}
          </div>
          <div className="mt-8 text-center">
            <p className="text-base text-gray-400">&copy; 2024 Anka Studios. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}