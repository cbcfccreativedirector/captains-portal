// src/app/api/women/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { womenPlayerSchema } from '@/lib/validation-women'
import { appendWomenPlayer, getAllWomenPlayers, checkWomenDuplicateEmail } from '@/lib/google-sheets-women'
import { checkRateLimit, hashIp } from '@/lib/rate-limit'

export async function POST(req: NextRequest) {
  try {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      req.headers.get('x-real-ip') ||
      '127.0.0.1'

    const { allowed } = checkRateLimit(ip + '-women')
    if (!allowed) {
      return NextResponse.json(
        { success: false, message: 'Too many submissions. Please try again later.' },
        { status: 429 }
      )
    }

    let body: unknown
    try { body = await req.json() } catch {
      return NextResponse.json({ success: false, message: 'Invalid request body.' }, { status: 400 })
    }

    const result = womenPlayerSchema.safeParse(body)
    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        errors[issue.path[0] as string] = issue.message
      })
      return NextResponse.json({ success: false, message: 'Please fix the errors below.', errors }, { status: 422 })
    }

    const data = result.data

    const isDuplicate = await checkWomenDuplicateEmail(data.email)
    if (isDuplicate) {
      return NextResponse.json(
        { success: false, message: 'A player with this email is already registered.' },
        { status: 409 }
      )
    }

    const ipHash = await hashIp(ip)

    const rowId = await appendWomenPlayer({
      ...data,
      yearsOfExperience: Number(data.yearsOfExperience),
      submittedAt: new Date().toISOString(),
      ipHash,
      middleInitial: data.middleInitial || '',
      instagramHandle: data.instagramHandle || '',
      tiktokHandle: data.tiktokHandle || '',
      secondaryPosition: data.secondaryPosition || '',
      jerseyNumber: data.jerseyNumber || '',
    })

    return NextResponse.json(
      { success: true, message: 'Your information has been submitted successfully.', data: { id: rowId } },
      { status: 201 }
    )
  } catch (error) {
    console.error('Women player submission error:', error)
    return NextResponse.json({ success: false, message: 'Something went wrong. Please try again.' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
    }
    const players = await getAllWomenPlayers()
    return NextResponse.json({ success: true, data: players })
  } catch (error) {
    console.error('Get women players error:', error)
    return NextResponse.json({ success: false, message: 'Failed to fetch players.' }, { status: 500 })
  }
}
