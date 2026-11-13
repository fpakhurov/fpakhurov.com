// Independently replay finite examples and render-time assertions; no build or network.
const fs = require('node:fs'), path = require('node:path'), vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '../..');
const ts = require(path.join(root, 'node_modules/typescript'));
const katex = require(path.join(root, 'node_modules/katex'));
const results = JSON.parse(fs.readFileSync(path.join(root, 'docs/reports/2026-11-13-licensed-example-renewal/linear-classifiers-results.json'), 'utf8'));
function load(file, ru) {
  const source = fs.readFileSync(file, 'utf8');
  const code = file.endsWith('.astro') ? source.split('---')[1] : source;
  const sandbox = { exports: {}, Astro: { url: new URL(`https://fpakhurov.com/${ru ? 'ru/' : ''}notes/ml/linear-classifiers`) }, console, URL };
  sandbox.require = (specifier) => {
    if (specifier.endsWith('.astro')) return { default: () => {} };
    let target = path.resolve(path.dirname(file), specifier);
    if (!path.extname(target)) target += '.ts';
    return load(target, ru);
  };
  const compiled = ts.transpileModule(code, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true } }).outputText;
  vm.runInNewContext(compiled, sandbox, { filename: file, timeout: 5000 });
  return sandbox.exports;
}
(async () => {
  const { transform } = await import(path.join(root, 'node_modules/@astrojs/compiler/dist/node/index.js'));
  for (const figure of ['HyperplaneGeometry', 'SurrogateLosses']) {
    const file = path.join(root, 'src/components/figures/linear-classifiers', `${figure}.astro`);
    load(file, false); load(file, true);
    await transform(fs.readFileSync(file, 'utf8'), { filename: file });
    console.log('PASS figure', figure);
  }
  const geometry = load(path.join(root, 'src/components/figures/linear-classifiers/planeData.ts'), false);
  if (JSON.stringify(geometry.points.map(p => p.margin)) !== JSON.stringify(results.geometry.rows.map(p => p.margin))) throw new Error('Figure/Python margins disagree');
  const text = ['notes', 'notes-ru'].map(dir => fs.readFileSync(path.join(root, 'src/content', dir, 'ml/linear-classifiers.mdx'), 'utf8'));
  const blocks = text.map(s => [...s.matchAll(/```python\n([\s\S]*?)```/g)].map(m => m[1]));
  if (JSON.stringify(blocks[0]) !== JSON.stringify(blocks[1])) throw new Error('EN/RU code differs');
  for (const [index, source] of text.entries()) {
    for (const match of source.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)) {
      katex.renderToString(match[1] || match[2], { throwOnError: true, displayMode: !!match[1], strict: 'error' });
    }
    const expected = [...source.matchAll(/```text\n([\s\S]*?)```/g)].map(m => m[1]);
    if (expected.length !== blocks[index].length) throw new Error('Missing saved output');
    blocks[index].forEach((block, i) => {
      const output = execFileSync('python3', ['-c', block], { encoding: 'utf8' });
      if (output !== expected[i]) throw new Error(`Saved output mismatch in locale ${index}`);
    });
    console.log('PASS math and inline code', index ? 'RU' : 'EN');
  }
  const math = source => [...source.matchAll(/\$\$([\s\S]*?)\$\$|(?<!\$)\$(?!\$)([^$\n]+)\$(?!\$)/g)].map(m => m[1] || m[2]);
  if (JSON.stringify(math(text[0])) !== JSON.stringify(math(text[1]))) throw new Error('EN/RU math differs');
  console.log('PASS exact EN/RU math parity and Python/figure geometry');
})().catch(error => { console.error(error); process.exitCode = 1; });
