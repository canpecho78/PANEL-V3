import type { DefaultSession } from 'next-auth'

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: {
      codigo?: number;
    } & DefaultSession['user']
  }

  interface User {
    codigo?: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    codigo?: number;
  }
}