// src/lib/validation.ts
// Zod schemas — single source of truth for form + API validation

import { z } from 'zod'

export const playerSchema = z.object({
  firstName: z
    .string()
    .min(1, 'First name is required')
    .max(50, 'First name is too long')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'First name contains invalid characters'),

  middleInitial: z
    .string()
    .max(1, 'Just one letter please')
    .regex(/^[a-zA-Z]?$/, 'Middle initial must be a single letter')
    .optional()
    .transform((v) => v ?? ''),

  lastName: z
    .string()
    .min(1, 'Last name is required')
    .max(50, 'Last name is too long')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Last name contains invalid characters'),

  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((val) => {
      const date = new Date(val)
      const today = new Date()
      const minAge = new Date(today.getFullYear() - 14, today.getMonth(), today.getDate())
      const maxAge = new Date(today.getFullYear() - 80, today.getMonth(), today.getDate())
      return date <= minAge && date >= maxAge
    }, 'You must be at least 14 years old'),

  yearsOfExperience: z
    .number({ invalid_type_error: 'Please enter a number' })
    .min(0, 'Cannot be negative')
    .max(50, 'Maximum 50 years'),

  hometown: z
    .string()
    .min(1, 'Hometown is required')
    .max(100, 'Hometown is too long'),

  phone: z
    .string()
    .min(1, 'Phone number is required')
    .regex(/^[\d\s\-\(\)\+\.]+$/, 'Invalid phone number format')
    .min(10, 'Phone number seems too short'),

  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address')
    .max(100, 'Email is too long')
    .toLowerCase(),

  instagramHandle: z
    .string()
    .max(30, 'Instagram handle too long')
    .regex(/^@?[a-zA-Z0-9._]*$/, 'Invalid Instagram handle')
    .optional()
    .transform((v) => v ? (v.startsWith('@') ? v : `@${v}`) : ''),

  tiktokHandle: z
    .string()
    .max(30, 'TikTok handle too long')
    .regex(/^@?[a-zA-Z0-9._]*$/, 'Invalid TikTok handle')
    .optional()
    .transform((v) => v ? (v.startsWith('@') ? v : `@${v}`) : ''),

  favoriteSoccerClub: z
    .string()
    .min(1, 'Tell us your favorite club')
    .max(100, 'Too long'),

  favoritePlayer: z
    .string()
    .min(1, 'Tell us your favorite player')
    .max(100, 'Too long'),

  hypeSong: z
    .string()
    .min(1, 'Tell us your hype song')
    .max(200, 'Too long'),

  somethingRandom: z
    .string()
    .min(1, 'Share something random about yourself')
    .max(500, 'Maximum 500 characters'),
})

export type PlayerFormValues = z.infer<typeof playerSchema>

// Admin login schema
export const adminLoginSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})
