// src/app/admin/dashboard/layout.tsx
// Protects all dashboard routes — redirects to login if not authenticated
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/admin')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-captain-navy flex items-center justify-center">
        <div className="text-captain-gold text-4xl animate-pulse">⚓</div>
      </div>
    )
  }

  if (!session?.user?.isAdmin) return null

  return <>{children}</>
}
