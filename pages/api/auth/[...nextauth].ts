import NextAuth, { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import prisma from "@/lib/prisma"
import bcrypt from "bcrypt"

interface CustomUser {
  id: string;
  email: string;
  codigo?: number;
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        codigo: { label: "Código", type: "text" }
      },
      async authorize(credentials): Promise<CustomUser | null> {
        if (!credentials?.email || !credentials?.password || !credentials?.codigo) {
          return null
        }

        const user = await prisma.users.findFirst({
          where: {
            email: credentials.email,
            codigo: {
              equals: parseInt(credentials.codigo, 10)
            }
          }
        })

        if (!user) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(credentials.password, user.password)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          codigo: user.codigo ?? undefined,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.codigo = (user as CustomUser).codigo
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as CustomUser).codigo = token.codigo as number | undefined
      }
      return session
    }
  },
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/login"
  }
}

export default NextAuth(authOptions)