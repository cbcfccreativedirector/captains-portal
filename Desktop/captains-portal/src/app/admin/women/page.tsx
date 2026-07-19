// src/app/admin/women/page.tsx
// Women's team admin login
'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const DEEP_BLUE  = '#00315d'
const MAGENTA    = '#d5085c'
const MIST       = '#a7bbd6'
const WARM_WHITE = '#F8F6F0'

function WomenLoginContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasError = searchParams.get('error')

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    hasError ? 'Invalid password. Please try again.' : null
  )

  useEffect(() => {
    if (session?.user?.isAdmin) {
      router.replace('/admin/women/dashboard')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: DEEP_BLUE }}>
        <div className="text-4xl animate-pulse">⚽</div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn('credentials', { password, redirect: false })

    if (result?.error) {
      setError('Invalid password. Please try again.')
      setLoading(false)
    } else {
      router.replace('/admin/women/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: DEEP_BLUE }}>
      <div
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 40px, ${MAGENTA}15 40px, ${MAGENTA}15 41px)`,
        }}
      />

      <div className="relative w-full max-w-sm animate-fade-up">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">⚽</div>
          <h1 className="text-2xl font-display" style={{ color: MAGENTA }}>
            CB Captains Women FC
          </h1>
          <p className="text-sm tracking-widest uppercase mt-1" style={{ color: MIST }}>
            Coaching Staff Portal
          </p>
        </div>

        <div className="p-8 rounded-xl border"
          style={{ background: 'rgba(255,255,255,0.04)', borderColor: `${MAGENTA}25` }}>
          <h2 className="text-xl font-display mb-6 text-center" style={{ color: WARM_WHITE }}>
            Staff Access
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="field-label" htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                className="field-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                autoFocus
              />
            </div>

            {error && (
              <div className="px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm" role="alert">
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !password}
              className="w-full mt-2 py-4 rounded-lg font-bold tracking-wide uppercase text-sm transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{ background: MAGENTA, color: WARM_WHITE }}>
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying…
                </>
              ) : 'Sign In'}
            </button>
          </form>
        </div>

        <p className="text-xs text-center mt-6" style={{ color: MIST, opacity: 0.6 }}>
          Authorized CB Captains Women FC staff only.{' '}
          <a href="https://www.captainsfc.com"
            className="transition-colors hover:opacity-80"
            style={{ color: MAGENTA }}>
            Return to site →
          </a>
        </p>
      </div>
    </div>
  )
}

export default function WomenAdminPage() {
  return (
    <Suspense>
      <WomenLoginContent />
    </Suspense>
  )
}
