import Link from 'next/link'
import { Plus, Eye, EyeOff, Star, Pencil } from 'lucide-react'
import { createAdminClient } from '@/lib/supabase/admin'

async function getAllPosts() {
  try {
    const admin = createAdminClient()
    const { data, error } = await (admin as any)
      .from('blog_posts')
      .select('id,slug,title,category,published,featured,published_at,created_at,image,read_time')
      .order('created_at', { ascending: false })
    if (error) return null
    return data ?? []
  } catch {
    return null
  }
}

export default async function AdminBlogPage() {
  const posts = await getAllPosts()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold">Blog</h1>
          <p className="text-muted-foreground text-sm mt-1">
            {posts ? `${posts.length} post${posts.length !== 1 ? 's' : ''}` : 'Manage articles and market insights'}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" /> New Post
        </Link>
      </div>

      {/* Table not yet migrated */}
      {posts === null && (
        <div className="card-elevated p-8 text-center space-y-3">
          <p className="text-sm text-muted-foreground">
            The <code className="bg-muted px-1 rounded">blog_posts</code> table does not exist yet.
          </p>
          <p className="text-xs text-muted-foreground max-w-xl mx-auto">
            Run the SQL migration below in your Supabase SQL Editor to enable blog management.
          </p>
          <details className="text-left mt-4 border border-border rounded-lg">
            <summary className="px-4 py-3 text-sm font-medium cursor-pointer select-none text-muted-foreground hover:text-foreground">
              ⚙ SQL Migration — blog_posts table
            </summary>
            <pre className="px-4 pb-4 text-xs overflow-x-auto whitespace-pre select-all bg-muted/40">
{`CREATE TABLE IF NOT EXISTS blog_posts (
  id           UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  slug         TEXT UNIQUE NOT NULL,
  title        TEXT NOT NULL,
  title_en     TEXT,
  excerpt      TEXT,
  excerpt_en   TEXT,
  content      TEXT,
  content_en   TEXT,
  category     TEXT DEFAULT 'General',
  category_en  TEXT,
  image        TEXT DEFAULT '/hero-costa-rica.jpg',
  author       TEXT DEFAULT 'DR Housing',
  read_time    TEXT DEFAULT '5 min',
  published    BOOLEAN DEFAULT false,
  featured     BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  created_at   TIMESTAMPTZ DEFAULT NOW(),
  updated_at   TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Public read published"
    ON blog_posts FOR SELECT USING (published = true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "Auth full access"
    ON blog_posts FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;`}
            </pre>
          </details>
        </div>
      )}

      {/* Empty state */}
      {posts !== null && posts.length === 0 && (
        <div className="card-elevated p-12 text-center">
          <p className="text-muted-foreground text-sm mb-4">No posts yet.</p>
          <Link href="/admin/blog/new" className="text-primary text-sm underline underline-offset-2">
            Write your first post →
          </Link>
        </div>
      )}

      {/* Posts list */}
      {posts !== null && posts.length > 0 && (
        <div className="card-elevated overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Title</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">Category</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">Date</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {posts.map((post: any) => (
                <tr key={post.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {post.featured && <Star className="w-3.5 h-3.5 text-gold flex-shrink-0" />}
                      <span className="font-medium line-clamp-1">{post.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">/blog/{post.slug}</span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{post.category}</td>
                  <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell text-xs">
                    {new Date(post.published_at ?? post.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="px-4 py-3">
                    {post.published
                      ? <span className="inline-flex items-center gap-1 text-xs text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full"><Eye className="w-3 h-3" /> Live</span>
                      : <span className="inline-flex items-center gap-1 text-xs text-muted-foreground bg-muted border border-border px-2 py-0.5 rounded-full"><EyeOff className="w-3 h-3" /> Draft</span>
                    }
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 border border-border rounded text-xs hover:bg-secondary transition-colors"
                    >
                      <Pencil className="w-3 h-3" /> Edit
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
