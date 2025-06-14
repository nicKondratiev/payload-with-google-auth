// next-auth.d.ts
import { DefaultUser } from 'next-auth'

declare module 'next-auth' {
  interface User extends DefaultUser {
    emailVerified?: string | null
    role?: 'admin' | 'editor'
  }

  interface Session {
    user: User
  }
}
