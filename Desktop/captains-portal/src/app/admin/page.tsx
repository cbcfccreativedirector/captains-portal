// src/app/admin/page.tsx
// Admin login page — password protected
'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'

function AdminLoginContent() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const hasError = searchParams.get('error')

  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(
    hasError ? 'Invalid password. Please try again.' : null
  )

  // If already logged in, go to dashboard
  useEffect(() => {
    if (session?.user?.isAdmin) {
      router.replace('/admin/dashboard')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-captain-navy flex items-center justify-center">
        <div className="text-captain-gold text-2xl animate-pulse">⚓</div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    const result = await signIn('credentials', {
      password,
      redirect: false,
    })

    if (result?.error) {
      setError('Invalid password. Please try again.')
      setLoading(false)
    } else {
      router.replace('/admin/dashboard')
    }
  }

  return (
    <div className="min-h-screen bg-captain-navy flex items-center justify-center px-4">
      {/* Background texture */}
      <div
        className="fixed inset-0 opacity-20 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, transparent, transparent 40px, rgba(201,168,76,0.02) 40px, rgba(201,168,76,0.02) 41px)',
        }}
      />

      <div className="relative w-full max-w-sm animate-fade-up">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">⚓</div>
          <h1 className="text-2xl font-display text-captain-gold">CB Captains FC</h1>
          <p className="text-captain-anchor text-sm tracking-widest uppercase mt-1">
            Club Officials Portal
          </p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="text-xl font-display text-captain-white mb-6 text-center">
            Flag Officer Access
          </h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="field-label" htmlFor="password">
                Admin Password
              </label>
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
              <div
                className="px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm"
                role="alert"
              >
                {error}
              </div>
            )}

            <button type="submit" disabled={loading || !password} className="btn-primary w-full mt-2">
              {loading ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying…
                </>
              ) : (
                'Enter the Bridge'
              )}
            </button>
          </form>
        </div>

        <p className="text-captain-anchor text-xs text-center mt-6">
          Authorized Captains FC officials only.{' '}
          <a href="https://www.captainsfc.com" className="text-captain-gold/60 hover:text-captain-gold transition-colors">
            Return to site →
          </a>
        </p>
      </div>
    </div>
  )
}
import { Suspense } from 'react'

export default function AdminLoginPage() {
  return (
    <Suspense>
      <AdminLoginContent />
    </Suspense>
  )
}