// ─── Demo Fixtures ────────────────────────────────────────────────────────────
// Single source of truth for all scenario data.
// The trace renderer reads timing + labels from here.
// Real backend events get merged in on top as they arrive.

export type PolicyStep = {
  label: string
  pass: boolean
  ms: number           // delay from start of trace
  detail?: string      // shown on fail
}

export type Scenario = {
  key: string
  actor: string
  target: string
  value: string
  invoiceId?: string
  policyChecks: PolicyStep[]
  outcome: 'SETTLED' | 'DENIED' | 'WITHHELD'
  outcomeLabel: string
  outcomeLines: string[]
  proofLabel: string
}

export const FIXTURES: Record<string, Scenario> = {
  'invoice/pass': {
    key: 'invoice/pass',
    actor: 'Sentinel Alpha',
    target: 'FinTech LLC · Contractor Invoice',
    value: '$480 USDC',
    invoiceId: 'INV-2026-TRIG-001',
    policyChecks: [
      { label: 'Counterparty on allowlist',    pass: true,  ms: 300  },
      { label: 'Invoice hash verified',         pass: true,  ms: 600  },
      { label: 'No duplicate in 24h window',   pass: true,  ms: 900  },
      { label: 'Amount below $500 threshold',  pass: true,  ms: 1150 },
      { label: 'Budget bucket available',       pass: true,  ms: 1350 },
    ],
    outcome: 'SETTLED',
    outcomeLabel: 'Payment approved',
    outcomeLines: [
      'Payment approved',
      'Receipt recorded on Base Sepolia',
    ],
    proofLabel: 'View settlement proof',
  },

  'invoice/blocked': {
    key: 'invoice/blocked',
    actor: 'Sentinel Alpha',
    target: 'FinTech LLC · Contractor Invoice',
    value: '$480 USDC',
    invoiceId: 'INV-2026-TRIG-002',
    policyChecks: [
      { label: 'Counterparty on allowlist',    pass: true,  ms: 300 },
      { label: 'Invoice hash verified',         pass: true,  ms: 600 },
      {
        label: 'Duplicate invoice detected',
        pass: false,
        ms: 900,
        detail: 'INV-2026-TRIG-002 processed 3 hours ago',
      },
    ],
    outcome: 'DENIED',
    outcomeLabel: 'Duplicate invoice. No funds moved.',
    outcomeLines: [
      'Duplicate invoice detected',
      'No funds moved',
      'Agent action denied',
      'Proof of denial recorded',
    ],
    proofLabel: 'View proof of denial',
  },

  'deploy/pass': {
    key: 'deploy/pass',
    actor: 'Forge-Gamma',
    target: 'api-gateway → production',
    value: 'git sha 3a9f1d2',
    policyChecks: [
      { label: 'Tests passed',                         pass: true,  ms: 300  },
      { label: 'Commit signed by authorized key',      pass: true,  ms: 600  },
      { label: 'Linked ticket exists',                 pass: true,  ms: 850  },
      { label: 'Deploy window open',                   pass: true,  ms: 1050 },
      { label: 'Rollback artifact present',            pass: true,  ms: 1300 },
    ],
    outcome: 'SETTLED',
    outcomeLabel: 'Deployment token issued',
    outcomeLines: [
      'Deployment approved',
      'Deployment token recorded on Base Sepolia',
    ],
    proofLabel: 'View deployment proof',
  },

  'deploy/blocked': {
    key: 'deploy/blocked',
    actor: 'Forge-Gamma',
    target: 'api-gateway → production',
    value: 'git sha 3a9f1d2',
    policyChecks: [
      { label: 'Tests passed',                    pass: true,  ms: 300 },
      { label: 'Commit signed by authorized key', pass: true,  ms: 600 },
      { label: 'Linked ticket exists',            pass: true,  ms: 850 },
      {
        label: 'Rollback artifact present',
        pass: false,
        ms: 1050,
        detail: 'No artifact found for api-gateway@3a9f1d2',
      },
    ],
    outcome: 'WITHHELD',
    outcomeLabel: 'Deployment withheld. No rollback artifact.',
    outcomeLines: [
      'Deployment withheld',
      'No rollback artifact found',
      'No change deployed',
      'Proof of withholding recorded',
    ],
    proofLabel: 'View proof of withholding',
  },
}

export type DemoRun = {
  runId: string
  scenario: string
  status: 'pending' | 'running' | 'settled' | 'denied' | 'withheld'
  events: TraceEvent[]
  receipt?: {
    id: string
    ipfsCid?: string
    txHash?: string
    explorerUrl?: string
  }
}

export type TraceEvent =
  | { type: 'start';   label: string; ts: number }
  | { type: 'submit';  label: string; ts: number }
  | { type: 'policy';  label: string; pass: boolean; detail?: string; ts: number }
  | { type: 'outcome'; outcome: Scenario['outcome']; label: string; ts: number }
  | { type: 'proof';   cid?: string; txHash?: string; explorerUrl?: string; ts: number }
