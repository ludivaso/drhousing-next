import { post as guide2025 } from './guia-comprar-propiedad-costa-rica-2025'

export const allPosts = [guide2025]

export const POSTS_BY_SLUG = Object.fromEntries(allPosts.map((p) => [p.slug, p]))

export type BlogPost = typeof guide2025
