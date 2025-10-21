import re
from pathlib import Path

# -------- comment patterns (compiled) --------
# html block comments <!-- ... -->
PATTERN_HTML = re.compile(r'<!--(.*?)-->', re.DOTALL)

# css/js block comments /* ... */
PATTERN_BLOCK = re.compile(r'/\*(.*?)\*/', re.DOTALL)

# match // comments anywhere but skip urls like http:// or https://
PATTERN_SLASHSLASH = re.compile(r'//(?![a-za-z0-9])(.+)$', re.multiline)

# match # comments anywhere (python, shell, ruby)
PATTERN_HASH = re.compile(r'#(.*)$', re.multiline)

def lc_block_html(m):
    return '<!--' + m.group(1).lower() + '-->'

def lc_block_star(m):
    return '/*' + m.group(1).lower() + '*/'

def lc_slashslash(m):
    # preserve leading whitespace and the '//' itself
    full = m.group(0)
    prefix = full[:full.find('//') + 2]
    rest = full[len(prefix):]
    return prefix + rest.lower()

def lc_hash(m):
    full = m.group(0)
    prefix = full[:full.find('#') + 1]
    rest = full[len(prefix):]
    return prefix + rest.lower()

# -------- which files to scan --------
# add or remove as needed
EXTS = {
    '.html', '.htm', '.css',
    '.js', '.jsx', '.ts', '.tsx',
    '.py', '.sh', '.rb', '.php',
    '.vue', '.svelte'
}

# skip common minified/vendor patterns (optional safety)
SKIP_NAMES = {'.min.js', '.min.css'}
SKIP_DIRS = {'node_modules', 'dist', 'build', '.git', '.venv', 'venv'}

def should_skip(path: Path) -> bool:
    if any(part in SKIP_DIRS for part in path.parts):
        return True
    if any(str(path).endswith(suffix) for suffix in SKIP_NAMES):
        return True
    return False

changed_any = False

for f in Path('.').rglob('*'):
    if not f.is_file():
        continue
    if f.suffix.lower() not in EXTS:
        continue
    if should_skip(f):
        continue

    text = f.read_text(encoding='utf-8')
    original = text

    # count-only pass (for diagnostics)
    c_html = len(PATTERN_HTML.findall(text))
    c_block = len(PATTERN_BLOCK.findall(text))
    c_ss = len(PATTERN_SLASHSLASH.findall(text))
    c_hash = len(PATTERN_HASH.findall(text))

    # apply transformations
    text = PATTERN_HTML.sub(lc_block_html, text)
    text = PATTERN_BLOCK.sub(lc_block_star, text)
    text = PATTERN_SLASHSLASH.sub(lc_slashslash, text)
    text = PATTERN_HASH.sub(lc_hash, text)

    if text != original:
        f.write_text(text, encoding='utf-8')
        print(f"✔ {f}  (html:{c_html}, block/* */:{c_block}, //:{c_ss}, #:{c_hash})")
        changed_any = True

if not changed_any:
    print("No changes made. Likely reasons:\n"
          " • No comments matched the patterns in scanned files/extensions.\n"
          " • Your comments are in file types not included in EXTS.\n"
          " • Your // or # comments are not at the start of a line.\n"
          "Tips:\n"
          " • Add more extensions to EXTS (e.g., '.ejs', '.twig', '.njk').\n"
          " • If you need // or # matched mid-line, we can enable that safely.")
