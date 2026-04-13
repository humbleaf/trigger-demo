'use client'
import type { Scenario, TraceEvent } from '@/lib/demo-fixtures'

interface Props {
  proof:   TraceEvent & { type: 'proof' }
  fixture: Scenario
}

export function ProofCard({ proof, fixture }: Props) {
  const hasCid     = !!proof.cid
  const hasTxHash  = !!proof.txHash
  const hasLink    = !!proof.explorerUrl
  const anchoring  = !hasCid && !hasTxHash

  return (
    <div style={{
      background:   'var(--surface-2)',
      border:       '1px solid var(--border)',
      borderRadius: 12,
      padding:      '14px 18px',
      animation:    'fadeSlideUp 0.35s ease both',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 10, fontFamily: 'var(--mono)' }}>
        PROOF OF {fixture.outcome}
      </div>

      {anchoring ? (
        <div style={{ fontSize: 13, color: 'var(--text-3)', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--text-3)', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
          Anchoring to Base Sepolia...
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {hasCid && (
            <div style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--text-3)' }}>IPFS  </span>
              {proof.cid}
            </div>
          )}
          {hasTxHash && (
            <div style={{ fontSize: 12, fontFamily: 'var(--mono)', color: 'var(--text-2)' }}>
              <span style={{ color: 'var(--text-3)' }}>TX    </span>
              {proof.txHash?.slice(0, 20)}...
            </div>
          )}
          {hasLink && (
            <a
              href={proof.explorerUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginTop:      6,
                display:        'inline-flex',
                alignItems:     'center',
                gap:            6,
                fontSize:       12,
                color:          'var(--accent)',
                textDecoration: 'none',
                fontWeight:     500,
              }}
            >
              {fixture.proofLabel} ↗
            </a>
          )}
          {!hasLink && (hasCid || hasTxHash) && (
            <div style={{ fontSize: 11, color: 'var(--text-3)', marginTop: 4 }}>
              Recorded on Base Sepolia
            </div>
          )}
        </div>
      )}
    </div>
  )
}
