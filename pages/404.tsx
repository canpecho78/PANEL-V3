import Link from 'next/link'

export default function Custom404() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <h1 className="text-6xl font-bold">404 - Página no encontrada</h1>
      <p className="mt-3 text-2xl">
        Lo sentimos, la página que estás buscando no existe.
      </p>
      <Link href="/" className="mt-6 text-blue-600 hover:underline">
        Volver a la página de inicio 
      </Link>
    </div>
  )
}