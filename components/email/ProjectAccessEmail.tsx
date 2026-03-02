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
import type { Project } from '@/lib/types'

interface ProjectAccessEmailProps {
  projectName:     string
  projectSlug:     string
  projectStatus:   Project['status']
  projectPassword: string
  progressPercent: number
  customMessage?:  string
  sentBy:          string
  baseUrl:         string
}

const STATUS_STYLES: Record<Project['status'], { bg: string; color: string; label: string }> = {
  active:  { bg: 'rgba(110,212,160,0.2)', color: '#6ed4a0', label: 'Ativo'     },
  review:  { bg: 'rgba(240,193,75,0.2)',  color: '#f0c14b', label: 'Revisão'   },
  planned: { bg: 'rgba(123,110,246,0.2)', color: '#7b6ef6', label: 'Planejado' },
  done:    { bg: 'rgba(107,107,128,0.2)', color: '#6b6b80', label: 'Concluído' },
}

export default function ProjectAccessEmail({
  projectName,
  projectSlug,
  projectStatus,
  projectPassword,
  progressPercent,
  customMessage,
  sentBy,
  baseUrl,
}: ProjectAccessEmailProps) {
  const ctaUrl   = `${baseUrl}/p/${projectSlug}`
  const statusCfg = STATUS_STYLES[projectStatus]

  return (
    <Html lang="pt-BR">
      <Head />
      <Body style={body}>
        <Container style={container}>

          {/* ── Header ── */}
          <Section style={header}>
            <Text style={brand}>FSZA WORKS</Text>
          </Section>

          {/* ── Content ── */}
          <Section style={content}>

            {/* Greeting */}
            <Text style={greeting}>
              Você recebeu acesso ao projeto{' '}
              <strong style={{ color: '#c8f06e' }}>{projectName}</strong>.
              Abaixo estão suas credenciais de acesso.
            </Text>

            {/* Custom message from admin */}
            {customMessage && (
              <Section style={messageBox}>
                <Text style={messageLabel}>Mensagem de {sentBy}</Text>
                <Text style={messageText}>{customMessage}</Text>
              </Section>
            )}

            {/* Project info card */}
            <Section style={card}>
              {/* Status badge */}
              <div style={{ marginBottom: 16 }}>
                <span style={{
                  display:       'inline-block',
                  backgroundColor: statusCfg.bg,
                  color:         statusCfg.color,
                  fontSize:      11,
                  fontWeight:    '700',
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                  padding:       '3px 10px',
                  borderRadius:  99,
                }}>
                  {statusCfg.label}
                </span>
              </div>

              <Text style={cardLabel}>Projeto</Text>
              <Text style={cardTitle}>{projectName}</Text>

              {/* Progress bar */}
              <div style={{ marginTop: 12, marginBottom: 4 }}>
                <div style={{
                  display:         'flex',
                  justifyContent:  'space-between',
                  marginBottom:    6,
                }}>
                  <span style={{ color: '#6b6b80', fontSize: 11 }}>Progresso</span>
                  <span style={{ color: '#c8f06e', fontSize: 11, fontWeight: '700' }}>
                    {progressPercent}%
                  </span>
                </div>
                <div style={{
                  backgroundColor: '#1e1e2e',
                  borderRadius:    99,
                  height:          6,
                  width:           '100%',
                  overflow:        'hidden',
                }}>
                  <div style={{
                    backgroundColor: '#c8f06e',
                    borderRadius:    99,
                    height:          6,
                    width:           `${progressPercent}%`,
                  }} />
                </div>
              </div>
            </Section>

            {/* Access credentials card */}
            <Section style={credentialsCard}>
              <Text style={credLabel}>Credenciais de Acesso</Text>
              <div style={credRow}>
                <span style={credKey}>URL</span>
                <span style={credVal}>{ctaUrl}</span>
              </div>
              <div style={{ height: 1, backgroundColor: '#1e1e2e', margin: '8px 0' }} />
              <div style={credRow}>
                <span style={credKey}>Senha</span>
                <span style={{ ...credVal, color: '#c8f06e', fontFamily: 'monospace' }}>
                  {projectPassword}
                </span>
              </div>
            </Section>

            <Button href={ctaUrl} style={button}>
              Acessar Projeto →
            </Button>

            <Text style={hint}>
              Use a senha acima na tela de acesso do projeto.
              Em caso de dúvidas, entre em contato com {sentBy}.
            </Text>
          </Section>

          <Hr style={divider} />

          {/* ── Footer ── */}
          <Section style={footer}>
            <Text style={footerText}>
              Enviado por {sentBy} via FSZA WORKS.
            </Text>
            <Text style={footerBrand}>FSZA WORKS · fsza.works</Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

// ── Inline styles ──────────────────────────────────────────────

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

const messageBox: React.CSSProperties = {
  backgroundColor: '#0a0a0f',
  border: '1px solid #1e1e2e',
  borderLeft: '3px solid #7b6ef6',
  borderRadius: '8px',
  padding: '14px 18px',
  margin: '0 0 20px',
}

const messageLabel: React.CSSProperties = {
  color: '#7b6ef6',
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  margin: '0 0 6px',
}

const messageText: React.CSSProperties = {
  color: '#e8e8f0',
  fontSize: '14px',
  lineHeight: '1.5',
  margin: 0,
}

const card: React.CSSProperties = {
  backgroundColor: '#0a0a0f',
  border: '1px solid #1e1e2e',
  borderLeft: '3px solid #c8f06e',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '0 0 16px',
}

const cardLabel: React.CSSProperties = {
  color: '#6b6b80',
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  margin: '0 0 4px',
}

const cardTitle: React.CSSProperties = {
  color: '#e8e8f0',
  fontSize: '18px',
  fontWeight: '700',
  margin: 0,
}

const credentialsCard: React.CSSProperties = {
  backgroundColor: '#0a0a0f',
  border: '1px solid #1e1e2e',
  borderRadius: '8px',
  padding: '16px 20px',
  margin: '0 0 24px',
}

const credLabel: React.CSSProperties = {
  color: '#6b6b80',
  fontSize: '11px',
  fontWeight: '600',
  letterSpacing: '0.08em',
  textTransform: 'uppercase',
  margin: '0 0 10px',
}

const credRow: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 12,
}

const credKey: React.CSSProperties = {
  color: '#6b6b80',
  fontSize: '12px',
  width: 48,
  flexShrink: 0,
}

const credVal: React.CSSProperties = {
  color: '#e8e8f0',
  fontSize: '13px',
  wordBreak: 'break-all',
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
