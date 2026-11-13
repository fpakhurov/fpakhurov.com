import ids from '../data/withdrawnNotes.json' with { type: 'json' };

const withdrawn = new Set(ids);

/** Keep older cross-course links on the published course index during review. */
export default function rehypeWithdrawnNotes() {
  return function visit(node) {
    const href = node.type === 'element' && node.tagName === 'a' && node.properties?.href;
    if (typeof href === 'string') {
      const match = /^(\/ru)?\/notes\/([^/#?]+\/[^/#?]+)(?:[/?#].*)?$/.exec(href);
      if (match && withdrawn.has(match[2])) node.properties.href = `${match[1] ?? ''}/notes/${match[2].split('/')[0]}`;
    }
    for (const child of node.children ?? []) visit(child);
  };
}
