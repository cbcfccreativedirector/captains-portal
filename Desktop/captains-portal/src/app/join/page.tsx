// src/app/join/page.tsx
// Public player submission form — matches Captains FC maritime aesthetic
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { playerSchema, PlayerFormValues } from '@/lib/validation'
import { FormField } from '@/components/forms/FormField'

// ─── Success Screen ───────────────────────────────────────────────────────────

function SuccessScreen({ name }: { name: string }) {
  return (
    <div className="min-h-screen bg-captain-navy flex items-center justify-center px-4">
      <div className="text-center max-w-md animate-fade-up">
        <div className="text-7xl mb-6">⚓</div>
        <h2 className="text-3xl font-display text-captain-gold mb-4">
          Welcome Aboard, {name}!
        </h2>
        <p className="text-captain-mist mb-2">
          Your information has been submitted to the Captains FC crew roster.
        </p>
        <p className="text-captain-anchor text-sm mb-8">
          A club official will be in touch soon. Set sail!
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a
            href="https://www.captainsfc.com"
            className="btn-primary"
          >
            Return to Home Port
          </a>
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary"
          >
            Submit Another
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Section Divider ──────────────────────────────────────────────────────────

function SectionDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-4 py-2">
      <div className="flex-1 h-px bg-captain-gold/15" />
      <span className="text-captain-gold/60 text-xs font-bold tracking-widest uppercase">
        {label}
      </span>
      <div className="flex-1 h-px bg-captain-gold/15" />
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JoinPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submittedName, setSubmittedName] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<PlayerFormValues>({
    resolver: zodResolver(playerSchema),
    defaultValues: {
      middleInitial: '',
      instagramHandle: '',
      tiktokHandle: '',
    },
  })

  const onSubmit = async (data: PlayerFormValues) => {
    setServerError(null)

    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      const json = await res.json()

      if (!res.ok) {
        // Handle field-level errors from server
        if (json.errors) {
          Object.entries(json.errors).forEach(([field, msg]) => {
            setError(field as keyof PlayerFormValues, { message: msg as string })
          })
        } else {
          setServerError(json.message || 'Something went wrong. Please try again.')
        }
        return
      }

      setSubmittedName(data.firstName)
      setSubmitted(true)
    } catch {
      setServerError('Network error — please check your connection and try again.')
    }
  }

  if (submitted) return <SuccessScreen name={submittedName} />

  return (
    <div className="min-h-screen bg-captain-navy">
      {/* ── Background texture ── */}
      <div
        className="fixed inset-0 opacity-30 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, transparent, transparent 40px, rgba(201,168,76,0.015) 40px, rgba(201,168,76,0.015) 41px)',
        }}
      />

      {/* ── Header ── */}
      <header className="relative border-b border-captain-gold/10"
