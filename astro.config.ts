import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { unified, rehypeHeadingIds } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkHeadingIds from './src/plugins/remark-heading-ids.mjs';

interface HastNode {
  type: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
}

/**
 * Append a `#` anchor link to every h2 and h3 that already has an id, so
 * section headings are linkable without an extra dependency.
 */
function rehypeHeadingAnchors() {
  let label = 'Link to this section';
  const walk = (node: HastNode) => {
    if (!node.children) return;
    for (const child of node.children) {
      if (child.type === 'element' && (child.tagName === 'h2' || child.tagName === 'h3') && child.properties?.id) {
        const id = String(child.properties.id);
        const alreadyLinked = child.children?.some((c) => c.type === 'element' && c.tagName === 'a' && (c.properties?.className as string[] | undefined)?.includes('heading-anchor'));
        if (!alreadyLinked) {
          child.children = [
            ...(child.children ?? []),
            {
              type: 'element',
              tagName: 'a',
              properties: { href: `#${id}`, className: ['heading-anchor'], ariaLabel: label },
              children: [{ type: 'text', value: '#' } as HastNode],
            },
          ];
        }
      }
      walk(child);
    }
  };
  return (tree: HastNode, file: { path?: string }) => {
    label = file.path?.includes('/notes-ru/') ? 'Ссылка на этот раздел' : 'Link to this section';
    walk(tree);
  };
}

export default defineConfig({
  site: 'https://fpakhurov.com',
  output: 'static',
  integrations: [mdx(), sitemap()],
  markdown: {
    processor: unified({
      remarkPlugins: [remarkMath, remarkHeadingIds],
      rehypePlugins: [rehypeKatex, rehypeHeadingIds, rehypeHeadingAnchors],
    }),
    shikiConfig: { theme: 'github-dark-default' },
  },
});
