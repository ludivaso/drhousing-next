import { ReactNode } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ChatBot } from '@/components/chat/ChatBot';

interface LayoutProps {
  children: ReactNode;
  hideFooter?: boolean;
}

export function Layout({ children, hideFooter = false }: LayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">{children}</main>
      {!hideFooter && <Footer />}
      <ChatBot />
    </div>
  );
}
