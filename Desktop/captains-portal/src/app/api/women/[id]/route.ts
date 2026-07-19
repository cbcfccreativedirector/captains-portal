// src/app/api/women/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { updateWomenPlayer, deleteWomenPlayerRow } from '@/lib/google-sheets-women'

async function requireAdmin() {
  const session = await getServerSession(authOptions)
  return !!session?.user?.isAdmin
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
  try {
    const body = await req.json()
    await updateWomenPlayer(params.id, body)
    return NextResponse.json({ success: true, message: 'Player updated successfully.' })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to update player.' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await requireAdmin())) {
    return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
  }
  try {
    await deleteWomenPlayerRow(params.id)
    return NextResponse.json({ success: true, message: 'Player deleted.' })
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Failed to delete player.' }, { status: 500 })
  }
}
