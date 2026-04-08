import { ReactNode } from 'react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ChatBot from '@/components/ChatBot'
import { I18nProvider } from '@/lib/i18n/context'

interface Props {
  children: ReactNode
  params: { lang: string }
}

export default function LangLayout({ children }: Props) {
  return (
    <I18nProvider>
      <Navbar />
      {/* pt-24 = top bar (32px) + main nav (64px) on desktop; pt-16 on mobile */}
      <div className="pt-16 md:pt-24 min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <Footer />
      </div>
      <ChatBot />
    </I18nProvider>
  )
}

export function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'es' }]
}
