import { Lora, Poppins } from 'next/font/google'

// Scoped to the agent-profile module only — the rest of the site uses
// Playfair Display + Inter. This module has its own visual identity.
const lora = Lora({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-agent-lora',
  display: 'swap',
})

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-agent-poppins',
  display: 'swap',
})

export default function AgentsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${lora.variable} ${poppins.variable}`}
      style={{ fontFamily: 'var(--font-agent-poppins)' }}
    >
      {children}
    </div>
  )
}
