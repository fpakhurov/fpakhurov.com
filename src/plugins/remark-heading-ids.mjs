import { visit } from 'unist-util-visit';

// `## Заголовок {#english-slug}` sets an explicit heading id, so a translated
// note keeps the anchors of its English original.
export default function remarkHeadingIds() {
  return (tree) => {
    visit(tree, 'heading', (node) => {
      const last = node.children[node.children.length - 1];
      if (!last || last.type !== 'text') return;
      const match = last.value.match(/\s*\{#([a-z0-9-]+)\}\s*$/);
      if (!match) return;
      last.value = last.value.slice(0, match.index);
      node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id: match[1] } };
    });
  };
}
