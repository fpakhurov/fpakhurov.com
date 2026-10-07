"""Compare an English note with its Russian translation: ru_parity.py <course> <slug>"""
import collections, re, sys

course, slug = sys.argv[1], sys.argv[2]
en = open(f'src/content/notes/{course}/{slug}.mdx').read()
ru = open(f'src/content/notes-ru/{course}/{slug}.mdx').read()

def body(s):
    return s.split('\n---\n', 1)[1]

def math(s):
    s = re.sub(r'```.*?```', '', body(s), flags=re.S)
    display = re.findall(r'\$\$(.*?)\$\$', s, re.S)
    rest = re.sub(r'\$\$.*?\$\$', '', s, flags=re.S)
    return display + re.findall(r'(?<!\\)\$(.+?)(?<!\\)\$', rest)

# Words inside \text{} may be translated; Russian uses a thin space instead of {,} between thousands.
norm = lambda m: re.sub(r'(?<=\d)(\{,\}|\\,)(?=\d)', ',', re.sub(r'\\(text|mathrm|operatorname)\{[^{}]*\}', r'\\\1{}', m)).strip()
a, b = collections.Counter(map(norm, math(en))), collections.Counter(map(norm, math(ru)))
print('math equal (ignoring words in \\text{}):', a == b)
if a != b:
    print('  only in English:', list((a - b).items())[:5])
    print('  only in Russian:', list((b - a).items())[:5])
figs = lambda s: re.findall(r'^<([A-Z]\w+)[^>]*/>', body(s), re.M)
print('figures in the same order:', figs(en) == figs(ru))
code = lambda s: [re.sub(r'#.*', '', c) for c in re.findall(r'```.*?```', s, re.S)]
print('code equal apart from comments:', code(en) == code(ru))
