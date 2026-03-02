// ── SVG Icons ────────────────────────────────────────────────

const DriveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 87.3 78" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M6.6 66.85l3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3L27.5 53H0c0 1.55.4 3.1 1.2 4.5z" fill="currentColor" opacity=".6"/>
    <path d="M43.65 25L29.9 0c-1.35.8-2.5 1.9-3.3 3.3L1.2 48.5A9 9 0 000 53h27.5z" fill="currentColor" opacity=".8"/>
    <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5H59.8l5.8 11.25z" fill="currentColor"/>
    <path d="M43.65 25L57.4 0H29.9z" fill="currentColor" opacity=".4"/>
    <path d="M59.8 53H87.3L62.55 9.3c-.8-1.4-1.95-2.5-3.3-3.3z" fill="currentColor" opacity=".7"/>
    <path d="M27.5 53l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h51.9c1.6 0 3.15-.45 4.5-1.2L59.8 53z" fill="currentColor" opacity=".5"/>
  </svg>
)

const FigmaIcon = () => (
  <svg width="16" height="18" viewBox="0 0 38 57" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M19 28.5a9.5 9.5 0 1 1 19 0 9.5 9.5 0 0 1-19 0z" fill="currentColor"/>
    <path d="M0 47.5A9.5 9.5 0 0 1 9.5 38H19v9.5a9.5 9.5 0 0 1-19 0z" fill="currentColor" opacity=".6"/>
    <path d="M19 0v19h9.5a9.5 9.5 0 1 0 0-19H19z" fill="currentColor" opacity=".8"/>
    <path d="M0 9.5A9.5 9.5 0 0 0 9.5 19H19V0H9.5A9.5 9.5 0 0 0 0 9.5z" fill="currentColor" opacity=".7"/>
    <path d="M0 28.5A9.5 9.5 0 0 0 9.5 38H19V19H9.5A9.5 9.5 0 0 0 0 28.5z" fill="currentColor" opacity=".5"/>
  </svg>
)

const LinkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>
)

// ── Component ────────────────────────────────────────────────

type Variant = 'drive' | 'figma' | 'custom'

const ICONS: Record<Variant, React.ReactNode> = {
  drive:  <DriveIcon />,
  figma:  <FigmaIcon />,
  custom: <LinkIcon />,
}

const DEFAULT_LABELS: Record<Variant, string> = {
  drive:  'Google Drive',
  figma:  'Figma',
  custom: 'Link',
}

interface LinkButtonProps {
  href: string
  variant: Variant
  label?: string
}

export default function LinkButton({ href, variant, label }: LinkButtonProps) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-2.5 px-4 py-2.5 rounded-lg border border-border text-muted font-mono text-sm hover:border-accent hover:text-accent transition-colors"
    >
      {ICONS[variant]}
      <span>{label ?? DEFAULT_LABELS[variant]}</span>
    </a>
  )
}
