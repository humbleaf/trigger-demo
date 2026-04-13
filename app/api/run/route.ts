import { FIXTURES } from '@/lib/demo-fixtures'
import { invoiceVerifyTask } from '@/trigger/invoice-verify'

// ─── /api/run ────────────────────────────────────────────────────────────────
// POST { scenario: 'invoice/pass' | 'invoice/blocked' | 'deploy/pass' | ... }
// Returns: { runId, streamUrl }
// Fires the real Trigger.dev task in parallel with the scripted SSE trace.

export async function POST(req: Request) {
  const { scenario } = await req.json() as { scenario: string }

  if (!FIXTURES[scenario]) {
    return Response.json({ error: 'Unknown scenario' }, { status: 400 })
  }

  const runId = `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

  // Fire the real Trigger.dev task — non-blocking
  // We don't await this; the SSE stream handles choreography
  try {
    const handle = await invoiceVerifyTask.trigger(
      { scenario: scenario as any, runId },
      { tags: ['demo'] },
    )

    return Response.json({
      runId,
      triggerRunId: handle.id,
      streamUrl:    `/api/stream?runId=${runId}&scenario=${encodeURIComponent(scenario)}&triggerRunId=${handle.id}`,
    })
  } catch (err) {
    // Trigger.dev unavailable — fall back to scripted-only mode
    console.error('[demo/run] Trigger.dev error (fallback to scripted):', err)

    return Response.json({
      runId,
      triggerRunId: null,
      streamUrl:    `/api/stream?runId=${runId}&scenario=${encodeURIComponent(scenario)}`,
    })
  }
}
