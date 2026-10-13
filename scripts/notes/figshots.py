"""Screenshot the figures of a note: figshots.py <course> <slug> [en|ru] [1,3,4]

Builds a page that holds only the note's figures (served by the dev server from public/,
which git ignores for _figs-* files) and screenshots it with headless Chrome at three widths:
wide light, wide dark and narrow light, one page per figure. Output: scripts/notes/shots/<slug>-<lang>-fig<N>-<variant>.png.
Crop with: cp a.png b.png && sips -c <height> <width> --cropOffset <y> <x> b.png
"""
import os, re, subprocess, sys, urllib.request

course, slug = sys.argv[1], sys.argv[2]
lang = sys.argv[3] if len(sys.argv) > 3 else 'en'
here = os.path.dirname(os.path.abspath(__file__))
repo = os.path.dirname(os.path.dirname(here))
out = os.path.join(here, 'shots')
os.makedirs(out, exist_ok=True)
path = ('/ru' if lang == 'ru' else '') + f'/notes/{course}/{slug}'
h = urllib.request.urlopen('http://localhost:4400' + path, timeout=180).read().decode()
figs = re.findall(r'<figure class="fig".*?</figure>', h, re.S)
defs = re.search(r'<svg class="fig-defs".*?</svg>', h, re.S)
page = (h.split('<body', 1)[0] + '<body><main style="max-width:760px;margin:0 auto;padding:16px"><div class="prose">'
        + (defs.group(0) if defs else '') + ''.join(figs) + '</div></main></body></html>')
chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
head = h.split('<body', 1)[0]
defs_html = defs.group(0) if defs else ''
only = [int(a) for a in sys.argv[4].split(',')] if len(sys.argv) > 4 else range(1, len(figs) + 1)
# One small page per figure keeps every screenshot fast and free of tiling glitches.
for i in only:
    name = f'_figs-{course}-{slug}-{lang}-{i}.html'
    pub = os.path.join(repo, 'public', name)
    open(pub, 'w').write(head + '<body><main style="max-width:760px;margin:0 auto;padding:16px"><div class="prose">'
                         + defs_html + figs[i - 1] + '</div></main></body></html>')
    try:
        for tag, width, scheme, height in [('wide', 1000, 1, 1400), ('wide-dark', 1000, 0, 1400), ('narrow', 560, 1, 2400)]:
            f = os.path.join(out, f'{slug}-{lang}-fig{i}-{tag}.png')
            try:
                subprocess.run([chrome, '--headless=new', '--hide-scrollbars', f'--blink-settings=preferredColorScheme={scheme}',
                                f'--screenshot={f}', f'--window-size={width},{height}', 'http://localhost:4400/' + name],
                               capture_output=True, timeout=150)
                print(f)
            except subprocess.TimeoutExpired:
                print('TIMEOUT', f)
    finally:
        os.remove(pub)
print(len(figs), 'figures in the note; pass a comma-separated list of figure numbers as the 4th argument to shoot only some')
