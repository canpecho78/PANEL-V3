import  { AppProps } from 'next/app'
import { SessionProvider } from "next-auth/react"
import { Toaster } from "@/components/ui/toaster"
import '@/app/globals.css'

export default function App({ Component, pageProps: { session, ...pageProps } }: AppProps) {
  return (
    <SessionProvider session={session}>
      <Component {...pageProps} />
      <Toaster />
    </SessionProvider>
  )
}