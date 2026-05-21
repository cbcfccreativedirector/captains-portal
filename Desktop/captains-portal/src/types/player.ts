// src/types/player.ts
// All the types for player data throughout the app

export interface PlayerFormData {
  firstName: string
  middleInitial: string
  lastName: string
  dateOfBirth: string
  yearsOfExperience: number
  hometown: string
  phone: string
  email: string
  instagramHandle: string
  tiktokHandle: string
  favoriteSoccerClub: string
  favoritePlayer: string
  hypeSong: string
  somethingRandom: string
}

export interface PlayerRecord extends PlayerFormData {
  id: string           // Row number in Google Sheets (used for edit/delete)
  submittedAt: string  // ISO timestamp
  ipHash: string       // Hashed IP for duplicate detection (NOT stored raw)
}

export interface ApiResponse<T = void> {
  success: boolean
  message: string
  data?: T
  errors?: Record<string, string>
}

export interface AdminSession {
  isAdmin: boolean
  expiresAt: string
}

// Column order in Google Sheets — matches exactly
export const SHEET_COLUMNS = [
  'ID',
  'Submitted At',
  'First Name',
  'Middle Initial',
  'Last Name',
  'Date of Birth',
  'Years of Experience',
  'Hometown',
  'Phone',
  'Email',
  'Instagram',
  'TikTok',
  'Favorite Club',
  'Favorite Player',
  'Hype Song',
  'Something Random',
  'IP Hash',
] as const
