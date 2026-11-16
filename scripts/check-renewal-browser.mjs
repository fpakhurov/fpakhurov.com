import assert from 'node:assert/strict';
import fs from 'node:fs';
import {execFileSync, spawn} from 'node:child_process';
import {chromium} from 'playwright';
import {selectPublishedNoteRoutes} from './lib/renewal-browser-routes.mjs';

// Review the built pages affected by this release, including changed assets
// reached through a current per-file review. Keep browser work in CI.
let base = process.env.REVIEW_BASE_REVISION || 'HEAD^';
try { execFileSync('git', ['rev-parse', '--verify', `${base}^{commit}`], {stdio: 'ignore'}); }
catch { base = 'HEAD^'; }
const changed = execFileSync('git', ['diff', '--name-only', base, 'HEAD'], {encoding: 'utf8'}).trim().split('\n');
const held = new Set(JSON.parse(fs.readFileSync('src/data/withdrawnNotes.json', 'utf8')));
const routes = selectPublishedNoteRoutes(process.cwd(), changed, held);
if (!routes.length) {
  console.log('No changed published note pages to review.');
  process.exit(0);
}
const output = 'artifacts/renewal-browser';
fs.mkdirSync(output, {recursive: true});
const server = spawn('python3', ['-m', 'http.server', '4329', '--bind', '127.0.0.1', '--directory', 'dist'], {stdio: 'ignore'});
let browser;
const results = [];
const headerRegressions = [];
const narrowHeaderFailures = [];
async function settleLayout(page) {
  await page.evaluate(async () => {
    await document.fonts.ready;
    await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  });
}
async function headerGeometry(page) {
  return page.locator('.note-header').evaluate(header => {
    const bounds = header.getBoundingClientRect();
    const escapedText = [];
    const walker = document.createTreeWalker(header, NodeFilter.SHOW_TEXT);
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (!node.textContent.trim()) continue;
      const range = document.createRange();
      range.selectNodeContents(node);
      for (const rect of range.getClientRects()) {
        if (rect.width && (rect.left < bounds.left - 1.5 || rect.right > bounds.right + 1.5)) {
          escapedText.push({text: node.textContent.trim(), left: rect.left - bounds.left, right: rect.right - bounds.right});
        }
      }
    }
    const pageOverflow = document.documentElement.scrollWidth > innerWidth + 1;
    const overflowElements = pageOverflow ? [...document.querySelectorAll('main *')].flatMap(element => {
      const rect = element.getBoundingClientRect();
      if (!rect.width || rect.right <= innerWidth + 1) return [];
      return [{tag: element.tagName, className: String(element.className), text: element.textContent.trim().slice(0, 120), left: rect.left, right: rect.right}];
    }).slice(0, 30) : [];
    const paginationBounds = [...document.querySelectorAll('.note-pagination, .note-pagination a')].map(element => {
      const rect = element.getBoundingClientRect();
      return {tag: element.tagName, text: element.textContent.trim(), left: rect.left, right: rect.right, width: rect.width};
    });
    const escapedHeadingAnchors = [...document.querySelectorAll('.heading-anchor')].flatMap(anchor => {
      const rect = anchor.getBoundingClientRect();
      if (rect.left >= -1 && rect.right <= innerWidth + 1) return [];
      return [{heading: anchor.parentElement?.textContent.trim(), left: rect.left, right: rect.right}];
    });
    return {
      pageOverflow,
      overflowElements,
      paginationBounds,
      escapedHeadingAnchors,
      headerWidth: bounds.width,
      escapedText,
    };
  });
}
async function splitHeadingWords(page) {
  return page.locator('.note-header h1').evaluate(heading => {
    const split = [];
    const nodes = document.createTreeWalker(heading, NodeFilter.SHOW_TEXT);
    for (let node = nodes.nextNode(); node; node = nodes.nextNode()) {
      for (const match of node.textContent.matchAll(/[\p{L}\p{M}]+/gu)) {
        const range = document.createRange();
        range.setStart(node, match.index);
        range.setEnd(node, match.index + match[0].length);
        const lines = new Set([...range.getClientRects()].map(rect => Math.round(rect.top)));
        if (lines.size > 1) split.push(match[0]);
      }
    }
    return split;
  });
}
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
      result.splitHeadingWords = await splitHeadingWords(page);
      assert.deepEqual(result.splitHeadingWords, [], `${item.route} ${width}: heading splits words`);
      if (width === 390) {
        await page.setViewportSize({width: 320, height: 900});
        await settleLayout(page);
        result.narrowHeader = await headerGeometry(page);
        if (result.narrowHeader.pageOverflow || result.narrowHeader.escapedText.length || result.narrowHeader.escapedHeadingAnchors.length) {
          narrowHeaderFailures.push({route: item.route, theme, ...result.narrowHeader});
        }
        result.narrowHeadingWords = await splitHeadingWords(page);
        assert.deepEqual(result.narrowHeadingWords, [], `${item.route} 320: heading splits words`);
        if (theme === 'dark' && item.locale === 'ru') {
          await page.locator('.note-header').screenshot({
            path: `${output}/${item.id.replaceAll('/', '-')}-heading-320.png`,
            style: '.site-header { visibility: hidden !important; }',
          });
          const pagination = page.locator('.note-pagination');
          if (await pagination.count()) await pagination.screenshot({
            path: `${output}/${item.id.replaceAll('/', '-')}-pagination-320.png`,
            style: '.site-header { visibility: hidden !important; }',
          });
          if (item.id === 'nlp/efficient-transformers') {
            await page.locator('#baseline-standard-attention-and-a-dense-ffn').screenshot({
              path: `${output}/nlp-efficient-transformers-section-heading-320.png`,
              style: '.site-header { visibility: hidden !important; } .heading-anchor { opacity: 1 !important; }',
            });
          }
        }
        await page.setViewportSize({width, height: 900});
        await settleLayout(page);
      }
      const figures = page.locator('.prose figure.fig');
      result.figureScreenshots = [];
      result.figureGeometry = [];
      for (let i = 0; i < await figures.count(); i++) {
        const filename = `${item.id.replaceAll('/', '-')}-${item.locale}-${width}-${theme}-figure-${i + 1}.png`;
        // Isolated tall figures can scroll under the fixed navbar during capture.
        // Hide it only for these crops; full-page screenshots retain the real header.
        await figures.nth(i).scrollIntoViewIfNeeded();
        await settleLayout(page);
        const geometry = await figures.nth(i).evaluate(figure => {
          const bounds = figure.getBoundingClientRect();
          const caption = figure.querySelector('figcaption')?.getBoundingClientRect();
          return {height: bounds.height, captionBottom: caption ? caption.bottom - bounds.top : null, captionContained: !caption || caption.bottom <= bounds.bottom + 1};
        });
        result.figureGeometry.push(geometry);
        assert.ok(geometry.captionContained, `${item.route}: figure ${i + 1} caption escapes its box`);
        await figures.nth(i).screenshot({path: `${output}/${filename}`, style: '.site-header { visibility: hidden !important; }'});
        result.figureScreenshots.push(filename);
        if (width === 390 && theme === 'dark') {
          const caption = figures.nth(i).locator('figcaption');
          if (await caption.count()) await caption.screenshot({path: `${output}/${filename.replace('.png', '-caption.png')}`, style: '.site-header { visibility: hidden !important; }'});
        }
      }
      const tables = page.locator('.prose table');
      result.scrollableTables = 0;
      for (let i = 0; i < await tables.count(); i++) {
        const tableState = await tables.nth(i).evaluate(table => {
          const maxScroll = table.scrollWidth - table.clientWidth;
          table.scrollLeft = maxScroll;
          const reachedEnd = Math.abs(table.scrollLeft - maxScroll) <= 1;
          const splitTokens = [...table.querySelectorAll('code')].filter(code => code.getClientRects().length > 1).map(code => code.textContent);
          table.scrollLeft = 0;
          return {maxScroll, reachedEnd, splitTokens};
        });
        assert.deepEqual(tableState.splitTokens, [], `${item.route}: table splits literal tokens`);
        if (tableState.maxScroll > 1) {
          assert.ok(tableState.reachedEnd, `${item.route}: final table columns are unreachable`);
          result.scrollableTables++;
        }
      }
      if (width === 390 && theme === 'dark' && item.locale === 'ru') {
        const name = item.id.replaceAll('/', '-');
        await page.evaluate(() => window.scrollTo({top: 0, left: 0, behavior: 'instant'}));
        await page.screenshot({path: `${output}/${name}-top.png`});
        for (let i = 0; i < await tables.count(); i++) {
          await tables.nth(i).screenshot({path: `${output}/${name}-table-${i + 1}.png`});
          const scrolled = await tables.nth(i).evaluate(table => {
            table.scrollLeft = table.scrollWidth;
            return table.scrollLeft > 1;
          });
          if (scrolled) await tables.nth(i).screenshot({path: `${output}/${name}-table-${i + 1}-end.png`});
          await tables.nth(i).evaluate(table => { table.scrollLeft = 0; });
        }
        result.screenshots = name;
      }
      results.push(result);
    }
    if (width === 390 && theme === 'dark') {
      // Keep the two previously observed metadata edge cases in this browser job.
      // Inspect headers and pagination without repeating their complete figure audit.
      await page.setViewportSize({width: 320, height: 900});
      for (const id of ['probability/joint-distributions', 'probability/continuous-distributions']) {
        for (const locale of ['en', 'ru']) {
          if (routes.some(item => item.id === id && item.locale === locale)) continue;
          const route = `/${locale === 'ru' ? 'ru/' : ''}notes/${id}/`;
          const response = await page.goto(`http://127.0.0.1:4329${route}`, {waitUntil: 'networkidle'});
          assert.equal(response.status(), 200, route);
          await settleLayout(page);
          const geometry = await headerGeometry(page);
          headerRegressions.push({id, locale, route, width: 320, ...geometry});
          if (geometry.pageOverflow || geometry.escapedText.length || geometry.escapedHeadingAnchors.length) narrowHeaderFailures.push({route, theme, ...geometry});
          if (locale === 'ru') await page.locator('.note-header').screenshot({
            path: `${output}/${id.replaceAll('/', '-')}-metadata-320.png`,
            style: '.site-header { visibility: hidden !important; }',
          });
          if (locale === 'ru' && await page.locator('.note-pagination').count()) await page.locator('.note-pagination').screenshot({
            path: `${output}/${id.replaceAll('/', '-')}-pagination-320.png`,
            style: '.site-header { visibility: hidden !important; }',
          });
        }
      }
    }
    await context.close();
  }
  // Collect every new geometry finding and its crop before failing the gate.
  // A single batch run then supplies enough evidence to fix all affected pages.
  assert.deepEqual(narrowHeaderFailures, [], '320px header geometry failures');
  console.log(`Reviewed ${results.length} built note views (${routes.length} localized routes).`);
} finally {
  fs.writeFileSync(`${output}/results.json`, JSON.stringify({base, head: execFileSync('git', ['rev-parse', 'HEAD'], {encoding: 'utf8'}).trim(), results, headerRegressions, narrowHeaderFailures}, null, 2) + '\n');
  await browser?.close();
  server.kill();
}
