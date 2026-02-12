import ReactMarkdown from 'react-markdown';
import { cn } from '@/lib/utils';

interface PropertyDescriptionProps {
  content: string;
  className?: string;
}

/**
 * Renders property descriptions as formatted rich text.
 * Supports Markdown syntax including:
 * - Paragraphs with proper spacing
 * - Bullet lists (- or •)
 * - Numbered lists
 * - Line breaks
 * - Headings (if present)
 * 
 * Styled for luxury real estate presentation with
 * editorial typography and generous spacing.
 */
export function PropertyDescription({ content, className }: PropertyDescriptionProps) {
  // Pre-process content to handle common formatting patterns:
  // 1. Convert bullet characters (•) to Markdown-compatible dashes
  // 2. Ensure line breaks between paragraphs are preserved
  const processedContent = content
    .replace(/•/g, '-')
    // Convert single line breaks to double for proper paragraph separation
    // but preserve intentional double line breaks
    .replace(/(?<!\n)\n(?!\n)/g, '\n\n');

  return (
    <div className={cn('property-description', className)}>
      <ReactMarkdown
        components={{
          // Paragraphs with elegant spacing
          p: ({ children }) => (
            <p className="text-muted-foreground leading-relaxed mb-5 last:mb-0">
              {children}
            </p>
          ),
          // Unordered lists with refined styling
          ul: ({ children }) => (
            <ul className="my-6 space-y-3 pl-0">
              {children}
            </ul>
          ),
          // Ordered lists
          ol: ({ children }) => (
            <ol className="my-6 space-y-3 pl-5 list-decimal marker:text-primary/60">
              {children}
            </ol>
          ),
          // List items with custom bullet styling
          li: ({ children }) => (
            <li className="flex items-start gap-3 text-muted-foreground leading-relaxed">
              <span className="mt-2 w-1.5 h-1.5 rounded-full bg-primary/40 shrink-0" aria-hidden="true" />
              <span className="flex-1">{children}</span>
            </li>
          ),
          // Headings with luxury typography
          h1: ({ children }) => (
            <h3 className="font-serif text-xl font-semibold text-foreground mt-8 mb-4 first:mt-0">
              {children}
            </h3>
          ),
          h2: ({ children }) => (
            <h4 className="font-serif text-lg font-semibold text-foreground mt-6 mb-3 first:mt-0">
              {children}
            </h4>
          ),
          h3: ({ children }) => (
            <h5 className="font-medium text-foreground mt-5 mb-2 first:mt-0">
              {children}
            </h5>
          ),
          // Strong/bold text
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">
              {children}
            </strong>
          ),
          // Emphasis/italic
          em: ({ children }) => (
            <em className="italic text-foreground/90">
              {children}
            </em>
          ),
          // Horizontal rules for section breaks
          hr: () => (
            <hr className="my-8 border-t border-border/50" />
          ),
          // Blockquotes for highlighted text
          blockquote: ({ children }) => (
            <blockquote className="my-6 pl-5 border-l-2 border-primary/30 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  );
}
