import { redirect } from 'next/navigation'

/**
 * Legacy /private/[slug] route — redirects to /for/[slug].
 * Forwards the ?k= access token if present so token-protected lists work seamlessly.
 */
export default function PrivateRedirect({
  params,
  searchParams,
}: {
  params: { slug: string }
  searchParams: { k?: string }
}) {
  const target = searchParams.k
    ? `/for/${params.slug}?k=${encodeURIComponent(searchParams.k)}`
    : `/for/${params.slug}`

  redirect(target)
}
