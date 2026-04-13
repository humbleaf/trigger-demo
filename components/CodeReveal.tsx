'use client'

export function CodeReveal() {
  return (
    <div style={{
      marginTop:    16,
      background:   'var(--surface-2)',
      border:       '1px solid var(--border)',
      borderRadius: 12,
      padding:      '16px 18px',
      animation:    'fadeSlideUp 0.4s ease both',
    }}>
      <div style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.08em', marginBottom: 12, fontFamily: 'var(--mono)' }}>
        THE INTEGRATION
      </div>

      <pre style={{
        fontFamily: 'var(--mono)',
        fontSize:   12,
        lineHeight: 1.7,
        color:      'var(--text-2)',
        overflow:   'auto',
        margin:     0,
      }}>
        <code>
{`export const processInvoice = task({
  id: "process-invoice",
  run: async (payload) => {

`}<span style={{ color: 'var(--accent)' }}>{`    // ← Add this
    const receipt = await agentchain.verify(payload);
    if (receipt.policyVerdict !== "released")
      return { blocked: true, receipt };`}</span>{`

    // Your existing logic — unchanged ↓
    await stripe.transfer({ amount: payload.amount });
  }
});`}
        </code>
      </pre>

      <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-3)', lineHeight: 1.5 }}>
        One integration. Trigger runs the task.{' '}
        <span style={{ color: 'var(--accent)' }}>AgentChain decides whether the action is safe to settle.</span>
      </p>
    </div>
  )
}
