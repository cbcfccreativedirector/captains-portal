// src/lib/validation-women.ts
import { z } from 'zod'

export const womenPlayerSchema = z.object({
  firstName: z
    .string().min(1, 'First name is required').max(50, 'Too long')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Invalid characters'),

  middleInitial: z
    .string().max(1, 'Just one letter').regex(/^[a-zA-Z]?$/, 'Must be a single letter')
    .optional().transform((v) => v ?? ''),

  lastName: z
    .string().min(1, 'Last name is required').max(50, 'Too long')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Invalid characters'),

  dateOfBirth: z
    .string().min(1, 'Date of birth is required')
    .refine((val) => {
      const date = new Date(val)
      const today = new Date()
      const minAge = new Date(today.getFullYear() - 14, today.getMonth(), today.getDate())
      const maxAge = new Date(today.getFullYear() - 80, today.getMonth(), today.getDate())
      return date <= minAge && date >= maxAge
    }, 'You must be at least 14 years old'),

  yearsOfExperience: z
    .number({ invalid_type_error: 'Please enter a number' })
    .min(0, 'Cannot be negative').max(50, 'Maximum 50 years'),

  hometown: z.string().min(1, 'Hometown is required').max(100, 'Too long'),

  phone: z
    .string().min(1, 'Phone is required')
    .regex(/^[\d\s\-\(\)\+\.]+$/, 'Invalid phone number').min(10, 'Too short'),

  email: z
    .string().min(1, 'Email is required').email('Invalid email').max(100, 'Too long')
    .toLowerCase(),

  instagramHandle: z
    .string().max(30, 'Too long').regex(/^@?[a-zA-Z0-9._]*$/, 'Invalid handle')
    .optional().transform((v) => v ? (v.startsWith('@') ? v : `@${v}`) : ''),

  tiktokHandle: z
    .string().max(30, 'Too long').regex(/^@?[a-zA-Z0-9._]*$/, 'Invalid handle')
    .optional().transform((v) => v ? (v.startsWith('@') ? v : `@${v}`) : ''),

  preferredPosition: z.string().min(1, 'Preferred position is required').max(50, 'Too long'),

  secondaryPosition: z
    .string().max(50, 'Too long').optional().transform((v) => v ?? ''),

  dominantFoot: z
    .enum(['Left', 'Right', 'Both'], { errorMap: () => ({ message: 'Please select your dominant foot' }) }),

  height: z.string().min(1, 'Height is required').max(20, 'Too long'),

  weight: z.string().min(1, 'Weight is required').max(20, 'Too long'),

  highestLevelPlayed: z.string().min(1, 'Please select your highest level played').max(50, 'Too long'),

  jerseyNumber: z.string().max(3, 'Too long').optional().transform((v) => v ?? ''),

  ncaaEligibility: z
    .enum(['Yes', 'No', 'Not Applicable'], { errorMap: () => ({ message: 'Please select an option' }) }),

  availableForTravel: z
    .enum(['Yes', 'No', 'Sometimes'], { errorMap: () => ({ message: 'Please select an option' }) }),

  emergencyContactName: z
    .string().min(1, 'Emergency contact name is required').max(100, 'Too long'),

  emergencyContactPhone: z
    .string().min(1, 'Emergency contact phone is required')
    .regex(/^[\d\s\-\(\)\+\.]+$/, 'Invalid phone number').min(10, 'Too short'),

  favoriteSoccerClub: z.string().min(1, 'Required').max(100, 'Too long'),
  favoritePlayer: z.string().min(1, 'Required').max(100, 'Too long'),
  hypeSong: z.string().min(1, 'Required').max(200, 'Too long'),
  somethingRandom: z.string().min(1, 'Required').max(500, 'Too long'),
})

export type WomenPlayerFormValues = z.infer<typeof womenPlayerSchema>
