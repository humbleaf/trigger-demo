import { FIXTURES, type TraceEvent } from '@/lib/demo-fixtures'

// ─── /api/stream ─────────────────────────────────────────────────────────────
// GET ?runId=xxx&scenario=invoice/pass&triggerRunId=yyy
//
// Architecture: deterministic-first, real-second.
// The scripted event schedule fires immediately from FIXTURES timing.
// Real backend receipt data is polled and merged in asynchronously.
// The UI never stalls waiting for infra — scripted timing is the floor.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  const url         = new URL(req.url)
  const scenario    = url.searchParams.get('scenario') ?? ''
  const runId       = url.searchParams.get('runId')    ?? ''
  const triggerRunId= url.searchParams.get('triggerRunId') ?? ''

  const fixture = FIXTURES[scenario]
  if (!fixture) {
    return new Response('Unknown scenario', { status: 400 })
  }

  const encoder = new TextEncoder()
  const startTs = Date.now()

  function emit(event: TraceEvent): Uint8Array {
    return encoder.encode(`data: ${JSON.stringify(event)}\n\n`)
  }

  const stream = new ReadableStream({
    async start(controller) {
      const send = (e: TraceEvent) => {
        try { controller.enqueue(emit(e)) } catch {}
      }

      // ── Event 0: task started (immediate) ─────────────────────────────
      send({ type: 'start', label: 'Trigger.dev task started', ts: 0 })

      // ── Event 1: submitted (250ms) ────────────────────────────────────
      await delay(250)
      send({ type: 'submit', label: 'Agent action submitted to AgentChain', ts: elapsed(startTs) })

      // ── Policy check events (scripted timing from fixture) ────────────
      for (const check of fixture.policyChecks) {
        const waitUntil = check.ms - (Date.now() - startTs)
        if (waitUntil > 0) await delay(waitUntil)

        send({
          type:   'policy',
          label:  check.label,
          pass:   check.pass,
          detail: check.detail,
          ts:     elapsed(startTs),
        })

        // Stop emitting further checks after first failure
        if (!check.pass) {
          await delay(150)
          break
        }
      }

      // ── Outcome (300ms after last check) ─────────────────────────────
      await delay(300)
      send({ type: 'outcome', outcome: fixture.outcome, label: fixture.outcomeLabel, ts: elapsed(startTs) })

      // ── Proof card (1500ms after outcome — credibility beat, not opener) ─
      await delay(1500)

      // Try to get real receipt from Trigger.dev run metadata
      let proofData: { cid?: string; txHash?: string; explorerUrl?: string } = {}
      if (triggerRunId) {
        proofData = await pollTriggerReceipt(triggerRunId)
      }

      send({ type: 'proof', ...proofData, ts: elapsed(startTs) })

      try { controller.close() } catch {}
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type':  'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection':    'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise(r => setTimeout(r, Math.max(0, ms)))
}

function elapsed(startTs: number): number {
  return Date.now() - startTs
}

// Poll Trigger.dev run metadata for the real receipt CID + txHash.
// Returns empty object if unavailable — proof card shows "anchoring..." gracefully.
async function pollTriggerReceipt(
  triggerRunId: string,
  maxWaitMs = 8000,
  intervalMs = 800,
): Promise<{ cid?: string; txHash?: string; explorerUrl?: string }> {
  const apiKey = process.env.TRIGGER_SECRET_KEY
  if (!apiKey || !triggerRunId) return {}

  const deadline = Date.now() + maxWaitMs

  while (Date.now() < deadline) {
    try {
      const res  = await fetch(`https://api.trigger.dev/api/v3/runs/${triggerRunId}`, {
        headers: { Authorization: `Bearer ${apiKey}` },
      })
      const data = await res.json() as any

      const receipt = data?.metadata?.receipt
      if (receipt?.ipfsCid || receipt?.txHash) {
        const cid     = receipt.ipfsCid as string | undefined
        const txHash  = receipt.txHash  as string | undefined
        const explorerUrl = txHash
          ? `https://sepolia.basescan.org/tx/${txHash}`
          : cid
          ? `https://ipfs.io/ipfs/${cid}`
          : undefined

        return { cid, txHash, explorerUrl }
      }

      if (data?.status === 'COMPLETED' || data?.status === 'FAILED') break
    } catch {}

    await delay(intervalMs)
  }

  return {}
}
