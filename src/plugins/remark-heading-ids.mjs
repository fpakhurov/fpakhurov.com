import { visit } from 'unist-util-visit';

// `## Заголовок {#english-slug}` sets an explicit heading id, so a translated
// note keeps the anchors of its English original.
export default function remarkHeadingIds() {
  return (tree) => {
    visit(tree, 'heading', (node) => {
      const last = node.children[node.children.length - 1];
      if (!last || last.type !== 'text') return;
      // Smartypants may already have turned a `--` in the id into a dash.
      // Lower-case Greek letters occur in English slugs (`in-practice-a-\u03b2-schedule`).
      const match = last.value.match(/\s*\{#([a-z0-9\u03b1-\u03c9\u2013\u2014-]+)\}\s*$/);
      if (!match) return;
      last.value = last.value.slice(0, match.index);
      const id = match[1].replace(/[\u2013\u2014]/g, '--');
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } };
    });
  };
}
