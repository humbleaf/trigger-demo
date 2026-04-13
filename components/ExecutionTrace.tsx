'use client'
import { useEffect, useRef } from 'react'
import type { TraceEvent } from '@/lib/demo-fixtures'

interface Props {
  events:  TraceEvent[]
  outcome: (TraceEvent & { type: 'outcome' }) | null
  idle:    boolean
}

export function ExecutionTrace({ events, outcome, idle }: Props) {
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [events, outcome])

  return (
    <div style={container}>
      <div style={header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={dot(outcome ? (outcome.outcome === 'SETTLED' ? 'green' : 'red') : events.length > 0 ? 'amber' : 'dim')} />
          <span style={headerLabel}>EXECUTION TRACE</span>
        </div>
        {events.length > 0 && !outcome && (
          <span style={liveTag}>● LIVE</span>
        )}
      </div>

      <div style={body}>
        {idle && (
          <div style={idleMsg}>
            <span style={{ fontSize: 20 }}>⬡</span>
            <span>Select a scenario to run</span>
          </div>
        )}

        {events.map((ev, i) => (
          <EventRow key={i} event={ev} index={i} />
        ))}

        {outcome && <OutcomeRow outcome={outcome} />}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}

function EventRow({ event, index }: { event: TraceEvent; index: number }) {
  const style: React.CSSProperties = {
    display:       'flex',
    alignItems:    'flex-start',
    gap:           10,
    padding:       '5px 0',
    animation:     'fadeSlideUp 0.2s ease both',
    animationDelay:`${index * 0.02}s`,
  }

  if (event.type === 'start') return (
    <div style={style}>
      <span style={{ color: 'var(--text-3)', fontFamily: 'var(--mono)', fontSize: 11, minWidth: 52, marginTop: 1 }}>
        +{event.ts}ms
      </span>
      <span style={{ color: 'var(--text-3)', fontSize: 13 }}>── {event.label}</span>
    </div>
  )

  if (event.type === 'submit') return (
    <div style={style}>
      <span style={{ color: 'var(--text-3)', fontFamily: 'var(--mono)', fontSize: 11, minWidth: 52, marginTop: 1 }}>
        +{event.ts}ms
      </span>
      <span style={{ color: 'var(--accent)', fontSize: 13 }}>→ {event.label}</span>
    </div>
  )

  if (event.type === 'policy') {
    const pass = event.pass
    return (
      <div style={{ ...style, flexDirection: 'column', gap: 2 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ color: 'var(--text-3)', fontFamily: 'var(--mono)', fontSize: 11, minWidth: 52 }}>
            +{event.ts}ms
          </span>
          <span style={{ fontSize: 12, color: pass ? 'var(--green)' : 'var(--red)', fontWeight: 700 }}>
            {pass ? '✓' : '✗'}
          </span>
          <span style={{ fontSize: 13, color: pass ? 'var(--text)' : 'var(--red)' }}>
            {event.label}
          </span>
        </div>
        {!pass && event.detail && (
          <div style={{ paddingLeft: 62, fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
            {event.detail}
          </div>
        )}
      </div>
    )
  }

  return null
}

function OutcomeRow({ outcome }: { outcome: TraceEvent & { type: 'outcome' } }) {
  const s = outcome.outcome
  const color = s === 'SETTLED' ? 'var(--green)' : s === 'DENIED' ? 'var(--red)' : 'var(--amber)'
  const bg    = s === 'SETTLED' ? 'var(--green-dim)' : s === 'DENIED' ? 'var(--red-dim)' : 'var(--amber-dim)'

  return (
    <div style={{
      marginTop:    12,
      padding:      '10px 14px',
      background:   bg,
      border:       `1px solid ${color}`,
      borderRadius: 8,
      animation:    'fadeSlideUp 0.3s ease both',
      display:      'flex',
      alignItems:   'center',
      gap:          10,
    }}>
      <span style={{ fontSize: 13, color, fontFamily: 'var(--mono)', fontWeight: 700 }}>
        ══ {s}
      </span>
      <span style={{ fontSize: 13, color, flex: 1 }}>
        {outcome.label}
      </span>
      <span style={{ fontSize: 11, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
        +{outcome.ts}ms
      </span>
    </div>
  )
}

function dot(variant: 'green' | 'red' | 'amber' | 'dim') {
  const colors = {
    green: 'var(--green)',
    red:   'var(--red)',
    amber: 'var(--amber)',
    dim:   'var(--text-3)',
  }
  return {
    width: 6, height: 6,
    borderRadius: '50%',
    background: colors[variant],
    animation: variant === 'amber' ? 'pulse-green 1.5s infinite' : undefined,
  } as React.CSSProperties
}

// ── Styles ───────────────────────────────────────────────────────────────────
const container: React.CSSProperties = {
  background:   'var(--surface)',
  border:       '1px solid var(--border)',
  borderRadius: 12,
  overflow:     'hidden',
  minHeight:    320,
}
const header: React.CSSProperties = {
  display:        'flex',
  alignItems:     'center',
  justifyContent: 'space-between',
  padding:        '10px 16px',
  borderBottom:   '1px solid var(--border)',
  background:     'var(--surface-2)',
}
const headerLabel: React.CSSProperties = {
  fontSize:      11,
  fontWeight:    600,
  letterSpacing: '0.1em',
  color:         'var(--text-3)',
  fontFamily:    'var(--mono)',
}
const liveTag: React.CSSProperties = {
  fontSize:   11,
  color:      'var(--green)',
  fontFamily: 'var(--mono)',
  animation:  'blink 1.2s infinite',
}
const body: React.CSSProperties = {
  padding:   '14px 16px',
  minHeight: 280,
  maxHeight: 480,
  overflowY: 'auto',
}
const idleMsg: React.CSSProperties = {
  display:        'flex',
  flexDirection:  'column',
  alignItems:     'center',
  justifyContent: 'center',
  gap:            10,
  height:         220,
  color:          'var(--text-3)',
  fontSize:       14,
}
