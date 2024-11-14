import Image from 'next/image'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

interface RegisterProps {
  onSwitchToLogin: () => void;
}

interface UserData {
  codigo: number;
  nombre: string;
  apellido: string;
  username: string;
  email: string;
  telefono: string;
  password: string;
}

export default function Register({ onSwitchToLogin }: RegisterProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const userData: Partial<UserData> = {}

    // Explicitly type and convert form data
    userData.codigo = parseInt(formData.get('codigo') as string, 10)
    userData.nombre = formData.get('nombre') as string
    userData.apellido = formData.get('apellido') as string
    userData.username = formData.get('username') as string
    userData.email = formData.get('email') as string
    userData.telefono = formData.get('telefono') as string
    userData.password = formData.get('password') as string

    // Validate if codigo is a valid number
    if (isNaN(userData.codigo)) {
      toast({
        title: "Error",
        description: "El código debe ser un número válido",
        variant: "destructive",
      })
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      })

      if (response.ok) {
        toast({
          title: "Registro exitoso",
          description: "Tu cuenta ha sido creada. Redirigiendo al login...",
        })
        setTimeout(onSwitchToLogin, 2000)
      } else {
        const error = await response.text()
        throw new Error(error)
      }
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200">
      <div className="w-full max-w-md space-y-8 bg-white p-10 rounded-xl shadow-2xl">
        <div className="flex justify-center">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Anka%20Studios-N4yoD8K3i61BOc8d98cvw7dekX0Hx5.png"
            alt="Anka Studios Logo"
            width={150}
            height={150}
            className="mb-8"
            priority
          />
        </div>
        <div className="space-y-2 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Registrarse</h2>
          <p className="text-gray-500">
            Crea una nueva cuenta
          </p>
        </div>
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
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
            <div>
              <Label htmlFor="nombre" className="block text-sm font-medium text-gray-700">Nombre</Label>
              <Input
                id="nombre"
                name="nombre"
                type="text"
                autoComplete="given-name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Nombre"
              />
            </div>
            <div>
              <Label htmlFor="apellido" className="block text-sm font-medium text-gray-700">Apellido</Label>
              <Input
                id="apellido"
                name="apellido"
                type="text"
                autoComplete="family-name"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Apellido"
              />
            </div>
            <div>
              <Label htmlFor="username" className="block text-sm font-medium text-gray-700">Nombre de usuario</Label>
              <Input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Nombre de usuario"
              />
            </div>
            <div>
              <Label htmlFor="email-register" className="block text-sm font-medium text-gray-700">Correo electrónico</Label>
              <Input
                id="email-register"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="tu@ejemplo.com"
              />
            </div>
            <div>
              <Label htmlFor="telefono" className="block text-sm font-medium text-gray-700">Número de teléfono</Label>
              <Input
                id="telefono"
                name="telefono"
                type="tel"
                autoComplete="tel"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="Número de teléfono"
              />
            </div>
            <div>
              <Label htmlFor="password-register" className="block text-sm font-medium text-gray-700">Contraseña</Label>
              <Input
                id="password-register"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              disabled={isLoading}
            >
              {isLoading ? "Registrando..." : "Registrarse"}
            </Button>
          </div>
        </form>

        <div className="text-center mt-4">
          <button
            onClick={onSwitchToLogin}
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            ¿Ya tienes una cuenta? Inicia sesión
          </button>
        </div>
      </div>
    </div>
  )
}