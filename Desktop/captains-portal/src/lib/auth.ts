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
        if (!adminPassword) {
          console.error('ADMIN_PASSWORD environment variable not set!')
          return null
        }

        // Compare with bcrypt if password looks hashed, or plain text for dev
        let isValid = false

        if (adminPassword.startsWith('$2')) {
          // It's already a bcrypt hash (recommended for production)
          isValid = await bcrypt.compare(credentials.password, adminPassword)
        } else {
          // Plain text comparison (only for initial setup)
          isValid = credentials.password === adminPassword
        }

        if (isValid) {
          return { id: 'admin', name: 'Club Official', email: 'admin@captainsfc.com' }
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
