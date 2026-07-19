// src/app/admin/women/dashboard/layout.tsx
'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function WomenDashboardLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/admin/women')
    }
  }, [status, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#00315d' }}>
        <div className="text-4xl animate-pulse">⚽</div>
      </div>
    )
  }

  if (!session?.user?.isAdmin) return null

  return <>{children}</>
}
