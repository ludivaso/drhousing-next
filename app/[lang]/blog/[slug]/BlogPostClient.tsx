'use client'

import Link from 'next/link'
import Image from 'next/image'
import ReactMarkdown from 'react-markdown'
import { Calendar, Clock, ArrowLeft, MessageCircle } from 'lucide-react'
import { useI18n } from '@/lib/i18n/context'
import type { BlogPost } from '@/content/blog'

export default function BlogPostClient({ post }: { post: BlogPost }) {
  const { lang } = useI18n()

  const title = lang === 'en' ? post.titleEn : post.title
  const category = lang === 'en' ? post.categoryEn : post.category
  const content = lang === 'en' ? post.contentEn : post.content

  return (
    <>
      {/* Hero */}
      <section className="relative h-72 sm:h-96 overflow-hidden bg-forest-dark">
        <Image
          src={post.image}
          alt={title}
          fill
          className="object-cover opacity-60"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-forest-dark/80 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8">
          <div className="container-wide">
            <span className="inline-block text-xs font-medium px-2.5 py-1 rounded-full bg-gold/30 text-gold border border-gold/40 mb-3">
              {category}
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-semibold text-white max-w-3xl leading-tight">
              {title}
            </h1>
            <div className="flex items-center gap-4 mt-3 text-white/70 text-sm">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {new Date(post.date).toLocaleDateString(lang === 'en' ? 'en-US' : 'es-CR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              <span className="flex items-center gap-1.5">
                <Clock className="w-4 h-4" />
                {post.readTime} {lang === 'en' ? 'read' : 'lectura'}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            {/* Back link */}
            <Link
              href={`/${lang}/blog`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" />
              {lang === 'en' ? 'Back to Blog' : 'Volver al Blog'}
            </Link>

            {/* Markdown article */}
            <article className="prose prose-stone max-w-none prose-headings:font-serif prose-headings:font-semibold prose-h2:text-2xl prose-h3:text-xl prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-img:rounded-lg">
              <ReactMarkdown>{content}</ReactMarkdown>
            </article>

            {/* CTA */}
            <div className="mt-12 p-8 rounded-xl bg-secondary border border-border">
              <h3 className="font-serif text-xl font-semibold text-foreground mb-2">
                {lang === 'en' ? 'Ready to take the next step?' : '¿Listo para dar el siguiente paso?'}
              </h3>
              <p className="text-muted-foreground mb-5">
                {lang === 'en'
                  ? 'Our advisors are ready to guide you through every aspect of buying property in Costa Rica.'
                  : 'Nuestros asesores están listos para guiarle en cada aspecto de la compra de propiedades en Costa Rica.'}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/${lang}/contact`}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                >
                  {lang === 'en' ? 'Schedule a Consultation' : 'Agendar Consulta'}
                </Link>
                <a
                  href="https://wa.me/50686540888"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-border text-foreground text-sm font-medium hover:bg-secondary transition-colors"
                >
                  <MessageCircle className="w-4 h-4" />
                  WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
