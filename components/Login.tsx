'use client'

import Image from 'next/image'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import PasswordRecovery from './password-recovery'

interface LoginProps {
  onSwitchToRegister: () => void;
}

export default function Login({ onSwitchToRegister }: LoginProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [isRecoveryOpen, setIsRecoveryOpen] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const codigoString = formData.get('codigo') as string
    const codigo = codigoString ? parseInt(codigoString, 10) : undefined

    if (codigo === undefined || isNaN(codigo)) {
      toast({
        title: "Error",
        description: "El código debe ser un número válido",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, codigo: codigo.toString() }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }

      const data = await response.json();
      localStorage.setItem('token', data.token);

      toast({
        title: "Inicio de sesión exitoso",
        description: "Bienvenido de vuelta!",
      })
      router.push('/dashboard')
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Ocurrió un error desconocido',
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-6 sm:p-10 rounded-xl shadow-2xl">
        <div className="flex justify-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Anka%20Studios-N4yoD8K3i61BOc8d98cvw7dekX0Hx5.png"
            alt="Anka Studios Logo"
            width={100}
            height={100}
            className="mb-8 w-24 h-24 sm:w-32 sm:h-32 md:w-36 md:h-36"
            priority
          />
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Iniciar sesión</h2>
          <p className="text-gray-500">
            Ingresa tus credenciales para acceder
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-6 sm:mt-8 space-y-4 sm:space-y-6">
          <div className="space-y-3 sm:space-y-4">
            <div>
              <Label htmlFor="email-login" className="block text-sm font-medium text-gray-700">
                Correo electrónico
              </Label>
              <Input
                id="email-login"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="tu@ejemplo.com"
              />
            </div>
            <div className="flex items-center">
              <input 
                type="checkbox" 
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" 
              />
              <label className="ml-2 block text-sm text-gray-900">Recuérdame</label>
            </div>
            <div>
              <Label htmlFor="password-login" className="block text-sm font-medium text-gray-700">
                Contraseña
              </Label>
              <Input
                id="password-login"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>
            <div>
              <Label htmlFor="codigo" className="block text-sm font-medium text-gray-700">Código</Label>
              <Input
                id="codigo"
                name="codigo"
                type="number"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"   
                placeholder="Código"  
              /> 
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              {isLoading ? "Iniciando..." : "Iniciar sesión"}
            </Button>
          </div>
        </form>

        <div className="text-center mt-4 sm:mt-6 space-y-2">
          <Dialog open={isRecoveryOpen} onOpenChange={setIsRecoveryOpen}>
            <DialogTrigger asChild>
              <button className="text-sm text-indigo-600 hover:text-indigo-500">
                ¿Olvidaste tu contraseña?
              </button>
            </DialogTrigger>
            <DialogContent>
              <PasswordRecovery onClose={() => setIsRecoveryOpen(false)} />
            </DialogContent>
          </Dialog>
          <div>
            <button
              onClick={onSwitchToRegister}
              className="font-medium text-indigo-600 hover:text-indigo-500 text-sm sm:text-base"
            >
              ¿No tienes una cuenta? Regístrate
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}