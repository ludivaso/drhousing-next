import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import ChatBot from '@/components/ChatBot'
import { I18nProvider } from '@/lib/i18n/context'

export default function SiteLayout({ children }: { children: React.ReactNode }) {
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
