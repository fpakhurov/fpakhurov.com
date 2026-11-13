import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {execFileSync, spawn} from 'node:child_process';
import {chromium} from 'playwright';

// Review the built pages affected by this release, including changed assets
// reached through a current per-file review. Keep browser work in CI.
let base = process.env.REVIEW_BASE_REVISION || 'HEAD^';
try { execFileSync('git', ['rev-parse', '--verify', `${base}^{commit}`], {stdio: 'ignore'}); }
catch { base = 'HEAD^'; }
const changed = execFileSync('git', ['diff', '--name-only', base, 'HEAD'], {encoding: 'utf8'}).trim().split('\n');
const notes = new Set(changed.filter(p => /^src\/content\/(notes|notes-ru)\/.+\.mdx$/.test(p)));
for (const file of changed.filter(p => /^content-rights\/reviews\/.+\.json$/.test(p) && fs.existsSync(p))) {
  const review = JSON.parse(fs.readFileSync(file, 'utf8'));
  for (const file of Object.keys(review.files || {})) {
    if (/^src\/content\/(notes|notes-ru)\/.+\.mdx$/.test(file)) notes.add(file);
  }
}
const held = new Set(JSON.parse(fs.readFileSync('src/data/withdrawnNotes.json', 'utf8')));
const routes = [...notes].filter(p => fs.existsSync(p)).map(p => {
  const [, locale, id] = p.match(/^src\/content\/(notes|notes-ru)\/(.+)\.mdx$/);
  return {id, locale: locale === 'notes-ru' ? 'ru' : 'en', route: `/${locale === 'notes-ru' ? 'ru/' : ''}notes/${id}/`};
}).filter(p => !held.has(p.id) && fs.existsSync(path.join('dist', p.route, 'index.html')));
if (!routes.length) {
  console.log('No changed published note pages to review.');
  process.exit(0);
}
const output = 'artifacts/renewal-browser';
fs.mkdirSync(output, {recursive: true});
const server = spawn('python3', ['-m', 'http.server', '4329', '--bind', '127.0.0.1', '--directory', 'dist'], {stdio: 'ignore'});
let browser;
const results = [];
try {
  for (let n = 0; n < 100; n++) {
    try { if ((await fetch('http://127.0.0.1:4329/')).ok) break; } catch {}
    if (n === 99) throw new Error('Static preview did not start');
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  browser = await chromium.launch({headless: true});
  for (const width of [390, 1440]) for (const theme of ['light', 'dark']) {
    const context = await browser.newContext({viewport: {width, height: 900}, colorScheme: theme, extraHTTPHeaders: {DNT: '1'}});
    const page = await context.newPage();
    for (const item of routes) {
      const response = await page.goto(`http://127.0.0.1:4329${item.route}`, {waitUntil: 'networkidle'});
      assert.equal(response.status(), 200, item.route);
      await page.locator('h1').waitFor({state: 'visible'});
      await page.evaluate(() => document.fonts.ready);
      const state = await page.evaluate(() => {
        const fonts = [];
        document.fonts.forEach(f => { if (f.status === 'error') fonts.push(f.family); });
        return {
          overflow: document.documentElement.scrollWidth > innerWidth + 1,
          mathErrors: document.querySelectorAll('.katex-error').length,
          fontErrors: fonts,
          localLinks: [...document.querySelectorAll('.prose a[href]')].map(a => new URL(a.href)).filter(u => u.origin === location.origin).map(u => u.pathname),
        };
      });
      assert.equal(state.overflow, false, `${item.route} ${width} ${theme}: page overflow`);
      assert.equal(state.mathErrors, 0, `${item.route}: math rendering`);
      assert.deepEqual(state.fontErrors, [], `${item.route}: fonts`);
      for (const link of state.localLinks) {
        const id = link.replace(/^\/(?:ru\/)?notes\//, '').replace(/\/$/, '');
        assert.ok(!held.has(id), `${item.route}: active link to held note ${id}`);
      }
      const result = {...item, width, theme, ...state};
      delete result.localLinks;
      if (width === 390 && theme === 'dark' && item.locale === 'ru') {
        const name = item.id.replaceAll('/', '-');
        await page.screenshot({path: `${output}/${name}-top.png`});
        const tables = page.locator('.prose table');
        for (let i = 0; i < await tables.count(); i++) {
          await tables.nth(i).screenshot({path: `${output}/${name}-table-${i + 1}.png`});
        }
        result.screenshots = name;
      }
      results.push(result);
    }
    await context.close();
  }
  console.log(`Reviewed ${results.length} built note views (${routes.length} localized routes).`);
} finally {
  fs.writeFileSync(`${output}/results.json`, JSON.stringify({base, head: execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim(), results}, null, 2) + '\n');
  await browser?.close();
  server.kill();
}
