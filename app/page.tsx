'use client'
import { useState, useCallback } from 'react'
import { FIXTURES } from '@/lib/demo-fixtures'
import { ScenarioCard } from '@/components/ScenarioCard'
import { ExecutionTrace } from '@/components/ExecutionTrace'
import { OutcomeCard } from '@/components/OutcomeCard'
import { ProofCard } from '@/components/ProofCard'
import { CodeReveal } from '@/components/CodeReveal'
import type { TraceEvent } from '@/lib/demo-fixtures'

type DemoState = 'idle' | 'running' | 'done'

export default function Home() {
  const [activeTab, setActiveTab] = useState<'invoice' | 'deploy'>('invoice')
  const [demoState, setDemoState] = useState<DemoState>('idle')
  const [events, setEvents]       = useState<TraceEvent[]>([])
  const [outcome, setOutcome]     = useState<TraceEvent & { type: 'outcome' } | null>(null)
  const [proof, setProof]         = useState<TraceEvent & { type: 'proof' }   | null>(null)
  const [activeScenario, setActiveScenario] = useState<string | null>(null)

  const reset = useCallback(() => {
    setDemoState('idle')
    setEvents([])
    setOutcome(null)
    setProof(null)
    setActiveScenario(null)
  }, [])

  const run = useCallback(async (scenario: string) => {
    if (demoState === 'running') return
    reset()
    setDemoState('running')
    setActiveScenario(scenario)

    try {
      // Fire the Trigger task + get SSE stream URL
      const res  = await fetch('/api/run', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ scenario }),
      })
      const { streamUrl } = await res.json()

      // Subscribe to SSE stream
      const es = new EventSource(streamUrl)

      es.onmessage = (e) => {
        const event = JSON.parse(e.data) as TraceEvent

        if (event.type === 'outcome') {
          setOutcome(event as any)
          setDemoState('done')
        } else if (event.type === 'proof') {
          setProof(event as any)
        } else {
          setEvents(prev => [...prev, event])
        }
      }

      es.onerror = () => { es.close() }

    } catch (err) {
      console.error(err)
      setDemoState('idle')
    }
  }, [demoState, reset])

  const fixture = activeScenario ? FIXTURES[activeScenario] : null

  return (
    <main style={styles.main}>
      {/* ── Header ──────────────────────────────────────────────── */}
      <header style={styles.header}>
        <div style={styles.logoRow}>
          <span style={styles.logoAC}>AgentChain</span>
          <span style={styles.logoDivider}>×</span>
          <span style={styles.logoTD}>Trigger.dev</span>
        </div>
        <h1 style={styles.headline}>
          Every risky agent action.<br />
          <span style={styles.headlineAccent}>Policy-checked before value moves.</span>
        </h1>
        <p style={styles.subline}>
          Trigger.dev runs the workflow.&nbsp;
          AgentChain evaluates whether the action is allowed to settle.
        </p>
      </header>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div style={styles.content}>
        {/* Left: Scenario Selector */}
        <div style={styles.left}>
          {/* Tabs */}
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(activeTab === 'invoice' ? styles.tabActive : {}) }}
              onClick={() => { setActiveTab('invoice'); reset() }}
            >
              💸 Invoice Payment
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'deploy' ? styles.tabActive : {}) }}
              onClick={() => { setActiveTab('deploy'); reset() }}
            >
              🚀 Deploy to Prod
            </button>
          </div>

          {activeTab === 'invoice' && (
            <>
              <ScenarioCard
                scenario={FIXTURES['invoice/pass']}
                label="Run Safe Payment"
                variant="pass"
                disabled={demoState === 'running'}
                active={activeScenario === 'invoice/pass'}
                onRun={() => run('invoice/pass')}
              />
              <div style={{ height: 12 }} />
              <ScenarioCard
                scenario={FIXTURES['invoice/blocked']}
                label="Run Duplicate Invoice"
                variant="blocked"
                disabled={demoState === 'running'}
                active={activeScenario === 'invoice/blocked'}
                onRun={() => run('invoice/blocked')}
              />
            </>
          )}

          {activeTab === 'deploy' && (
            <>
              <ScenarioCard
                scenario={FIXTURES['deploy/pass']}
                label="Run Safe Deploy"
                variant="pass"
                disabled={demoState === 'running'}
                active={activeScenario === 'deploy/pass'}
                onRun={() => run('deploy/pass')}
              />
              <div style={{ height: 12 }} />
              <ScenarioCard
                scenario={FIXTURES['deploy/blocked']}
                label="Run Unsafe Deploy"
                variant="blocked"
                disabled={demoState === 'running'}
                active={activeScenario === 'deploy/blocked'}
                onRun={() => run('deploy/blocked')}
              />
            </>
          )}

          {/* Code reveal — appears after any run completes */}
          {demoState === 'done' && <CodeReveal />}
        </div>

        {/* Right: Execution Trace */}
        <div style={styles.right}>
          <ExecutionTrace
            events={events}
            outcome={outcome}
            idle={demoState === 'idle'}
          />
          {outcome && (
            <OutcomeCard
              outcome={outcome}
              fixture={fixture!}
              onReset={reset}
            />
          )}
          {proof && (
            <ProofCard proof={proof} fixture={fixture!} />
          )}
        </div>
      </div>
    </main>
  )
}

// ── Inline styles (no Tailwind dependency, pure CSS-in-JS) ───────────────────
const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight:  '100vh',
    padding:    '40px 24px 80px',
    maxWidth:   1100,
    margin:     '0 auto',
  },
  header: {
    marginBottom: 48,
    textAlign:    'center',
  },
  logoRow: {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    gap:            10,
    marginBottom:   20,
    fontSize:       13,
    fontWeight:     500,
    letterSpacing:  '0.08em',
    textTransform:  'uppercase',
    color:          'var(--text-3)',
  },
  logoAC:      { color: 'var(--accent)' },
  logoDivider: { color: 'var(--text-3)' },
  logoTD:      { color: 'var(--text-2)' },
  headline: {
    fontSize:   'clamp(28px, 4vw, 42px)',
    fontWeight: 700,
    lineHeight: 1.2,
    color:      'var(--text)',
    marginBottom: 14,
  },
  headlineAccent: {
    color: 'var(--accent)',
  },
  subline: {
    fontSize: 16,
    color:    'var(--text-2)',
    maxWidth:  560,
    margin:   '0 auto',
  },
  content: {
    display:             'grid',
    gridTemplateColumns: '360px 1fr',
    gap:                 24,
    alignItems:          'start',
  },
  left:  { display: 'flex', flexDirection: 'column' },
  right: { display: 'flex', flexDirection: 'column', gap: 16 },
  tabs: {
    display:      'flex',
    gap:          8,
    marginBottom: 16,
  },
  tab: {
    flex:            1,
    padding:         '8px 12px',
    background:      'var(--surface)',
    border:          '1px solid var(--border)',
    borderRadius:    8,
    color:           'var(--text-2)',
    fontSize:        13,
    fontWeight:      500,
    cursor:          'pointer',
    transition:      'all 0.15s',
    fontFamily:      'var(--font)',
  },
  tabActive: {
    background:  'var(--accent-dim)',
    border:      '1px solid var(--accent)',
    color:       'var(--accent)',
  },
}
