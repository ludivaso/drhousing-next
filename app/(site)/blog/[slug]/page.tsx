import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { POSTS_BY_SLUG, allPosts } from '@/content/blog'
import BlogPostClient from './BlogPostClient'

export function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  const post = POSTS_BY_SLUG[params.slug]
  if (!post) return {}
  return {
    title: `${post.title} | DR Housing`,
    description: post.title,
    openGraph: {
      title: post.title,
      images: [{ url: post.image }],
    },
  }
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = POSTS_BY_SLUG[params.slug]
  if (!post) notFound()
  return <BlogPostClient post={post} />
}
