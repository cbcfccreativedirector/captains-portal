// src/app/api/players/[id]/route.ts
// PUT: Update player | DELETE: Remove player (admin only)

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { playerSchema } from '@/lib/validation'
import { updatePlayer, deletePlayerRow } from '@/lib/google-sheets'

// ─── Auth check helper ────────────────────────────────────────────────────────

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.isAdmin) return false
  return true
}

// ─── PUT: Update a player record ──────────────────────────────────────────────

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const result = playerSchema.partial().safeParse(body)

    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        errors[issue.path[0] as string] = issue.message
      })
      return NextResponse.json({ success: false, errors }, { status: 422 })
    }

    await updatePlayer(params.id, result.data)

    return NextResponse.json({
      success: true,
      message: 'Player record updated successfully.',
    })
  } catch (error) {
    console.error('Update player error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to update player.' },
      { status: 500 }
    )
  }
}

// ─── DELETE: Remove a player record ──────────────────────────────────────────

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }

  try {
    await deletePlayerRow(params.id)

    return NextResponse.json({
      success: true,
      message: 'Player record deleted.',
    })
  } catch (error) {
    console.error('Delete player error:', error)
    return NextResponse.json(
      { success: false, message: 'Failed to delete player.' },
      { status: 500 }
    )
  }
}
