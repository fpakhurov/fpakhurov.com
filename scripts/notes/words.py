"""Prose word count of a note (no math, code, tags, link targets or References): words.py <course> <slug> [en|ru]"""
import re, sys

course, slug = sys.argv[1], sys.argv[2]
lang = sys.argv[3] if len(sys.argv) > 3 else 'en'
t = open(f"src/content/{'notes-ru' if lang == 'ru' else 'notes'}/{course}/{slug}.mdx").read().split('\n---\n', 1)[1]

def prose(t):
    t = re.sub(r'```.*?```', '', t, flags=re.S)
    t = re.sub(r'\$\$.*?\$\$', '', t, flags=re.S)
    t = re.sub(r'\$[^$]+\$', 'X', t)
    t = re.sub(r'^import .*$', '', t, flags=re.M)
    t = re.sub(r'<[^>]+>', '', t)
    t = re.sub(r'\]\([^)]*\)', ']', t)
    return len(re.findall(r'\w+', t))

body = re.split(r'^## (?:References|Литература)', t, flags=re.M)[0]
sections = re.split(r'(?=^## )', body, flags=re.M)
print('total prose words:', prose(body), f'(~{round(prose(body) / 200)} min)')
for s in sections:
    title = s.splitlines()[0] if s.startswith('## ') else '(intro)'
    print(f'{prose(s):6}  {title[:70]}')
