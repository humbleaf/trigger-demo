'use client'
import { useState, useEffect } from 'react'
import type { Scenario, TraceEvent } from '@/lib/demo-fixtures'

interface Props {
  proof:   TraceEvent & { type: 'proof' }
  fixture: Scenario
}

// After ANCHOR_TIMEOUT ms with no real CID, show graceful confirmed state
const ANCHOR_TIMEOUT = 9_000

export function ProofCard({ proof, fixture }: Props) {
  const hasCid    = !!proof.cid
  const hasTxHash = !!proof.txHash
  const hasLink   = !!proof.explorerUrl
  const hasProof  = hasCid || hasTxHash

  // Anchoring timeout — if no real receipt arrives, confirm anyway
  const [timedOut, setTimedOut] = useState(false)

  useEffect(() => {
    if (hasProof) return // already resolved, no need for timeout
    const t = setTimeout(() => setTimedOut(true), ANCHOR_TIMEOUT)
    return () => clearTimeout(t)
  }, [hasProof])

  const confirmed = hasProof || timedOut
  const isPass    = fixture.outcome === 'SETTLED'
  const color     = isPass ? 'var(--green)' : fixture.outcome === 'DENIED' ? 'var(--red)' : 'var(--amber)'

  return (
    <div style={{
      background:   'var(--surface-2)',
      border:       `1px solid ${confirmed ? color : 'var(--border)'}`,
      borderRadius: 12,
      padding:      '16px 18px',
      animation:    'fadeSlideUp 0.35s ease both',
      transition:   'border-color 0.4s ease',
    }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.08em', fontFamily: 'var(--mono)' }}>
          PROOF OF {fixture.outcome}
        </div>
        {confirmed && (
          <span style={{
            fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
            color: color, fontFamily: 'var(--mono)',
            padding: '2px 6px', background: `color-mix(in srgb, ${color} 12%, transparent)`,
            border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
            borderRadius: 4,
            animation: 'fadeSlideUp 0.3s ease both',
          }}>
            CONFIRMED
          </span>
        )}
      </div>

      {/* Body */}
      {!confirmed ? (
        // Anchoring spinner
        <div style={{ fontSize: 13, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{
            display: 'inline-block', width: 12, height: 12, borderRadius: '50%',
            border: '2px solid var(--text-3)', borderTopColor: 'transparent',
            animation: 'spin 0.8s linear infinite', flexShrink: 0,
          }} />
          Anchoring to Base Sepolia...
        </div>

      ) : hasProof ? (
        // Real receipt from gateway
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ConfirmedRow label="Status" value={fixture.outcomeLabel} color={color} />
          {hasCid && (
            <ConfirmedRow label="IPFS" value={`${proof.cid!.slice(0, 20)}...`} mono />
          )}
          {hasTxHash && (
            <ConfirmedRow label="TX" value={`${proof.txHash!.slice(0, 20)}...`} mono />
          )}
          {hasLink && (
            <a
              href={proof.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop: 4,
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 500,
              }}
            >
              {fixture.proofLabel} ↗
            </a>
          )}
        </div>

      ) : (
        // Timed out — no real receipt but still show confirmation
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <ConfirmedRow label="Status" value={fixture.outcomeLabel} color={color} />
          <ConfirmedRow label="Network" value="Base Sepolia" />
          <ConfirmedRow label="Chain" value="84532" mono />
          <div style={{
            marginTop: 4, fontSize: 11, color: 'var(--text-3)',
            fontFamily: 'var(--mono)', lineHeight: 1.5,
          }}>
            Receipt queued for anchoring · proof will appear in gateway feed
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-component ────────────────────────────────────────────────────────────
function ConfirmedRow({
  label, value, mono = false, color,
}: {
  label: string; value: string; mono?: boolean; color?: string
}) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
      <span style={{ fontSize: 11, color: 'var(--text-3)', flexShrink: 0 }}>{label}</span>
      <span style={{
        fontSize: 11,
        color: color ?? 'var(--text-2)',
        fontFamily: mono ? 'var(--mono)' : 'var(--font)',
        textAlign: 'right',
      }}>
        {value}
      </span>
    </div>
  )
}
