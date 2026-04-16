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
      {/* pt-20 mobile (no banner) · md:pt-[124px] desktop (36px banner + 88px nav) */}
      <div className="pt-20 md:pt-[124px] min-h-screen flex flex-col">
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
