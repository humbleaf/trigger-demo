'use client'
import type { Scenario } from '@/lib/demo-fixtures'

interface Props {
  scenario:  Scenario
  label:     string
  variant:   'pass' | 'blocked'
  disabled:  boolean
  active:    boolean
  onRun:     () => void
}

export function ScenarioCard({ scenario, label, variant, disabled, active, onRun }: Props) {
  const isPass = variant === 'pass'

  return (
    <div style={{
      background:   active ? 'var(--surface-2)' : 'var(--surface)',
      border:       `1px solid ${active ? 'var(--accent)' : 'var(--border)'}`,
      borderRadius: 12,
      padding:      '16px 18px',
      transition:   'all 0.2s',
    }}>
      {/* Meta */}
      <div style={{ marginBottom: 12 }}>
        <div style={row}>
          <span style={label_}>Agent</span>
          <span style={value_}>{scenario.actor}</span>
        </div>
        <div style={row}>
          <span style={label_}>Target</span>
          <span style={value_}>{scenario.target}</span>
        </div>
        <div style={row}>
          <span style={label_}>Value</span>
          <span style={{ ...value_, color: 'var(--text)', fontWeight: 600 }}>{scenario.value}</span>
        </div>
        {scenario.invoiceId && (
          <div style={row}>
            <span style={label_}>Invoice</span>
            <span style={{ ...value_, fontFamily: 'var(--mono)', fontSize: 11 }}>{scenario.invoiceId}</span>
          </div>
        )}
      </div>

      {/* Button */}
      <button
        onClick={onRun}
        disabled={disabled}
        style={{
          width:        '100%',
          padding:      '10px 14px',
          background:   disabled
            ? 'var(--surface-2)'
            : isPass
              ? 'var(--accent-dim)'
              : 'var(--red-dim)',
          border:       `1px solid ${disabled ? 'var(--border)' : isPass ? 'var(--accent)' : 'var(--red)'}`,
          borderRadius: 8,
          color:        disabled
            ? 'var(--text-3)'
            : isPass
              ? 'var(--accent)'
              : 'var(--red)',
          fontSize:     14,
          fontWeight:   600,
          cursor:       disabled ? 'not-allowed' : 'pointer',
          fontFamily:   'var(--font)',
          transition:   'all 0.15s',
          display:      'flex',
          alignItems:   'center',
          justifyContent: 'center',
          gap:            8,
        }}
      >
        <span>{isPass ? '▶' : '⊗'}</span>
        <span>{label}</span>
      </button>
    </div>
  )
}

const row: React.CSSProperties = {
  display:       'flex',
  justifyContent:'space-between',
  alignItems:    'center',
  padding:       '3px 0',
  gap:           8,
}
const label_: React.CSSProperties = {
  fontSize:   12,
  color:      'var(--text-3)',
  fontWeight: 500,
  flexShrink: 0,
}
const value_: React.CSSProperties = {
  fontSize: 12,
  color:    'var(--text-2)',
  textAlign: 'right',
}
