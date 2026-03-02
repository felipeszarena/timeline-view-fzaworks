import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Text,
  Button,
  Hr,
} from '@react-email/components'
import * as React from 'react'

interface DeliverableEmailProps {
  projectName: string
  projectSlug: string
  deliverableTitle: string
  deliverableDescription?: string
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://fsza.works'

export default function DeliverableEmail({
  projectName,
  projectSlug,
  deliverableTitle,
  deliverableDescription,
}: DeliverableEmailProps) {
  const ctaUrl = `${baseUrl}/p/${projectSlug}`

  return (
    <Html lang="pt-BR">
      <Head />
      <Body style={body}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={brand}>FSZA WORKS</Text>
          </Section>

          {/* Body */}
          <Section style={content}>
            <Text style={greeting}>
              Um novo entregável foi publicado no projeto{' '}
              <strong style={{ color: '#c8f06e' }}>{projectName}</strong> e aguarda
              sua revisão.
            </Text>

            {/* Deliverable card */}
            <Section style={card}>
              <Text style={cardLabel}>Entregável</Text>
              <Text style={cardTitle}>{deliverableTitle}</Text>
              {deliverableDescription && (
                <Text style={cardDescription}>{deliverableDescription}</Text>
              )}
            </Section>

            <Button href={ctaUrl} style={button}>
              Ver Entregável
            </Button>

            <Text style={hint}>
              Clique no botão acima para visualizar o entregável e registrar sua aprovação ou
              solicitar revisões.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Você recebe este e-mail pois é cliente cadastrado neste projeto.
            </Text>
            <Text style={footerBrand}>FSZA WORKS</Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

// ── Inline styles (e-mail clients não suportam CSS variables) ──────────────

const body: React.CSSProperties = {
  backgroundColor: '#0a0a0f',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  margin: 0,
  padding: '32px 16px',
}

const container: React.CSSProperties = {
  backgroundColor: '#111118',
  borderRadius: '12px',
  border: '1px solid #1e1e2e',
  maxWidth: '520px',
  margin: '0 auto',
  overflow: 'hidden',
}

const header: React.CSSProperties = {
  backgroundColor: '#0a0a0f',
  padding: '24px 32px',
  borderBottom: '1px solid #1e1e2e',
}

const brand: React.CSSProperties = {
  color: '#c8f06e',
  fontSize: '14px',
  fontWeight: '700',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  margin: 0,
}

const content: React.CSSProperties = {
  padding: '32px',
}

const greeting: React.CSSProperties = {
  color: '#e8e8f0',
  fontSize: '16px',
  lineHeight: '1.6',
  margin: '0 0 24px',
}

const card: React.CSSProperties = {
  backgroundColor: '#0a0a0f',
  border: '1px solid #1e1e2e',
  borderLeft: '3px solid #c8f06e',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '0 0 28px',
}

const cardLabel: React.CSSProperties = {
  color: '#6b6b80',
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  margin: '0 0 6px',
}

const cardTitle: React.CSSProperties = {
  color: '#e8e8f0',
  fontSize: '18px',
  fontWeight: '700',
  margin: '0 0 4px',
}

const cardDescription: React.CSSProperties = {
  color: '#6b6b80',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: '8px 0 0',
}

const button: React.CSSProperties = {
  backgroundColor: '#c8f06e',
  borderRadius: '8px',
  color: '#0a0a0f',
  display: 'inline-block',
  fontSize: '14px',
  fontWeight: '700',
  padding: '12px 28px',
  textDecoration: 'none',
  marginBottom: '24px',
}

const hint: React.CSSProperties = {
  color: '#6b6b80',
  fontSize: '13px',
  lineHeight: '1.5',
  margin: 0,
}

const divider: React.CSSProperties = {
  borderColor: '#1e1e2e',
  margin: '0 32px',
}

const footer: React.CSSProperties = {
  padding: '20px 32px 24px',
}

const footerText: React.CSSProperties = {
  color: '#6b6b80',
  fontSize: '12px',
  lineHeight: '1.5',
  margin: '0 0 4px',
}

const footerBrand: React.CSSProperties = {
  color: '#6b6b80',
  fontSize: '12px',
  fontWeight: '600',
  margin: 0,
}
