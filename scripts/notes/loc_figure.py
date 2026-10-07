"""Localize an Astro figure: loc_figure.py <file.astro> <pairs.json>

pairs: [[english, russian], ...] for title/caption attributes, text nodes and JS string literals,
or [[old, new, "raw"]] for exact replacements. Template-literal captions must be edited by hand."""
import json, re, sys

path, pairs = sys.argv[1], json.load(open(sys.argv[2]))
s = open(path).read()
q = lambda t: json.dumps(t, ensure_ascii=False)
if 'pageLang' not in s:
    imports = list(re.finditer(r'^import [^\n]*;\n', s, re.M))
    depth = path.split('src/')[-1].count('/')
    rel = '../' * depth + 'utils/lang'
    end = imports[-1].end()
    s = s[:end] + f"import {{ pageLang }} from '{rel}';\n\nconst ru = pageLang(Astro.url) === 'ru';\n" + s[end:]
for item in pairs:
    en, ru = item[0], item[1]
    if len(item) > 2 and item[2] == 'raw':
        assert en in s, ('raw not found', en[:60])
        s = s.replace(en, ru)
        continue
    n = 0
    for attr in ('title', 'caption'):
        a = f'{attr}="{en}"'
        if a in s:
            s = s.replace(a, f'{attr}={{ru ? {q(ru)} : {q(en)}}}'); n += 1
    if f'>{en}<' in s:
        s = s.replace(f'>{en}<', f'>{{ru ? {q(ru)} : {q(en)}}}<'); n += 1
    for qq in ("'", '"'):
        a = f'{qq}{en}{qq}'
        if a in s and n == 0:
            s = s.replace(a, f'(ru ? {q(ru)} : {q(en)})'); n += 1
    assert n, ('not found', en[:70])
open(path, 'w').write(s)
print('ok', path)
