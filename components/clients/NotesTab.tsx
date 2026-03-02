'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateClientNotesAction } from '@/lib/actions'

interface NotesTabProps {
  clientId: string
  initialNotes: string
}

export default function NotesTab({ clientId, initialNotes }: NotesTabProps) {
  const router = useRouter()
  const [notes, setNotes] = useState(initialNotes)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  async function handleSave() {
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const res = await updateClientNotesAction(clientId, notes)
      if (res?.error) {
        setError(res.error)
      } else {
        setSaved(true)
        router.refresh()
        setTimeout(() => setSaved(false), 3000)
      }
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <textarea
        className="w-full px-4 py-3 rounded-lg bg-bg border border-border text-text font-mono text-sm outline-none focus:border-accent transition-colors resize-y min-h-[280px]"
        value={notes}
        onChange={e => {
          setNotes(e.target.value)
          setSaved(false)
        }}
        placeholder="Anotações gerais, briefing, histórico do cliente…"
      />
      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 rounded-lg bg-accent text-bg text-sm font-bold font-sans hover:opacity-90 transition-opacity disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed"
        >
          {saving ? 'salvando…' : 'Salvar Notas'}
        </button>
        {saved && (
          <span className="text-xs font-mono" style={{ color: 'var(--success)' }}>
            Salvo!
          </span>
        )}
        {error && (
          <span className="text-xs font-mono text-warn">{error}</span>
        )}
      </div>
    </div>
  )
}
