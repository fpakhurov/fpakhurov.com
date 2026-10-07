import { visit } from 'unist-util-visit';

// `## Заголовок {#english-slug}` sets an explicit heading id, so a translated
// note keeps the anchors of its English original.
export default function remarkHeadingIds() {
  return (tree) => {
    visit(tree, 'heading', (node) => {
      const last = node.children[node.children.length - 1];
      if (!last || last.type !== 'text') return;
      // Smartypants may already have turned a `--` in the id into a dash.
      // English slugs can contain Greek letters (`in-practice-a-β-schedule`) and underscores from math (`d_k`).
      const match = last.value.match(/\s*\{#([^\s{}]+)\}\s*$/);
      if (!match) return;
      last.value = last.value.slice(0, match.index);
      const id = match[1].replace(/[\u2013\u2014]/g, '--');
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id } };
    });
  };
}