style={{ background: '#eac6c8' }}>
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between">
          <a href="https://www.captainsfc.com" className="flex items-center gap-3 group">
            <span className="text-2xl"><img src="/logo.svg" alt="CB Captains FC" className="h-10 w-auto" /></span>
            <div>
              <div className="text-captain-navy font-display font-bold text-lg leading-none">
                CB Captains FC
              </div>
              <div className="text-captain-navy text-xs tracking-widest uppercase mt-0.5">
                Council Bluffs, Iowa
              </div>
            </div>
          </a>
          <div className="text-captain-navy text-xs tracking-wide uppercase hidden sm:block">
            Player Portal
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <div className="relative max-w-3xl mx-auto px-4 py-12 text-center">
        <div
          className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full border"
          style={{
            color: 'var(--gold)',
            borderColor: 'rgba(201,168,76,0.3)',
            background: 'rgba(201,168,76,0.08)',
          }}
        >
          UPSL Premier Division
        </div>
        <h1 className="text-4xl sm:text-5xl font-display text-captain-white mb-4 leading-tight">
          Join the{' '}
          <span
            style={{
              background: 'linear-gradient(135deg, var(--gold), var(--gold-light))',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            Captains FC
          </span>
        </h1>
        <p className="text-captain-mist text-lg max-w-xl mx-auto">
          Submit your player information below.<br />Our staff will review and be in
          touch to chart the next steps.
        </p>
      </div>

      {/* ── Form ── */}
      <div className="relative max-w-3xl mx-auto px-4 pb-20">
        <div className="card p-6 sm:p-10">
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* ── Personal Info ── */}
            <SectionDivider label="Personal Information" />

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 mb-6">
              <div className="sm:col-span-1">
                <FormField
                  label="First Name"
                  required
                  placeholder="Obed"
                  error={errors.firstName?.message}
                  {...register('firstName')}
                />
              </div>
              <div className="sm:col-span-1">
                <FormField
                  label="Middle Initial"
                  placeholder="A"
                  maxLength={1}
                  error={errors.middleInitial?.message}
                  {...register('middleInitial')}
                />
              </div>
              <div className="sm:col-span-1">
                <FormField
                  label="Last Name"
                  required
                  placeholder="Vargas"
                  error={errors.lastName?.message}
                  {...register('lastName')}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mb-4">
  <FormField
    label="Preferred Position"
    required
    placeholder="e.g. Center Midfielder"
    error={errors.preferredPosition?.message}
    {...register('preferredPosition')}
  />
  <FormField
    label="Secondary Position"
    placeholder="e.g. Left Back"
    error={errors.secondaryPosition?.message}
    {...register('secondaryPosition')}
  />
</div><div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <FormField
                label="Date of Birth"
                type="date"
                required
                error={errors.dateOfBirth?.message}
                {...register('dateOfBirth')}
              />
              <FormField
                label="Years of Experience"
                type="number"
                required
                min={0}
                max={50}
                placeholder="5"
                error={errors.yearsOfExperience?.message}
                {...register('yearsOfExperience', { valueAsNumber: true })}
              />
            </div>

            <div className="mb-6">
              <FormField
                label="Hometown"
                required
                placeholder="Council Bluffs, Iowa"
                error={errors.hometown?.message}
                {...register('hometown')}
              />
            </div>

            {/* ── Contact Info ── */}
            <SectionDivider label="Contact Information" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mb-6">
              <FormField
                label="Phone Number"
                type="tel"
                required
                placeholder="(712) 555-0100"
                error={errors.phone?.message}
                {...register('phone')}
              />
              <FormField
                label="Email Address"
                type="email"
                required
                placeholder="you@email.com"
                error={errors.email?.message}
                {...register('email')}
              />
            </div>

            {/* ── Social Media ── */}
            <SectionDivider label="Social Media" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mb-6">
              <FormField
                label="Instagram Handle"
                placeholder="@yourhandle"
                hint="Optional — no need for the @"
                error={errors.instagramHandle?.message}
                {...register('instagramHandle')}
              />
              <FormField
                label="TikTok Handle"
                placeholder="@yourhandle"
                hint="Optional"
                error={errors.tiktokHandle?.message}
                {...register('tiktokHandle')}
              />
            </div>

            <SectionDivider label="Player Profile" />

<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 mb-6">
  <div>
    <label className="field-label">Dominant Foot <span className="text-captain-gold ml-1">*</span></label>
    <select className="field-input" {...register('dominantFoot')}>
      <option value="">Select...</option>
      <option value="Left">Left</option>
      <option value="Right">Right</option>
      <option value="Both">Both</option>
    </select>
    {errors.dominantFoot && <p className="field-error">{errors.dominantFoot.message}</p>}
  </div>
  <FormField
    label="Height"
    required
    placeholder='e.g. 5\'11"'
    error={errors.height?.message}
    {...register('height')}
  />
  <FormField
    label="Weight"
    required
    placeholder="e.g. 175 lbs"
    error={errors.weight?.message}
    {...register('weight')}
  />
</div>

<div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
  <div>
    <label className="field-label">Highest Level Played <span className="text-captain-gold ml-1">*</span></label>
    <select className="field-input" {...register('highestLevelPlayed')}>
      <option value="">Select...</option>
      <option value="Recreational">Recreational</option>
      <option value="Amateur">Amateur</option>
      <option value="College Club">College Club</option>
      <option value="College Varsity">College Varsity</option>
      <option value="Semi-Professional">Semi-Professional</option>
      <option value="Professional">Professional</option>
    </select>
    {errors.highestLevelPlayed && <p className="field-error">{errors.highestLevelPlayed.message}</p>}
  </div>
  <FormField
    label="Jersey Number Preference"
    placeholder="e.g. 10"
    error={errors.jerseyNumber?.message}
    {...register('jerseyNumber')}
  />
</div>

            {/* ── Soccer Personality ── */}
            <SectionDivider label="Soccer Personality" />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mb-4">
              <FormField
                label="Favorite Soccer Club"
                required
                placeholder="1.FC Kaiserslautern"
                error={errors.favoriteSoccerClub?.message}
                {...register('favoriteSoccerClub')}
              />
              <FormField
                label="Favorite Player"
                required
                placeholder="Clint Dempsey"
                error={errors.favoritePlayer?.message}
                {...register('favoritePlayer')}
              />
            </div>

            <div className="mb-4">
              <FormField
                label="Hype Song"
                required
                placeholder="The song that gets you ready to play"
                error={errors.hypeSong?.message}
                {...register('hypeSong')}
              />
            </div>

            <div className="mb-8">
              <FormField
                as="textarea"
                label="Something Random About You"
                required
                placeholder="Tell us something we wouldn't expect — the weirder, the better."
                error={errors.somethingRandom?.message}
                {...(register('somethingRandom') as any)}
              />
              <p className="text-captain-anchor text-xs mt-1 text-right">
                Max 500 characters
              </p>
            </div>

            {/* ── Server error ── */}
            {serverError && (
              <div
                className="mb-6 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm"
                role="alert"
              >
                {serverError}
              </div>
            )}

            {/* ── Submit ── */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full text-lg py-5"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Submitting…
                </>
              ) : (
                <>
                  ⚓ Submit to the Crew
                </>
              )}
            </button>

            <p className="text-captain-anchor text-xs text-center mt-4">
              Your information is kept private and only shared with Captains FC
              club officials.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
