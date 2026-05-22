// src/lib/google-sheets.ts
// All Google Sheets read/write operations happen here — server-side only

import { google } from 'googleapis'
import { PlayerRecord, SHEET_COLUMNS } from '@/types/player'

// ─── Auth ────────────────────────────────────────────────────────────────────

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')

  if (!email || !key) {
    throw new Error('Missing Google credentials in environment variables')
  }

  return new google.auth.JWT({
    email,
    key,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  })
}

function getSheets() {
  return google.sheets({ version: 'v4', auth: getAuth() })
}

const SHEET_ID = process.env.GOOGLE_SHEET_ID!
const SHEET_NAME = process.env.GOOGLE_SHEET_NAME || 'Players'

// ─── Ensure headers exist ────────────────────────────────────────────────────

export async function ensureHeaders() {
  const sheets = getSheets()

  // Check if row 1 already has headers
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A1:Q1`,
  })

  if (!res.data.values || res.data.values.length === 0) {
    // No headers yet — write them
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:Q1`,
      valueInputOption: 'RAW',
      requestBody: { values: [SHEET_COLUMNS as unknown as string[]] },
    })
  }
}

// ─── Append a new player row ─────────────────────────────────────────────────

export async function appendPlayer(player: Omit<PlayerRecord, 'id'>) {
  await ensureHeaders()

  const sheets = getSheets()

  const row = [
    '', // ID will be the row number — filled after append
    player.submittedAt,
    player.firstName,
    player.middleInitial,
    player.lastName,
    player.dateOfBirth,
    player.yearsOfExperience.toString(),
    player.hometown,
    player.phone,
    player.email,
    player.preferredPosition,
player.secondaryPosition,
player.instagramHandle,
    player.tiktokHandle,
    player.favoriteSoccerClub,
    player.favoritePlayer,
    player.hypeSong,
    player.somethingRandom,
    player.ipHash,
  ]

  const appendRes = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:Q`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  })

  // Get the actual row number and backfill the ID column
  const updatedRange = appendRes.data.updates?.updatedRange
  if (updatedRange) {
    const rowNum = updatedRange.match(/!A(\d+)/)?.[1]
    if (rowNum) {
      await sheets.spreadsheets.values.update({
        spreadsheetId: SHEET_ID,
        range: `${SHEET_NAME}!A${rowNum}`,
        valueInputOption: 'RAW',
        requestBody: { values: [[rowNum]] },
      })
      return rowNum
    }
  }

  return null
}

// ─── Get all players ──────────────────────────────────────────────────────────

export async function getAllPlayers(): Promise<PlayerRecord[]> {
  const sheets = getSheets()

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:Q`,
  })

  const rows = res.data.values
  if (!rows || rows.length <= 1) return [] // Only headers or empty

  // Skip header row (index 0)
  return rows.slice(1).map((row) => ({
    id: row[0] || '',
    submittedAt: row[1] || '',
    firstName: row[2] || '',
    middleInitial: row[3] || '',
    lastName: row[4] || '',
    dateOfBirth: row[5] || '',
    yearsOfExperience: parseInt(row[6]) || 0,
    hometown: row[7] || '',
    phone: row[8] || '',
    email: row[9] || '',
    instagramHandle: row[10] || '',
    tiktokHandle: row[11] || '',
    favoriteSoccerClub: row[12] || '',
    favoritePlayer: row[13] || '',
    hypeSong: row[14] || '',
    somethingRandom: row[15] || '',
    ipHash: row[16] || '',
  }))
}

// ─── Update a player row ──────────────────────────────────────────────────────

export async function updatePlayer(rowId: string, player: Partial<PlayerRecord>) {
  const sheets = getSheets()

  // Get current row first
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${rowId}:Q${rowId}`,
  })

  const currentRow = res.data.values?.[0] || Array(17).fill('')

  // Merge updates with current data
  const updatedRow = [
    currentRow[0], // ID stays
    currentRow[1], // submittedAt stays
    player.firstName ?? currentRow[2],
    player.middleInitial ?? currentRow[3],
    player.lastName ?? currentRow[4],
    player.dateOfBirth ?? currentRow[5],
    player.yearsOfExperience?.toString() ?? currentRow[6],
    player.hometown ?? currentRow[7],
    player.phone ?? currentRow[8],
    player.email ?? currentRow[9],
    player.instagramHandle ?? currentRow[10],
    player.tiktokHandle ?? currentRow[11],
    player.favoriteSoccerClub ?? currentRow[12],
    player.favoritePlayer ?? currentRow[13],
    player.hypeSong ?? currentRow[14],
    player.somethingRandom ?? currentRow[15],
    currentRow[16], // ipHash stays
  ]

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${rowId}:Q${rowId}`,
    valueInputOption: 'RAW',
    requestBody: { values: [updatedRow] },
  })
}

// ─── Delete a player row ──────────────────────────────────────────────────────
// We clear the row content instead of deleting (avoids row shifting issues)
// A real delete would require the Sheets batchUpdate API with deleteDimension

export async function deletePlayerRow(rowId: string) {
  const sheets = getSheets()

  // Get sheet's internal sheetId (not the spreadsheet ID)
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: SHEET_ID,
  })

  const sheet = spreadsheet.data.sheets?.find(
    (s) => s.properties?.title === SHEET_NAME
  )

  if (!sheet?.properties?.sheetId === undefined) {
    throw new Error('Sheet not found')
  }

  const sheetId = sheet!.properties!.sheetId!
  const rowIndex = parseInt(rowId) - 1 // Sheets API is 0-indexed

  // Use batchUpdate to actually DELETE the row (not just clear it)
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  })
}

// ─── Duplicate check (by email) ────────────────────────────────────────────

export async function checkDuplicateEmail(email: string): Promise<boolean> {
  const players = await getAllPlayers()
  return players.some((p) => p.email.toLowerCase() === email.toLowerCase())
}
