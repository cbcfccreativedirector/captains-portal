// src/app/signup/page.tsx
// CB Captains Women FC — Public player signup form
'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { womenPlayerSchema, WomenPlayerFormValues } from '@/lib/validation-women'
import { FormField } from '@/components/forms/FormField'

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const DEEP_BLUE  = '#00315d'
const CAP_BLUE   = '#0072af'
const MAGENTA    = '#d5085c'
const MAG_LIGHT  = '#f0266e'
const WARM_WHITE = '#F8F6F0'
const MIST       = '#a7bbd6'

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ name }: { name: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: DEEP_BLUE }}>
      <div className="text-center max-w-md animate-fade-up">
        <div className="text-7xl mb-6">⚽</div>
        <h2 className="text-3xl font-display mb-4" style={{ color: MAGENTA }}>
          Welcome, {name}!
        </h2>
        <p className="mb-2" style={{ color: MIST }}>
          Your information has been submitted to CB Captains Women FC.
        </p>
        <p className="text-sm mb-8" style={{ color: MIST, opacity: 0.7 }}>
          Our coaching staff will be in touch soon.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="https://www.captainsfc.com" className="btn-primary"
            style={{ background: `linear-gradient(135deg, ${MAGENTA}, ${MAG_LIGHT})`, color: WARM_WHITE }}>
            Return to Website
          </a>
          <button onClick={() => window.location.reload()} className="btn-secondary"
            style={{ borderColor: `${MAGENTA}50`, color: MAGENTA }}>
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
      <div className="flex-1 h-px" style={{ background: `${MAGENTA}30` }} />
      <span className="text-xs font-bold tracking-widest uppercase" style={{ color: '#eac6c8' }}>
        {label}
      </span>
      <div className="flex-1 h-px" style={{ background: `${MAGENTA}30` }} />
    </div>
  )
}

