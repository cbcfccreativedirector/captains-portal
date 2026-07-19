// src/app/admin/women/dashboard/page.tsx
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import { WomenPlayerRecord } from '@/lib/google-sheets-women'

const DEEP_BLUE = '#00315d'
const CAP_BLUE  = '#0072af'
const MAGENTA   = '#d5085c'
const MIST      = '#a7bbd6'
const WARM_WHITE = '#F8F6F0'

function formatDate(iso: string) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch { return iso }
}

function exportCSV(players: WomenPlayerRecord[]) {
  const headers = [
    'ID', 'Submitted', 'First Name', 'MI', 'Last Name', 'DOB', 'Years Exp',
    'Hometown', 'Phone', 'Email', 'Instagram', 'TikTok',
    'Preferred Position', 'Secondary Position', 'Dominant Foot',
    'Height', 'Weight', 'Highest Level', 'Jersey #',
    'NCAA Eligibility', 'Travel Available',
    'Emergency Contact', 'Emergency Phone',
    'Fav Club', 'Fav Player', 'Hype Song', 'Something Random',
  ]
  const rows = players.map((p) => [
    p.id, formatDate(p.submittedAt), p.firstName, p.middleInitial, p.lastName,
    p.dateOfBirth, p.yearsOfExperience, p.hometown, p.phone, p.email,
    p.instagramHandle, p.tiktokHandle, p.preferredPosition, p.secondaryPosition,
    p.dominantFoot, p.height, p.weight, p.highestLevelPlayed, p.jerseyNumber,
    p.ncaaEligibility, p.availableForTravel,
    p.emergencyContactName, p.emergencyContactPhone,
    p.favoriteSoccerClub, p.favoritePlayer, p.hypeSong,
    `"${(p.somethingRandom || '').replace(/"/g, '""')}"`,
  ])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `captains-women-players-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

function EditModal({ player, onClose, onSave }: {
  player: WomenPlayerRecord
  onClose: () => void
  onSave: (updated: WomenPlayerRecord) => void
}) {
  const [form, setForm] = useState<WomenPlayerRecord>(player)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof WomenPlayerRecord, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/women/${player.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const json = await res.json()
      if (!res.ok) { setError(json.message || 'Failed to save.') }
      else { onSave(form) }
    } catch { setError('Network error.') }
    finally { setSaving(false) }
  }

  const fields: Array<{ key: keyof WomenPlayerRecord; label: string; type?: string }> = [
    { key: 'firstName', label: 'First Name' },
    { key: 'middleInitial', label: 'Middle Initial' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
    { key: 'yearsOfExperience', label: 'Years Experience', type: 'number' },
    { key: 'hometown', label: 'Hometown' },
    { key: 'phone', label: 'Phone', type: 'tel' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'emergencyContactName', label: 'Emergency Contact' },
    { key: 'emergencyContactPhone', label: 'Emergency Phone', type: 'tel' },
    { key: 'preferredPosition', label: 'Preferred Position' },
    { key: 'secondaryPosition', label: 'Secondary Position' },
    { key: 'dominantFoot', label: 'Dominant Foot' },
    { key: 'height', label: 'Height' },
    { key: 'weight', label: 'Weight' },
    { key: 'highestLevelPlayed', label: 'Highest Level' },
    { key: 'jerseyNumber', label: 'Jersey Number' },
    { key: 'ncaaEligibility', label: 'NCAA Eligibility' },
    { key: 'availableForTravel', label: 'Travel Available' },
    { key: 'instagramHandle', label: 'Instagram' },
    { key: 'tiktokHandle', label: 'TikTok' },
    { key: 'favoriteSoccerClub', label: 'Favorite Club' },
    { key: 'favoritePlayer', label: 'Favorite Player' },
    { key: 'hypeSong', label: 'Hype Song' },
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,49,93,0.9)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-xl border animate-fade-up"
        style={{ background: '#0a1f35', borderColor: `${MAGENTA}30` }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display" style={{ color: MAGENTA }}>
            Edit — {player.firstName} {player.lastName}
          </h2>
          <button onClick={onClose} className="text-2xl leading-none transition-colors"
            style={{ color: MIST }}>{`×`}</button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ key, label, type = 'text' }) => (
            <div key={key}>
              <label className="field-label">{label}</label>
              <input type={type} className="field-input"
                value={form[key] as string}
                onChange={(e) => handleChange(key, type === 'number' ? Number(e.target.value) : e.target.value)} />
            </div>
          ))}
          <div className="sm:col-span-2">
            <label className="field-label">Something Random</label>
            <textarea className="field-input" rows={3}
              value={form.somethingRandom}
              onChange={(e) => handleChange('somethingRandom', e.target.value)} />
          </div>
        </div>
        {error && <div className="mt-4 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">{error}</div>}
        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={saving}
            className="flex-1 py-3 rounded-lg font-bold text-sm uppercase tracking-wide transition-all disabled:opacity-60"
            style={{ background: MAGENTA, color: WARM_WHITE }}>
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button onClick={onClose} className="btn-secondary flex-1" style={{ borderColor: `${MAGENTA}30`, color: MAGENTA }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

function PlayerDetail({ player, onClose }: { player: WomenPlayerRecord; onClose: () => void }) {
  const rows: Array<[string, string]> = [
    ['Submitted', formatDate(player.submittedAt)],
    ['Date of Birth', player.dateOfBirth],
    ['Experience', `${player.yearsOfExperience} year${player.yearsOfExperience !== 1 ? 's' : ''}`],
    ['Preferred Position', player.preferredPosition || '—'],
    ['Secondary Position', player.secondaryPosition || '—'],
    ['Dominant Foot', player.dominantFoot || '—'],
    ['Height', player.height || '—'],
    ['Weight', player.weight || '—'],
    ['Highest Level', player.highestLevelPlayed || '—'],
    ['Jersey Number', player.jerseyNumber || '—'],
    ['NCAA Eligibility', player.ncaaEligibility || '—'],
    ['Travel Available', player.availableForTravel || '—'],
    ['Hometown', player.hometown],
    ['Phone', player.phone],
    ['Email', player.email],
    ['Emergency Contact', player.emergencyContactName || '—'],
    ['Emergency Phone', player.emergencyContactPhone || '—'],
    ['Instagram', player.instagramHandle || '—'],
    ['TikTok', player.tiktokHandle || '—'],
    ['Favorite Club', player.favoriteSoccerClub],
    ['Favorite Player', player.favoritePlayer],
    ['Hype Song', player.hypeSong],
    ['Something Random', player.somethingRandom],
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(0,49,93,0.9)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full max-w-md max-h-[85vh] overflow-y-auto p-6 rounded-xl border animate-fade-up"
        style={{ background: '#0a1f35', borderColor: `${MAGENTA}30` }}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-display" style={{ color: MAGENTA }}>
              {player.firstName} {player.middleInitial ? `${player.middleInitial}. ` : ''}{player.lastName}
            </h2>
            <p className="text-xs mt-0.5" style={{ color: MIST }}>Row #{player.id}</p>
          </div>
          <button onClick={onClose} className="text-2xl leading-none mt-1" style={{ color: MIST }}>{`×`}</button>
        </div>
        <dl className="space-y-3">
          {rows.map(([label, value]) => (
            <div key={label} className="flex gap-3">
              <dt className="text-xs font-bold tracking-wide uppercase min-w-[130px] pt-0.5" style={{ color: MIST, opacity: 0.7 }}>{label}</dt>
              <dd className="text-sm flex-1 break-words" style={{ color: WARM_WHITE }}>{value}</dd>
            </div>
          ))}
        </dl>
        <button onClick={onClose} className="w-full mt-6 py-3 rounded-lg border text-sm font-medium transition-colors"
          style={{ borderColor: `${MAGENTA}30`, color: MAGENTA }}>
          Close
        </button>
      </div>
    </div>
  )
}

type SortKey = keyof WomenPlayerRecord
type SortDir = 'asc' | 'desc'

export default function WomenDashboardPage() {
  const [players, setPlayers] = useState<WomenPlayerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('submittedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const [editPlayer, setEditPlayer] = useState<WomenPlayerRecord | null>(null)
  const [viewPlayer, setViewPlayer] = useState<WomenPlayerRecord | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const PER_PAGE = 20

  const fetchPlayers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/women')
      const json = await res.json()
      if (!res.ok) throw new Error(json.message)
      setPlayers(json.data)
    } catch (e) {
      setError((e as Error).message || 'Failed to load players.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchPlayers() }, [fetchPlayers])

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const list = q
      ? players.filter((p) =>
          [p.firstName, p.lastName, p.email, p.hometown, p.preferredPosition, p.phone]
            .some((v) => (v || '').toLowerCase().includes(q)))
      : players
    return [...list].sort((a, b) => {
      const va = String(a[sortKey] || '')
      const vb = String(b[sortKey] || '')
      return sortDir === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va)
    })
  }, [players, search, sortKey, sortDir])

  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortIcon = ({ k }: { k: SortKey }) => {
    if (sortKey !== k) return <span style={{ opacity: 0.2 }}>↕</span>
    return <span style={{ color: MAGENTA }}>{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  const handleDelete = async (player: WomenPlayerRecord) => {
    if (!window.confirm(`Delete ${player.firstName} ${player.lastName}? This cannot be undone.`)) return
    setDeletingId(player.id)
    try {
      const res = await fetch(`/api/women/${player.id}`, { method: 'DELETE' })
      if (res.ok) setPlayers((prev) => prev.filter((p) => p.id !== player.id))
      else alert('Failed to delete.')
    } catch { alert('Network error.') }
    finally { setDeletingId(null) }
  }

  const handleEditSave = (updated: WomenPlayerRecord) => {
    setPlayers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setEditPlayer(null)
  }

  return (
    <div className="min-h-screen" style={{ background: DEEP_BLUE }}>
      {editPlayer && <EditModal player={editPlayer} onClose={() => setEditPlayer(null)} onSave={handleEditSave} />}
      {viewPlayer && <PlayerDetail player={viewPlayer} onClose={() => setViewPlayer(null)} />}

      {/* Header */}
      <header className="border-b sticky top-0 z-40"
        style={{ background: DEEP_BLUE, borderColor: `${MAGENTA}20`, backdropFilter: 'blur(8px)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚽</span>
            <div>
              <div className="font-display font-bold text-base leading-none" style={{ color: MAGENTA }}>
                CB Captains Women FC
              </div>
              <div className="text-xs tracking-widest uppercase mt-0.5" style={{ color: MIST }}>
                Coaching Staff Dashboard
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <a href="/admin" className="btn-secondary text-xs hidden sm:flex"
              style={{ borderColor: `${MAGENTA}30`, color: MAGENTA }}>
              Men's Dashboard
            </a>
            <a href="/signup" target="_blank" className="btn-secondary text-xs hidden sm:flex"
              style={{ borderColor: `${MAGENTA}30`, color: MAGENTA }}>
              View Form ↗
            </a>
            <button onClick={() => exportCSV(filtered)} className="btn-secondary text-xs"
              style={{ borderColor: `${MAGENTA}30`, color: MAGENTA }}>
              Export CSV
            </button>
            <button onClick={() => signOut({ callbackUrl: '/admin/women' })}
              className="text-xs transition-colors" style={{ color: MIST }}>
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Players', value: players.length },
            { label: 'Showing', value: filtered.length },
            { label: 'Page', value: `${page} of ${totalPages || 1}` },
            { label: 'Season', value: '2026' },
          ].map(({ label, value }) => (
            <div key={label} className="p-4 text-center rounded-xl border"
              style={{ background: 'rgba(255,255,255,0.03)', borderColor: `${MAGENTA}15` }}>
              <div className="text-2xl font-display" style={{ color: MAGENTA }}>{value}</div>
              <div className="text-xs uppercase tracking-wide mt-1" style={{ color: MIST }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-3 items-center">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: MIST }}
              fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input type="search" className="field-input pl-10"
              placeholder="Search by name, email, position…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }} />
          </div>
          <button onClick={fetchPlayers} className="btn-secondary text-sm"
            style={{ borderColor: `${MAGENTA}30`, color: MAGENTA }}>
            ↻ Refresh
          </button>
        </div>

        {/* Table */}
        <div className="rounded-xl border overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.02)', borderColor: `${MAGENTA}15` }}>
          {loading ? (
            <div className="p-12 text-center">
              <div className="text-4xl animate-pulse mb-4">⚽</div>
              <p style={{ color: MIST }}>Loading player submissions…</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-400">
              <p>{error}</p>
              <button onClick={fetchPlayers} className="btn-secondary mt-4">Try Again</button>
            </div>
          ) : players.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">⚽</div>
              <p style={{ color: MIST }}>No players yet — share the signup link!</p>
              <a href="/signup" target="_blank"
                className="inline-flex mt-4 px-6 py-3 rounded-lg font-bold text-sm uppercase tracking-wide"
                style={{ background: MAGENTA, color: WARM_WHITE }}>
                View Signup Form ↗
              </a>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="admin-table">
                <thead>
                  <tr>
                    {[
                      { key: 'firstName', label: 'Name' },
                      { key: 'email', label: 'Email' },
                      { key: 'hometown', label: 'Hometown' },
                      { key: 'preferredPosition', label: 'Position' },
                      { key: 'ncaaEligibility', label: 'NCAA' },
                      { key: 'submittedAt', label: 'Submitted' },
                    ].map(({ key, label }) => (
                      <th key={key} onClick={() => handleSort(key as SortKey)}>
                        {label} <SortIcon k={key as SortKey} />
                      </th>
                    ))}
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((player) => (
                    <tr key={player.id}>
                      <td>
                        <button onClick={() => setViewPlayer(player)}
                          className="font-medium text-left transition-colors hover:opacity-80"
                          style={{ color: WARM_WHITE }}>
                          {player.firstName}{' '}
                          {player.middleInitial ? `${player.middleInitial}. ` : ''}
                          {player.lastName}
                        </button>
                      </td>
                      <td style={{ color: MIST }}>{player.email}</td>
                      <td style={{ color: WARM_WHITE }}>{player.hometown}</td>
                      <td style={{ color: WARM_WHITE }}>{player.preferredPosition || '—'}</td>
                      <td style={{ color: WARM_WHITE }}>{player.ncaaEligibility || '—'}</td>
                      <td className="text-xs whitespace-nowrap" style={{ color: MIST }}>
                        {formatDate(player.submittedAt)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          {[
                            { label: 'View', action: () => setViewPlayer(player) },
                            { label: 'Edit', action: () => setEditPlayer(player) },
                          ].map(({ label, action }) => (
                            <button key={label} onClick={action}
                              className="text-xs transition-colors hover:opacity-80"
                              style={{ color: MIST }}>
                              {label}
                            </button>
                          ))}
                          <button onClick={() => handleDelete(player)}
                            disabled={deletingId === player.id}
                            className="text-xs transition-colors disabled:opacity-40"
                            style={{ color: MIST }}>
                            {deletingId === player.id ? '…' : 'Delete'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-6">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
              className="btn-secondary text-sm disabled:opacity-40"
              style={{ borderColor: `${MAGENTA}30`, color: MAGENTA }}>← Prev</button>
            <span className="text-sm px-4" style={{ color: MIST }}>Page {page} of {totalPages}</span>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="btn-secondary text-sm disabled:opacity-40"
              style={{ borderColor: `${MAGENTA}30`, color: MAGENTA }}>Next →</button>
          </div>
        )}
      </main>
    </div>
  )
}
