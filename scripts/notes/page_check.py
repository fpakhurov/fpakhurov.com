"""Check a rendered note on the dev server: page_check.py <course> <slug> [en|ru]"""
import collections, re, sys, urllib.request

course, slug = sys.argv[1], sys.argv[2]
lang = sys.argv[3] if len(sys.argv) > 3 else 'ru'
base = 'http://localhost:4400'
get = lambda p: urllib.request.urlopen(base + p, timeout=180).read().decode()
en = get(f'/notes/{course}/{slug}')
page = get(f'/ru/notes/{course}/{slug}') if lang == 'ru' else en
hid = lambda h: re.findall(r'<h[1-6][^>]*\sid="([^"]+)"', h)
if lang == 'ru':
    print('heading ids equal to English:', hid(en) == hid(page))
    if hid(en) != hid(page):
        print('  English only:', set(hid(en)) - set(hid(page)), '\n  Russian only:', set(hid(page)) - set(hid(en)))
    print('untranslated notice present:', 'Перевод этой заметки готовится' in page)
print('katex-error:', page.count('katex-error'))
ids = re.findall(r'\sid="([^"]+)"', page)
print('duplicate ids:', [i for i, c in collections.Counter(ids).items() if c > 1])
print('broken in-page anchors:', [f for f in re.findall(r'href="#([^"]+)"', page) if f not in set(ids)])
body = re.search(r'<div class="prose">(.*)</div>\s*<nav class="note-pagination"', page, re.S).group(1)
cache = {}
for path, frag in sorted(set(re.findall(r'href="(/(?:ru/)?notes/[^"#]+?)/?(?:#([^"]*))?"', body))):
    try:
        h = cache.setdefault(path, get(path))
    except Exception as e:
        print('BROKEN LINK', path, e)
        continue
    if frag and f'id="{frag}"' not in h:
        print('BROKEN ANCHOR', f'{path}#{frag}')
if lang == 'ru':
    print('links to English note URLs in the text (should be none):', sorted(set(re.findall(r'href="(/notes/[^"]+)"', body))))
    t = re.sub(r'<pre.*?</pre>|<code.*?</code>|<span class="katex-display">.*?</span></span></span>|<span class="katex">.*?</span></span>|<svg.*?</svg>', ' ', body, flags=re.S)
    t = re.sub(r'<[^>]+>', ' ', t)
    print('Latin words in Russian prose:', collections.Counter(re.findall(r'\b[A-Za-z]{4,}\b', t)).most_common(40))
print('figures:', len(re.findall(r'<figure class="fig"', page)), '| figure kickers in English on a Russian page:', page.count('class="fig-kicker">Figure') if lang == 'ru' else '-')
