'use client';

import React, { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Copy, Check } from 'lucide-react';

// CodeBlock component with copy button and optional language label
function CodeBlock({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  const [copied, setCopied] = useState(false);

  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : null;
  const codeContent = String(children).replace(/\n$/, '');

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(codeContent).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [codeContent]);

  return (
    <div className="relative group my-4 rounded-md border border-[#00ff41]/20 bg-[#0a0a0a] overflow-hidden">
      {/* Header bar with language label and copy button */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#00ff41]/20 bg-[#0d0d0d]">
        <span className="text-xs font-mono text-[#00ff41]/60 uppercase tracking-wider">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 rounded px-2 py-1 text-xs font-mono transition-all duration-200
            text-[#00ff41]/60 hover:text-[#00ff41] hover:bg-[#00ff41]/10"
          aria-label="Copy code to clipboard"
          type="button"
        >
          {copied ? (
            <>
              <Check className="h-3.5 w-3.5" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="h-3.5 w-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      {/* Code content */}
      <div className="overflow-x-auto">
        <pre className="p-4 text-sm leading-relaxed font-mono text-[#c9d1d9] m-0" {...props}>
          <code className={className}>{codeContent}</code>
        </pre>
      </div>
    </div>
  );
}

// Inline code component
function InlineCode({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode }) {
  // If it has a language- class, treat it as a block (shouldn't happen inline, but guard)
  if (className && /language-/.test(className)) {
    return (
      <CodeBlock className={className} {...props}>
        {children}
      </CodeBlock>
    );
  }

  return (
    <code
      className="rounded bg-[#00ff41]/10 px-1.5 py-0.5 font-mono text-sm text-[#00ff41]"
      {...props}
    >
      {children}
    </code>
  );
}

// Main MarkdownRenderer component
export function MarkdownRenderer({ content }: { content: string }) {
  if (!content || content.trim().length === 0) {
    return (
      <div className="text-[#00ff41]/40 font-mono text-sm italic p-4">
        No content to display.
      </div>
    );
  }

  return (
    <div className="markdown-renderer text-[#c9d1d9] font-sans leading-relaxed">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // ── Headings ──
          h1: ({ children, ...props }) => (
            <h1
              className="font-mono text-2xl font-bold text-[#00ff41] border-b border-[#00ff41]/30 pb-2 mt-8 mb-4"
              {...props}
            >
              {children}
            </h1>
          ),
          h2: ({ children, ...props }) => (
            <h2
              className="font-mono text-xl font-bold text-[#00ff41] border-b border-[#00ff41]/20 pb-2 mt-7 mb-3"
              {...props}
            >
              {children}
            </h2>
          ),
          h3: ({ children, ...props }) => (
            <h3
              className="font-mono text-lg font-semibold text-[#00ff41]/90 mt-6 mb-2"
              {...props}
            >
              {children}
            </h3>
          ),
          h4: ({ children, ...props }) => (
            <h4
              className="font-mono text-base font-semibold text-[#00ff41]/80 mt-5 mb-2"
              {...props}
            >
              {children}
            </h4>
          ),
          h5: ({ children, ...props }) => (
            <h5
              className="font-mono text-sm font-semibold text-[#00ff41]/70 mt-4 mb-1"
              {...props}
            >
              {children}
            </h5>
          ),
          h6: ({ children, ...props }) => (
            <h6
              className="font-mono text-xs font-semibold text-[#00ff41]/60 uppercase tracking-wider mt-4 mb-1"
              {...props}
            >
              {children}
            </h6>
          ),

          // ── Paragraphs ──
          p: ({ children, ...props }) => (
            <p className="my-3 leading-7 text-[#c9d1d9]" {...props}>
              {children}
            </p>
          ),

          // ── Bold ──
          strong: ({ children, ...props }) => (
            <strong className="font-bold text-[#00ff41]" {...props}>
              {children}
            </strong>
          ),

          // ── Italic ──
          em: ({ children, ...props }) => (
            <em className="italic text-[#d0d7de]" {...props}>
              {children}
            </em>
          ),

          // ── Strikethrough ──
          del: ({ children, ...props }) => (
            <del className="line-through text-[#8b949e]" {...props}>
              {children}
            </del>
          ),

          // ── Links ──
          a: ({ href, children, ...props }) => (
            <a
              href={href}
              className="text-[#00ff41] underline decoration-[#00ff41]/40 underline-offset-2 transition-all duration-200 hover:decoration-[#00ff41] hover:decoration-2"
              target="_blank"
              rel="noopener noreferrer"
              {...props}
            >
              {children}
            </a>
          ),

          // ── Code blocks & inline code ──
          code: InlineCode,

          // ── Pre (wrap code blocks) ──
          pre: ({ children, ...props }) => {
            // ReactMarkdown renders code blocks as <pre><code class="language-xxx">...</code></pre>
            // We let the `code` component handle the rendering via CodeBlock
            // So we just pass children through without the default <pre> wrapper
            return <>{children}</>;
          },

          // ── Unordered lists ──
          ul: ({ children, ...props }) => (
            <ul
              className="my-3 ml-6 space-y-1 list-none"
              {...props}
            >
              {children}
            </ul>
          ),

          // ── Ordered lists ──
          ol: ({ children, ...props }) => (
            <ol
              className="my-3 ml-6 space-y-1 list-decimal font-mono text-[#00ff41]/70"
              {...props}
            >
              {children}
            </ol>
          ),

          // ── List items ──
          li: ({ children, ...props }) => {
            // For unordered list items, add custom green dot
            const parent = (props as Record<string, unknown>).node?.properties?.className;
            const isOrdered = Array.isArray(parent)
              ? parent.includes('ordered')
              : false;

            return (
              <li
                className="pl-2 text-[#c9d1d9] leading-7 relative before:absolute before:left-[-1rem] before:top-[0.55rem] before:h-1.5 before:w-1.5 before:rounded-full before:bg-[#00ff41] before:content-[''] marker:text-[#00ff41]/70"
                {...props}
              >
                {children}
              </li>
            );
          },

          // ── Blockquotes ──
          blockquote: ({ children, ...props }) => (
            <blockquote
              className="my-4 border-l-4 border-[#00ff41]/50 bg-[#00ff41]/5 pl-4 pr-2 py-2 rounded-r-md italic"
              {...props}
            >
              {children}
            </blockquote>
          ),

          // ── Horizontal rules ──
          hr: ({ ...props }) => (
            <hr
              className="my-6 border-0 h-px bg-gradient-to-r from-transparent via-[#00ff41]/40 to-transparent"
              {...props}
            />
          ),

          // ── Tables ──
          table: ({ children, ...props }) => (
            <div className="my-4 overflow-x-auto rounded-md border border-[#00ff41]/20">
              <table
                className="w-full border-collapse text-sm font-mono"
                {...props}
              >
                {children}
              </table>
            </div>
          ),
          thead: ({ children, ...props }) => (
            <thead className="bg-[#00ff41]/10" {...props}>
              {children}
            </thead>
          ),
          tbody: ({ children, ...props }) => (
            <tbody className="divide-y divide-[#00ff41]/10" {...props}>
              {children}
            </tbody>
          ),
          tr: ({ children, ...props }) => (
            <tr
              className="transition-colors duration-150 hover:bg-[#00ff41]/5"
              {...props}
            >
              {children}
            </tr>
          ),
          th: ({ children, ...props }) => (
            <th
              className="px-4 py-2.5 text-left text-[#00ff41] font-semibold border-b border-[#00ff41]/20"
              {...props}
            >
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td
              className="px-4 py-2 text-[#c9d1d9] border-b border-[#00ff41]/5"
              {...props}
            >
              {children}
            </td>
          ),

          // ── Images ──
          img: ({ src, alt, ...props }) => (
            <img
              src={src}
              alt={alt || 'Image'}
              className="my-4 max-w-full rounded-md border border-[#00ff41]/20"
              loading="lazy"
              {...props}
            />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
