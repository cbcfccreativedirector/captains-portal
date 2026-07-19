// src/lib/google-sheets-women.ts
// Women's team — separate Google Sheet

import { google } from 'googleapis'

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

const SHEET_ID = process.env.GOOGLE_SHEET_ID_WOMEN!
const SHEET_NAME = 'Players'

const HEADERS = [
  'ID', 'Submitted At', 'First Name', 'Middle Initial', 'Last Name',
  'Date of Birth', 'Years of Experience', 'Hometown', 'Phone', 'Email',
  'Instagram', 'TikTok', 'Preferred Position', 'Secondary Position',
  'Dominant Foot', 'Height', 'Weight', 'Highest Level Played', 'Jersey Number',
  'NCAA Eligibility', 'Available for Travel',
  'Emergency Contact Name', 'Emergency Contact Phone',
  'Favorite Club', 'Favorite Player', 'Hype Song', 'Something Random',
  'IP Hash',
]

export interface WomenPlayerRecord {
  id: string
  submittedAt: string
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
  preferredPosition: string
  secondaryPosition: string
  dominantFoot: string
  height: string
  weight: string
  highestLevelPlayed: string
  jerseyNumber: string
  ncaaEligibility: string
  availableForTravel: string
  emergencyContactName: string
  emergencyContactPhone: string
  favoriteSoccerClub: string
  favoritePlayer: string
  hypeSong: string
  somethingRandom: string
  ipHash: string
}

export async function ensureWomenHeaders() {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A1:AB1`,
  })
  if (!res.data.values || res.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SHEET_ID,
      range: `${SHEET_NAME}!A1:AB1`,
      valueInputOption: 'RAW',
      requestBody: { values: [HEADERS] },
    })
  }
}

export async function appendWomenPlayer(player: Omit<WomenPlayerRecord, 'id'>) {
  await ensureWomenHeaders()
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
    player.preferredPosition,
    player.secondaryPosition,
    player.dominantFoot,
    player.height,
    player.weight,
    player.highestLevelPlayed,
    player.jerseyNumber,
    player.ncaaEligibility,
    player.availableForTravel,
    player.emergencyContactName,
    player.emergencyContactPhone,
    player.favoriteSoccerClub,
    player.favoritePlayer,
    player.hypeSong,
    player.somethingRandom,
    player.ipHash,
  ]

  const appendRes = await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:AB`,
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

export async function getAllWomenPlayers(): Promise<WomenPlayerRecord[]> {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A:AB`,
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
    preferredPosition: row[12] || '',
    secondaryPosition: row[13] || '',
    dominantFoot: row[14] || '',
    height: row[15] || '',
    weight: row[16] || '',
    highestLevelPlayed: row[17] || '',
    jerseyNumber: row[18] || '',
    ncaaEligibility: row[19] || '',
    availableForTravel: row[20] || '',
    emergencyContactName: row[21] || '',
    emergencyContactPhone: row[22] || '',
    favoriteSoccerClub: row[23] || '',
    favoritePlayer: row[24] || '',
    hypeSong: row[25] || '',
    somethingRandom: row[26] || '',
    ipHash: row[27] || '',
  }))
}

export async function updateWomenPlayer(rowId: string, player: Partial<WomenPlayerRecord>) {
  const sheets = getSheets()
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${rowId}:AB${rowId}`,
  })

  const currentRow = res.data.values?.[0] || Array(28).fill('')

  const updatedRow = [
    currentRow[0], currentRow[1],
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
    player.preferredPosition ?? currentRow[12],
    player.secondaryPosition ?? currentRow[13],
    player.dominantFoot ?? currentRow[14],
    player.height ?? currentRow[15],
    player.weight ?? currentRow[16],
    player.highestLevelPlayed ?? currentRow[17],
    player.jerseyNumber ?? currentRow[18],
    player.ncaaEligibility ?? currentRow[19],
    player.availableForTravel ?? currentRow[20],
    player.emergencyContactName ?? currentRow[21],
    player.emergencyContactPhone ?? currentRow[22],
    player.favoriteSoccerClub ?? currentRow[23],
    player.favoritePlayer ?? currentRow[24],
    player.hypeSong ?? currentRow[25],
    player.somethingRandom ?? currentRow[26],
    currentRow[27],
  ]

  await sheets.spreadsheets.values.update({
    spreadsheetId: SHEET_ID,
    range: `${SHEET_NAME}!A${rowId}:AB${rowId}`,
    valueInputOption: 'RAW',
    requestBody: { values: [updatedRow] },
  })
}

export async function deleteWomenPlayerRow(rowId: string) {
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

export async function checkWomenDuplicateEmail(email: string): Promise<boolean> {
  const players = await getAllWomenPlayers()
  return players.some((p) => p.email.toLowerCase() === email.toLowerCase())
}
