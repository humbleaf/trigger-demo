import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const mono  = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono' })

export const metadata: Metadata = {
  title: 'AgentChain × Trigger.dev — Live Policy Demo',
  description: 'Every risky agent action. Policy-checked before value moves.',
  openGraph: {
    title: 'AgentChain × Trigger.dev',
    description: 'Every risky agent action. Policy-checked before value moves.',
    siteName: 'AgentChain',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body>{children}</body>
    </html>
  )
}
