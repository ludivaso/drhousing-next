import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import BlogEditor from '@/components/admin/BlogEditor'
import type { BlogPostRow } from '@/lib/supabase/blog'

export default async function EditBlogPostPage({ params }: { params: { id: string } }) {
  let post: BlogPostRow | null = null
  try {
    const admin = createAdminClient()
    const { data, error } = await (admin as any)
      .from('blog_posts')
      .select('*')
      .eq('id', params.id)
      .single()
    if (error || !data) notFound()
    post = data
  } catch {
    notFound()
  }

  return <BlogEditor post={post!} />
}
