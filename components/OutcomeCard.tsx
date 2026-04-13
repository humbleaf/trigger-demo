'use client'
import type { Scenario, TraceEvent } from '@/lib/demo-fixtures'

interface Props {
  outcome: TraceEvent & { type: 'outcome' }
  fixture: Scenario
  onReset: () => void
}

export function OutcomeCard({ outcome, fixture, onReset }: Props) {
  const s      = outcome.outcome
  const isPass = s === 'SETTLED'
  const color  = isPass ? 'var(--green)' : s === 'DENIED' ? 'var(--red)' : 'var(--amber)'

  return (
    <div style={{
      background:   'var(--surface)',
      border:       `1px solid ${color}`,
      borderRadius: 12,
      padding:      '18px 20px',
      animation:    'fadeSlideUp 0.3s ease both',
    }}>
      {fixture.outcomeLines.map((line, i) => (
        <div key={i} style={{
          fontSize:   i === 0 ? 15 : 13,
          fontWeight: i === 0 ? 700 : 400,
          color:      i === 0 ? color : 'var(--text-2)',
          lineHeight: 1.7,
          animation:  `fadeSlideUp 0.25s ease ${i * 0.06}s both`,
        }}>
          {line}
        </div>
      ))}

      <button
        onClick={onReset}
        style={{
          marginTop:    14,
          padding:      '7px 14px',
          background:   'transparent',
          border:       '1px solid var(--border-2)',
          borderRadius: 6,
          color:        'var(--text-3)',
          fontSize:     12,
          cursor:       'pointer',
          fontFamily:   'var(--font)',
          transition:   'all 0.15s',
        }}
      >
        ↺ Run again
      </button>
    </div>
  )
}
