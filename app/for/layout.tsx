import { ReactNode } from 'react'

// Isolated layout for private curated-list pages.
// Intentionally omits the global Navbar and Footer so clients
// see a clean, standalone experience with the CuratedListHeader only.
export default function ForLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
