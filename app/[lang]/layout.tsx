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
      {/* pt-16 mobile (64px) · lg:pt-[72px] desktop */}
      <div className="pt-16 lg:pt-[72px] min-h-screen flex flex-col">
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
