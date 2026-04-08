import { ReactNode } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { I18nProvider } from '@/lib/i18n/context'

export default function ForLayout({ children }: { children: ReactNode }) {
  return (
    <I18nProvider>
      <Navbar />
      <div className="pt-16 md:pt-24 min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
    </I18nProvider>
  )
}
