// src/app/admin/dashboard/page.tsx
// Admin dashboard — full CRUD for player records
'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { signOut } from 'next-auth/react'
import { PlayerRecord } from '@/types/player'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  if (!iso) return '—'
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function exportCSV(players: PlayerRecord[]) {
  const headers = [
    'ID', 'Submitted', 'First Name', 'MI', 'Last Name', 'DOB', 'Years Exp',
    'Hometown', 'Phone', 'Email', 'Instagram', 'TikTok',
    'Fav Club', 'Fav Player', 'Hype Song', 'Something Random',
  ]

  const rows = players.map((p) => [
    p.id, formatDate(p.submittedAt), p.firstName, p.middleInitial, p.lastName,
    p.dateOfBirth, p.yearsOfExperience, p.hometown, p.phone, p.email,
    p.instagramHandle, p.tiktokHandle, p.favoriteSoccerClub, p.favoritePlayer,
    p.hypeSong, `"${p.somethingRandom.replace(/"/g, '""')}"`,
  ])

  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `captains-fc-players-${new Date().toISOString().split('T')[0]}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditModal({
  player,
  onClose,
  onSave,
}: {
  player: PlayerRecord
  onClose: () => void
  onSave: (updated: PlayerRecord) => void
}) {
  const [form, setForm] = useState<PlayerRecord>(player)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleChange = (field: keyof PlayerRecord, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setError(null)

    try {
      const res = await fetch(`/api/players/${player.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      const json = await res.json()
      if (!res.ok) {
        setError(json.message || 'Failed to save.')
      } else {
        onSave(form)
      }
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const fields: Array<{ key: keyof PlayerRecord; label: string; type?: string }> = [
    { key: 'firstName', label: 'First Name' },
    { key: 'middleInitial', label: 'Middle Initial' },
    { key: 'lastName', label: 'Last Name' },
    { key: 'dateOfBirth', label: 'Date of Birth', type: 'date' },
    { key: 'yearsOfExperience', label: 'Years Experience', type: 'number' },
    { key: 'hometown', label: 'Hometown' },
    { key: 'phone', label: 'Phone', type: 'tel' },
    { key: 'email', label: 'Email', type: 'email' },
    { key: 'instagramHandle', label: 'Instagram' },
    { key: 'tiktokHandle', label: 'TikTok' },
    { key: 'favoriteSoccerClub', label: 'Favorite Club' },
    { key: 'favoritePlayer', label: 'Favorite Player' },
    { key: 'hypeSong', label: 'Hype Song' },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-fade-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-display text-captain-gold">
            Edit — {player.firstName} {player.lastName}
          </h2>
          <button onClick={onClose} className="text-captain-anchor hover:text-captain-white transition-colors text-2xl leading-none">
            ×
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {fields.map(({ key, label, type = 'text' }) => (
            <div key={key}>
              <label className="field-label">{label}</label>
              <input
                type={type}
                className="field-input"
                value={form[key] as string}
                onChange={(e) => handleChange(key, type === 'number' ? Number(e.target.value) : e.target.value)}
              />
            </div>
          ))}

          <div className="sm:col-span-2">
            <label className="field-label">Something Random</label>
            <textarea
              className="field-input"
              rows={3}
              value={form.somethingRandom}
              onChange={(e) => handleChange('somethingRandom', e.target.value)}
            />
          </div>
        </div>

        {error && (
          <div className="mt-4 px-4 py-3 rounded-lg border border-red-500/30 bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
            {saving ? 'Saving…' : 'Save Changes'}
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Player Detail Drawer ─────────────────────────────────────────────────────

function PlayerDetail({
  player,
  onClose,
}: {
  player: PlayerRecord
  onClose: () => void
}) {
  const rows: Array<[string, string]> = [
    ['Submitted', formatDate(player.submittedAt)],
    ['Date of Birth', player.dateOfBirth],
    ['Experience', `${player.yearsOfExperience} year${player.yearsOfExperience !== 1 ? 's' : ''}`],
    ['Preferred Position', player.preferredPosition || '—'],
    ['Secondary Position', player.secondaryPosition || '—'],
    ['Hometown', player.hometown],
    ['Phone', player.phone],
    ['Email', player.email],
    ['Instagram', player.instagramHandle || '—'],
    ['TikTok', player.tiktokHandle || '—'],
    ['Favorite Club', player.favoriteSoccerClub],
    ['Favorite Player', player.favoritePlayer],
    ['Hype Song', player.hypeSong],
    ['Something Random', player.somethingRandom],
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card w-full max-w-md max-h-[85vh] overflow-y-auto p-6 animate-fade-up">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-xl font-display text-captain-gold">
              {player.firstName} {player.middleInitial ? `${player.middleInitial}. ` : ''}{player.lastName}
            </h2>
            <p className="text-captain-anchor text-xs mt-0.5">Row #{player.id}</p>
          </div>
          <button onClick={onClose} className="text-captain-anchor hover:text-captain-white text-2xl leading-none mt-1">
            ×
          </button>
        </div>

        <dl className="space-y-3">
          {rows.map(([label, value]) => (
            <div key={label} className="flex gap-3">
              <dt className="text-captain-anchor text-xs font-bold tracking-wide uppercase min-w-[110px] pt-0.5">
                {label}
              </dt>
              <dd className="text-captain-mist text-sm flex-1 break-words">{value}</dd>
            </div>
          ))}
        </dl>

        <button onClick={onClose} className="btn-secondary w-full mt-6">
          Close
        </button>
      </div>
    </div>
  )
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────

type SortKey = keyof PlayerRecord
type SortDir = 'asc' | 'desc'

export default function DashboardPage() {
  const [players, setPlayers] = useState<PlayerRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('submittedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [page, setPage] = useState(1)
  const [editPlayer, setEditPlayer] = useState<PlayerRecord | null>(null)
  const [viewPlayer, setViewPlayer] = useState<PlayerRecord | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const PER_PAGE = 20

  // ─── Fetch players ──────────────────────────────────────────────────────────

  const fetchPlayers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/players')
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

  // ─── Filter + Sort ──────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim()
    const list = q
      ? players.filter((p) =>
          [p.firstName, p.lastName, p.email, p.hometown, p.favoriteSoccerClub, p.phone]
            .some((v) => v.toLowerCase().includes(q))
        )
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
    if (sortKey !== k) return <span className="opacity-20">↕</span>
    return <span className="text-captain-gold">{sortDir === 'asc' ? '↑' : '↓'}</span>
  }

  // ─── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (player: PlayerRecord) => {
    const confirmed = window.confirm(
      `Delete ${player.firstName} ${player.lastName}? This cannot be undone.`
    )
    if (!confirmed) return

    setDeletingId(player.id)
    try {
      const res = await fetch(`/api/players/${player.id}`, { method: 'DELETE' })
      if (res.ok) {
        setPlayers((prev) => prev.filter((p) => p.id !== player.id))
      } else {
        alert('Failed to delete. Please try again.')
      }
    } catch {
      alert('Network error.')
    } finally {
      setDeletingId(null)
    }
  }

  // ─── Edit save ──────────────────────────────────────────────────────────────

  const handleEditSave = (updated: PlayerRecord) => {
    setPlayers((prev) => prev.map((p) => (p.id === updated.id ? updated : p)))
    setEditPlayer(null)
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-captain-navy">
      {/* Modals */}
      {editPlayer && (
        <EditModal
          player={editPlayer}
          onClose={() => setEditPlayer(null)}
          onSave={handleEditSave}
        />
      )}
      {viewPlayer && (
        <PlayerDetail player={viewPlayer} onClose={() => setViewPlayer(null)} />
      )}

      {/* Header */}
      <header className="border-b border-captain-gold/10 sticky top-0 z-40"
        style={{ background: 'var(--navy)', backdropFilter: 'blur(8px)' }}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-xl">⚓</span>
            <div>
              <div className="text-captain-gold font-display font-bold text-base leading-none">
                CB Captains FC
              </div>
              <div className="text-captain-anchor text-xs tracking-widest uppercase mt-0.5">
                Flag Officers Dashboard
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a href="/join" target="_blank" className="btn-secondary text-xs hidden sm:flex">
              View Form ↗
            </a>
            <button
              onClick={() => exportCSV(filtered)}
              className="btn-secondary text-xs"
              title="Export to CSV"
            >
              Export CSV
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/admin' })}
              className="text-captain-anchor hover:text-captain-white text-xs transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Players', value: players.length },
            { label: 'Showing', value: filtered.length },
            { label: 'Page', value: `${page} of ${totalPages || 1}` },
            { label: 'Season', value: '2026' },
          ].map(({ label, value }) => (
            <div key={label} className="card p-4 text-center">
              <div className="text-2xl font-display text-captain-gold">{value}</div>
              <div className="text-captain-anchor text-xs uppercase tracking-wide mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="mb-6 flex gap-3 items-center">
          <div className="relative flex-1 max-w-md">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-captain-anchor w-4 h-4"
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              className="field-input pl-10"
              placeholder="Search by name, email, hometown…"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            />
          </div>
          <button onClick={fetchPlayers} className="btn-secondary text-sm" title="Refresh">
            ↻ Refresh
          </button>
        </div>

        {/* Table */}
        <div className="card overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="text-captain-gold text-4xl animate-pulse mb-4">⚓</div>
              <p className="text-captain-anchor">Loading crew manifest…</p>
            </div>
          ) : error ? (
            <div className="p-12 text-center text-red-400">
              <p>{error}</p>
              <button onClick={fetchPlayers} className="btn-secondary mt-4">Try Again</button>
            </div>
          ) : players.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">🏴‍☠️</div>
              <p className="text-captain-mist">No players yet — share the signup link!</p>
              <a href="/join" target="_blank" className="btn-primary inline-flex mt-4">
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
                      { key: 'yearsOfExperience', label: 'Exp' },
                      { key: 'preferredPosition', label: 'Position' },
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
                        <button
                          onClick={() => setViewPlayer(player)}
                          className="text-captain-white hover:text-captain-gold transition-colors font-medium text-left"
                        >
                          {player.firstName}{' '}
                          {player.middleInitial ? `${player.middleInitial}. ` : ''}
                          {player.lastName}
                        </button>
                      </td>
                      <td className="text-captain-anchor">{player.email}</td>
                      <td>{player.hometown}</td>
                      <td className="text-center">{player.yearsOfExperience}y</td>
                      <td className="text-captain-anchor text-xs whitespace-nowrap">
                        {formatDate(player.submittedAt)}
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setViewPlayer(player)}
                            className="text-captain-anchor hover:text-captain-gold transition-colors text-xs"
                            title="View details"
                          >
                            View
                          </button>
                          <button
                            onClick={() => setEditPlayer(player)}
                            className="text-captain-anchor hover:text-captain-gold transition-colors text-xs"
                            title="Edit"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => handleDelete(player)}
                            disabled={deletingId === player.id}
                            className="text-captain-anchor hover:text-red-400 transition-colors text-xs disabled:opacity-40"
                            title="Delete"
                          >
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
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="btn-secondary text-sm disabled:opacity-40"
            >
              ← Prev
            </button>
            <span className="text-captain-anchor text-sm px-4">
              Page {page} of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="btn-secondary text-sm disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
