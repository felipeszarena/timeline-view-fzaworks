'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { ClientAttachment } from '@/lib/types'
import { uploadClientAttachmentAction, deleteClientAttachmentAction } from '@/lib/actions'

export interface AttachmentWithUrl extends ClientAttachment {
  signedUrl: string
}

interface AttachmentsTabProps {
  clientId: string
  attachments: AttachmentWithUrl[]
}

function formatBytes(bytes?: number | null): string {
  if (!bytes) return ''
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export default function AttachmentsTab({ clientId, attachments }: AttachmentsTabProps) {
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError('')

    const formData = new FormData()
    formData.append('file', file)
    formData.append('clientId', clientId)

    try {
      const res = await uploadClientAttachmentAction(formData)
      if (res?.error) {
        setError(res.error)
      } else {
        router.refresh()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao enviar arquivo')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  async function handleDelete(att: AttachmentWithUrl) {
    if (!confirm(`Deletar "${att.name}"? Esta ação não pode ser desfeita.`)) return
    const res = await deleteClientAttachmentAction(att.id, att.url, clientId)
    if (res?.error) setError(res.error)
    else router.refresh()
  }

  return (
    <div className="flex flex-col gap-6">

      {/* Upload area */}
      <div className="border border-dashed border-border rounded-xl p-8 flex flex-col items-center gap-3 hover:border-accent/40 transition-colors">
        <p className="text-sm font-mono text-muted">Anexar documento, contrato ou referência</p>
        <label
          className={`cursor-pointer px-5 py-2.5 rounded-lg bg-surface border border-border text-sm font-mono transition-colors ${
            uploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-accent text-text'
          }`}
        >
          {uploading ? 'enviando…' : 'Escolher arquivo'}
          <input
            ref={fileRef}
            type="file"
            className="sr-only"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
        <p className="text-xs font-mono text-muted">Máximo 10 MB por arquivo</p>
      </div>

      {error && <p className="text-sm text-warn font-mono">{error}</p>}

      {/* File list */}
      {attachments.length === 0 ? (
        <p className="text-sm font-mono text-muted text-center py-6">
          Nenhum arquivo anexado ainda.
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {attachments.map(att => (
            <div
              key={att.id}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-surface border border-border"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-mono text-text truncate">{att.name}</p>
                <p className="text-xs font-mono text-muted">
                  {formatBytes(att.size)}
                  {att.mime_type && att.size ? ' · ' : ''}
                  {att.mime_type}
                </p>
              </div>
              {att.signedUrl && (
                <a
                  href={att.signedUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-accent hover:underline shrink-0"
                >
                  baixar
                </a>
              )}
              <button
                onClick={() => handleDelete(att)}
                className="text-xs font-mono text-muted hover:text-danger transition-colors shrink-0"
              >
                deletar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
