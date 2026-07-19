// src/lib/auth.ts
// NextAuth configuration — credentials-based (password login for admin)

import { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Admin Login',
      credentials: {
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.password) return null

        const adminPassword = process.env.ADMIN_PASSWORD
const womenPassword = process.env.ADMIN_PASSWORD_WOMEN
const checkPassword = (stored: string | undefined, input: string) => {
if (!stored) return false
if (stored.startsWith('$2')) return bcrypt.compareSync(input, stored)
return input === stored
}
if (checkPassword(adminPassword, credentials.password)) {
return { id: 'admin', name: 'Club Official', email: 'admin@captainsfc.com' }
}
if (checkPassword(womenPassword, credentials.password)) {
return { id: 'women-admin', name: 'Women\'s Coach', email:
'women@captainsfc.com' }
}
return null
      },
    }),
  ],

  pages: {
    signIn: '/admin',        // Our custom login page
    error: '/admin?error=1', // Redirect errors back to login
  },

  session: {
    strategy: 'jwt',
    maxAge: 8 * 60 * 60, // 8 hours — log out after a full day's work
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) token.isAdmin = true
      return token
    },
    async session({ session, token }) {
      session.user = { ...session.user, isAdmin: token.isAdmin as boolean }
      return session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
}

// Extend the session type
declare module 'next-auth' {
  interface Session {
    user: {
      name?: string | null
      email?: string | null
      image?: string | null
      isAdmin?: boolean
    }
  }
}
