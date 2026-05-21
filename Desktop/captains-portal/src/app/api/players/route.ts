// src/app/api/players/route.ts
// POST: Submit a new player | GET: List all players (admin only)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { playerSchema } from '@/lib/validation'
import { appendPlayer, getAllPlayers, checkDuplicateEmail } from '@/lib/google-sheets'
import { checkRateLimit, hashIp } from '@/lib/rate-limit'

// ─── POST: Public form submission ─────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1'

    // Rate limit check
    const { allowed, remaining } = checkRateLimit(ip)
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many submissions. Please try again later.' },
        { status: 429, headers: { 'X-RateLimit-Remaining': '0' } }
      )
    }

    // Parse body
    let body: unknown
    try {
      body = await req.json()
    } catch {
      return NextResponse.json(
        { success: false, message: 'Invalid request body.' },
        { status: 400 }
      )
    }

    // Validate with Zod
    const result = playerSchema.safeParse(body)
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string
        errors[field] = issue.message
      })
      return NextResponse.json(
        { success: false, message: 'Please fix the errors below.', errors },
        { status: 422 }
      )
    }

    const data = result.data

    // Check for duplicate email
    const isDuplicate = await checkDuplicateEmail(data.email)
    if (isDuplicate) {
      return NextResponse.json(
        {
          success: false,
          message: 'A player with this email is already registered. Contact the club if this is an error.',
        },
        { status: 409 }
      )
    }

    // Hash the IP for storage
    const ipHash = await hashIp(ip)

    // Append to Google Sheets
    const rowId = await appendPlayer({
      ...data,
      yearsOfExperience: Number(data.yearsOfExperience),
      submittedAt: new Date().toISOString(),
      ipHash,
    })

    return NextResponse.json(
      {
        success: true,
        message: 'Welcome aboard, sailor! Your information has been submitted.',
        data: { id: rowId },
      },
      {
        status: 201,
        headers: { 'X-RateLimit-Remaining': remaining.toString() },
      }
    )
  } catch (error) {
    console.error('Player submission error:', error)
    return NextResponse.json(
      { success: false, message: 'Something went wrong on our end. Please try again.' },
      { status: 500 }
    )
  }
}

// ─── GET: Admin — list all players ───────────────────────────────────────────

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }

    const players = await getAllPlayers()

    return NextResponse.json({ success: true, data: players })
  } catch (error) {
    console.error('Get players error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to fetch players.' },
      { status: 500 }
    )
  }
}
