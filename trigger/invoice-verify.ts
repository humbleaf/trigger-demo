import { task, metadata } from '@trigger.dev/sdk/v3'
import { FIXTURES } from '@/lib/demo-fixtures'

// ─── Invoice Verify Task ────────────────────────────────────────────────────
// Real Trigger.dev v3 task. Calls AgentChain gateway and emits metadata
// updates per policy step — the SSE bridge picks these up and merges them
// into the choreographed trace on the frontend.

export const invoiceVerifyTask = task({
  id: 'demo-invoice-verify',
  retry: { maxAttempts: 1 },
  run: async (payload: { scenario: 'invoice/pass' | 'invoice/blocked'; runId: string }) => {
    const fixture = FIXTURES[payload.scenario]
    const apiUrl  = process.env.AGENTCHAIN_API_URL ?? 'https://api.agentchain.xyz'
    const apiKey  = process.env.AGENTCHAIN_DEMO_API_KEY ?? ''

    // Emit: task started
    await metadata.set('event', { type: 'submit', label: 'Agent action submitted to AgentChain', ts: Date.now() })

    // Build the prompt from the fixture — real gateway call
    const body = {
      agentId:  'trigger-demo-agent',
      taskType: 'spend_control',
      prompt:   buildInvoicePrompt(fixture),
      metadata: {
        source:    'trigger.dev',
        runId:     payload.runId,
        invoiceId: fixture.invoiceId ?? '',
        scenario:  payload.scenario,
      },
    }

    let receiptData: { id?: string; ipfsCid?: string; txHash?: string } = {}

    try {
      const res = await fetch(`${apiUrl}/api/v1/tasks/submit`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'x-api-key': apiKey },
        body:    JSON.stringify(body),
        signal:  AbortSignal.timeout(30_000),
      })

      const json = await res.json().catch(() => ({})) as Record<string, unknown>

      // Emit real receipt data — SSE bridge attaches to proof card
      receiptData = {
        id:       (json as any)?.id ?? '',
        ipfsCid:  (json as any)?.ipfsCid ?? (json as any)?.verificationCid ?? '',
        txHash:   (json as any)?.anchorTxHash ?? (json as any)?.settlementTxHash ?? '',
      }

      await metadata.set('receipt', receiptData)
      await metadata.set('event', { type: 'real_complete', ts: Date.now() })
    } catch (err) {
      // Non-fatal: the scripted trace on the frontend has already animated.
      // We just won't have a real CID/txHash for the proof card.
      await metadata.set('event', { type: 'real_error', message: String(err), ts: Date.now() })
    }

    return { scenario: payload.scenario, runId: payload.runId, receipt: receiptData }
  },
})

function buildInvoicePrompt(fixture: { key: string; target: string; value: string; invoiceId?: string }): string {
  return `Verify agent payment action:
Invoice ID: ${fixture.invoiceId ?? 'INV-DEMO'}
Vendor: ${fixture.target}
Amount: ${fixture.value}
Scenario: ${fixture.key}
Task: Evaluate counterparty risk, duplicate detection, threshold compliance, and budget availability.`
}
