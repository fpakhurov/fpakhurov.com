"""Screenshot all figures of a note: figshots.py <course> <slug> [en|ru]

Builds a page that holds only the note's figures (served by the dev server from public/,
which git ignores for _figs-* files) and screenshots it with headless Chrome at three widths:
wide light, wide dark and narrow light. Output: scripts/notes/shots/<slug>-<lang>-<variant>.png.
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
name = f'_figs-{course}-{slug}-{lang}.html'
pub = os.path.join(repo, 'public', name)
open(pub, 'w').write(page)
chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
height = 1100 * max(1, len(figs)) + 300
try:
    for tag, width, scheme, h_ in [('wide', 1000, 1, height), ('wide-dark', 1000, 0, height), ('narrow', 560, 1, int(height * 1.8))]:
        f = os.path.join(out, f'{slug}-{lang}-{tag}.png')
        subprocess.run([chrome, '--headless=new', '--hide-scrollbars', f'--blink-settings=preferredColorScheme={scheme}',
                        f'--screenshot={f}', f'--window-size={width},{h_}', 'http://localhost:4400/' + name],
                       capture_output=True, timeout=300)
        print(f)
finally:
    os.remove(pub)
print(len(figs), 'figures')