// ─── Select Field ─────────────────────────────────────────────────────────────
function SelectField({
  label, required, error, children, ...props
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
} & React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <div>
      <label className="field-label">
        {label}
        {required && <span className="ml-1" style={{ color: MAGENTA }}>*</span>}
      </label>
      <select className="field-input" {...props}
        style={{
          background: 'rgba(255,255,255,0.05)',
          borderColor: error ? '#ef4444' : `${MAGENTA}40`,
          color: WARM_WHITE,
        }}>
        {children}
      </select>
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function SignupPage() {
  const [submitted, setSubmitted] = useState(false)
  const [submittedName, setSubmittedName] = useState('')
  const [serverError, setServerError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<WomenPlayerFormValues>({
    resolver: zodResolver(womenPlayerSchema),
    defaultValues: {
      middleInitial: '',
      instagramHandle: '',
      tiktokHandle: '',
      jerseyNumber: '',
      secondaryPosition: '',
    },
  })

  const onSubmit = async (data: WomenPlayerFormValues) => {
    setServerError(null)
    try {
      const res = await fetch('/api/women', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json.errors) {
          Object.entries(json.errors).forEach(([field, msg]) => {
            setError(field as keyof WomenPlayerFormValues, { message: msg as string })
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
    <div className="min-h-screen" style={{ background: DEEP_BLUE }}>
      {/* Background texture */}
      <div className="fixed inset-0 opacity-20 pointer-events-none" style={{
        backgroundImage: `repeating-linear-gradient(135deg, transparent, transparent 40px, ${MAGENTA}15 40px, ${MAGENTA}15 41px)`,
      }} />

      {/* Header */}
      <header className="relative border-b" style={{ borderColor: `${MAGENTA}20`, background: CAP_BLUE }}>
        <div className="max-w-3xl mx-auto px-4 py-6 flex items-center justify-between">
          <a href="https://www.captainsfc.com" className="flex items-center gap-3">
            <img src="/logo.svg" alt="CB Captains FC" className="h-10 w-auto" />
            <div>
              <div className="font-display font-bold text-lg leading-none" style={{ color: WARM_WHITE }}>
                CB Captains Women FC
              </div>
              <div className="text-xs tracking-widest uppercase mt-0.5" style={{ color: MIST }}>
                Council Bluffs, Iowa
              </div>
            </div>
          </a>
          <div className="text-xs tracking-wide uppercase hidden sm:block" style={{ color: MIST }}>
            Player Portal
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="relative max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="inline-block text-xs font-bold tracking-widest uppercase mb-4 px-3 py-1 rounded-full border"
          style={{ color: MAGENTA, borderColor: `${MAGENTA}40`, background: `${MAGENTA}10` }}>
          Tryouts · 2026 Season
        </div>
        <h1 className="text-4xl sm:text-5xl font-display mb-4 leading-tight" style={{ color: WARM_WHITE }}>
          Sign Up{' '}
          <span style={{
            background: `linear-gradient(135deg, ${MAGENTA}, ${MAG_LIGHT})`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}>
            Today
          </span>
        </h1>
        <p className="text-lg max-w-xl mx-auto" style={{ color: MIST }}>
          Submit your player information below. Our coaching staff will review
          your submission and be in touch with next steps.
        </p>
      </div>

      {/* Form */}
      <div className="relative max-w-3xl mx-auto px-4 pb-20">
        <div className="card p-6 sm:p-10" style={{
          background: 'rgba(255,255,255,0.04)',
          borderColor: `${MAGENTA}20`,
        }}>
          <form onSubmit={handleSubmit(onSubmit)} noValidate>

            {/* Personal Info */}
            <SectionDivider label="Personal Information" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4 mb-6">
              <FormField label="First Name" required placeholder="Maria"
                error={errors.firstName?.message} {...register('firstName')} />
              <FormField label="Middle Initial" placeholder="A" maxLength={1}
                error={errors.middleInitial?.message} {...register('middleInitial')} />
              <FormField label="Last Name" required placeholder="Rodriguez"
                error={errors.lastName?.message} {...register('lastName')} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <FormField label="Date of Birth" type="date" required
                error={errors.dateOfBirth?.message} {...register('dateOfBirth')} />
              <FormField label="Years of Experience" type="number" required min={0} max={50} placeholder="5"
                error={errors.yearsOfExperience?.message}
                {...register('yearsOfExperience', { valueAsNumber: true })} />
            </div>

            <div className="mb-6">
              <FormField label="Hometown" required placeholder="Council Bluffs, Iowa"
                error={errors.hometown?.message} {...register('hometown')} />
            </div>

            {/* Contact Info */}
            <SectionDivider label="Contact Information" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mb-6">
              <FormField label="Phone Number" type="tel" required placeholder="(712) 555-0100"
                error={errors.phone?.message} {...register('phone')} />
              <FormField label="Email Address" type="email" required placeholder="you@email.com"
                error={errors.email?.message} {...register('email')} />
            </div>

            {/* Emergency Contact */}
            <SectionDivider label="Emergency Contact" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mb-6">
              <FormField label="Emergency Contact Name" required placeholder="Jane Rodriguez"
                error={errors.emergencyContactName?.message} {...register('emergencyContactName')} />
              <FormField label="Emergency Contact Phone" type="tel" required placeholder="(712) 555-0200"
                error={errors.emergencyContactPhone?.message} {...register('emergencyContactPhone')} />
            </div>

            {/* Social Media */}
            <SectionDivider label="Social Media" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mb-6">
              <FormField label="Instagram Handle" placeholder="@yourhandle" hint="Optional"
                error={errors.instagramHandle?.message} {...register('instagramHandle')} />
              <FormField label="TikTok Handle" placeholder="@yourhandle" hint="Optional"
                error={errors.tiktokHandle?.message} {...register('tiktokHandle')} />
            </div>

            {/* Player Profile */}
            <SectionDivider label="Player Profile" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mb-4">
              <FormField label="Preferred Position" required placeholder="e.g. Center Midfielder"
                error={errors.preferredPosition?.message} {...register('preferredPosition')} />
              <FormField label="Secondary Position" placeholder="e.g. Left Back" hint="Optional"
                error={errors.secondaryPosition?.message} {...register('secondaryPosition')} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <SelectField label="Dominant Foot" required error={errors.dominantFoot?.message}
                {...register('dominantFoot')}>
                <option value="">Select...</option>
                <option value="Left">Left</option>
                <option value="Right">Right</option>
                <option value="Both">Both</option>
              </SelectField>
              <FormField label="Height" required placeholder='e.g. 5&apos;6"'
                error={errors.height?.message} {...register('height')} />
              <FormField label="Weight" required placeholder="e.g. 140 lbs"
                error={errors.weight?.message} {...register('weight')} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <SelectField label="Highest Level Played" required error={errors.highestLevelPlayed?.message}
                {...register('highestLevelPlayed')}>
                <option value="">Select...</option>
                <option value="Recreational">Recreational</option>
                <option value="Amateur">Amateur</option>
                <option value="College Club">College Club</option>
                <option value="College Varsity">College Varsity</option>
                <option value="Semi-Professional">Semi-Professional</option>
                <option value="Professional">Professional</option>
              </SelectField>
              <FormField label="Jersey Number Preference" placeholder="e.g. 10" hint="Optional"
                error={errors.jerseyNumber?.message} {...register('jerseyNumber')} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <SelectField label="NCAA Eligibility Remaining" required error={errors.ncaaEligibility?.message}
                {...register('ncaaEligibility')}>
                <option value="">Select...</option>
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not Applicable">Not Applicable</option>
              </SelectField>
              <SelectField label="Available for Away Travel" required error={errors.availableForTravel?.message}
                {...register('availableForTravel')}>
                <option value="">Select...</option>
                <option value="Yes">Yes — all matches</option>
                <option value="Sometimes">Sometimes — schedule dependent</option>
                <option value="No">No — home matches only</option>
              </SelectField>
            </div>

            {/* Soccer Personality */}
            <SectionDivider label="Soccer Personality" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4 mb-4">
              <FormField label="Favorite Soccer Club" required placeholder="e.g. NWSL Portland Thorns"
                error={errors.favoriteSoccerClub?.message} {...register('favoriteSoccerClub')} />
              <FormField label="Favorite Player" required placeholder="e.g. Alex Morgan"
                error={errors.favoritePlayer?.message} {...register('favoritePlayer')} />
            </div>

            <div className="mb-4">
              <FormField label="Hype Song" required placeholder="The song that gets you ready to play"
                error={errors.hypeSong?.message} {...register('hypeSong')} />
            </div>

            <div className="mb-8">
              <FormField as="textarea" label="Something Random About You" required
                placeholder="Tell us something we wouldn't expect — the weirder, the better."
                error={errors.somethingRandom?.message}
                {...(register('somethingRandom') as any)} />
              <p className="text-xs mt-1 text-right" style={{ color: MIST, opacity: 0.6 }}>
                Max 500 characters
              </p>
            </div>

            {serverError && (
              <div className="mb-6 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm" role="alert">
                {serverError}
              </div>
            )}

            <button type="submit" disabled={isSubmitting}
              className="w-full text-lg py-5 rounded-lg font-bold tracking-wide uppercase transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              style={{
                background: `linear-gradient(135deg, ${MAGENTA}, ${MAG_LIGHT})`,
                color: WARM_WHITE,
                boxShadow: `0 4px 20px ${MAGENTA}40`,
              }}>
              {isSubmitting ? (
                <>
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Submitting…
                </>
              ) : (
                '⚽ Submit Your Information'
              )}
            </button>

            <p className="text-xs text-center mt-4" style={{ color: MIST, opacity: 0.6 }}>
              Your information is kept private and only shared with CB Captains Women FC coaching staff.
            </p>
          </form>
        </div>
      </div>
    </div>
  )
}
