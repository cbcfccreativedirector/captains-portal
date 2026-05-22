// src/lib/google-sheets.ts
import { google } from 'googleapis'
import { PlayerRecord, SHEET_COLUMNS } from '@/types/player'

function getAuth() {
  const email = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL
  const key = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n')
  if (!email || !key) throw new Error('Missing Google credentials')
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

export async function ensureHeaders() {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A1:S1`,
  })
  if (!res.data.values || res.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:S1`,
      valueInputOption: 'RAW',
      requestBody: { values: [SHEET_COLUMNS as unknown as string[]] },
    })
  }
}

export async function appendPlayer(player: Omit<PlayerRecord, 'id'>) {
  await ensureHeaders()
  const sheets = getSheets()

  const row = [
    '',
    player.submittedAt,
    player.firstName,
    player.middleInitial,
    player.lastName,
    player.dateOfBirth,
    player.yearsOfExperience.toString(),
    player.hometown,
    player.phone,
    player.email,
    player.instagramHandle,
    player.tiktokHandle,
    player.favoriteSoccerClub,
    player.favoritePlayer,
    player.hypeSong,
    player.somethingRandom,
    player.ipHash,
    player.preferredPosition || '',
    player.secondaryPosition || '',
  ]

  const appendRes = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:S`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: { values: [row] },
  })

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

export async function getAllPlayers(): Promise<PlayerRecord[]> {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:S`,
  })

  const rows = res.data.values
  if (!rows || rows.length <= 1) return []

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
    preferredPosition: row[17] || '',
    secondaryPosition: row[18] || '',
  }))
}

export async function updatePlayer(rowId: string, player: Partial<PlayerRecord>) {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${rowId}:S${rowId}`,
  })

  const currentRow = res.data.values?.[0] || Array(19).fill('')

  const updatedRow = [
    currentRow[0],
    currentRow[1],
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
    currentRow[16],
    player.preferredPosition ?? currentRow[17],
    player.secondaryPosition ?? currentRow[18],
  ]

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${rowId}:S${rowId}`,
    valueInputOption: 'RAW',
    requestBody: { values: [updatedRow] },
  })
}

export async function deletePlayerRow(rowId: string) {
  const sheets = getSheets()
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId: SHEET_ID })
  const sheet = spreadsheet.data.sheets?.find((s) => s.properties?.title === SHEET_NAME)
  if (!sheet?.properties?.sheetId === undefined) throw new Error('Sheet not found')
  const sheetId = sheet!.properties!.sheetId!
  const rowIndex = parseInt(rowId) - 1

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: rowIndex, endIndex: rowIndex + 1 },
        },
      }],
    },
  })
}

export async function checkDuplicateEmail(email: string): Promise<boolean> {
  const players = await getAllPlayers()
  return players.some((p) => p.email.toLowerCase() === email.toLowerCase())
}
