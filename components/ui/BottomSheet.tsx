'use client'

import { useEffect } from 'react'

interface BottomSheetProps {
  open: boolean
  onClose: () => void
  children: React.ReactNode
}

export default function BottomSheet({ open, onClose, children }: BottomSheetProps) {
  // Lock body scroll while sheet is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [open])

  if (!open) return null

  return (
    <>
      {/* Overlay — click to close */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'rgba(0,0,0,0.55)' }}
        onClick={onClose}
        aria-hidden
      />

      {/* Sheet */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-2xl"
        style={{
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          maxHeight: '90vh',
          animation: 'bs-slide-up 0.22s cubic-bezier(0.32,0.72,0,1)',
        }}
      >
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div
            className="w-10 h-1 rounded-full"
            style={{ background: 'var(--border)' }}
          />
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {children}
        </div>
      </div>

      <style>{`
        @keyframes bs-slide-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
      `}</style>
    </>
  )
}
