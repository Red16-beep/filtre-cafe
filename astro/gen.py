#!/usr/bin/env python3
"""Extract per-page head + body from the legacy hand-written HTML into Astro
fragments, and emit a thin .astro wrapper per page. Run from repo root."""
import re, os, sys, glob

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))  # repo root
ASTRO = os.path.join(ROOT, "astro")

NAV_RE   = re.compile(r'<nav class="glass-nav.*?</nav>\s*', re.S)
HEAD_RE  = re.compile(r'<head>(.*?)</head>', re.S)
STYLE_RE = re.compile(r'<style>.*?</style>', re.S)
FOOTER   = re.compile(r'<footer')

# Shared boilerplate that Base.astro owns. Stripped from each page's <head> so the
# remainder is purely page-specific (title, meta, og/twitter, JSON-LD, plus any
# page-only preconnects / scripts / comments, all preserved verbatim).
BOILERPLATE = [
    re.compile(r'<meta charset="[^"]*">', re.I),
    re.compile(r'<meta name="viewport"[^>]*>', re.I),
    re.compile(r'<link rel="preload" href="/tailwind\.css".*?</noscript>', re.S),
    re.compile(r'<!--\s*Google Fonts[^>]*-->', re.I),
    re.compile(r'<link rel="preload" href="https://fonts\.googleapis\.com/css2.*?</noscript>', re.S),
    re.compile(r'<script[^>]*equateur\.org/assets/js/cmp\.js[^>]*>\s*</script>', re.S),
    re.compile(r'<script[^>]*equateur\.org/tracker\.js[^>]*>\s*</script>', re.S),
]

# Shared trailing chrome that Base.astro owns (footer + canonical end-scripts).
# Stripped from each page's post-nav region so only page-specific body remains.
BODY_TAIL = [
    re.compile(r'<footer\b.*?</footer>', re.S),
    # any inline scroll-progress handler (canonical AND older-template variants)
    re.compile(r'<script>(?:(?!</script>)[\s\S])*?scroll-progress(?:(?!</script>)[\s\S])*?</script>', re.S),
    re.compile(r'<script[^>]*src="/nl-subscribe\.js"[^>]*>\s*</script>', re.S),
    re.compile(r'<script[^>]*equateur\.org/tracker\.js[^>]*>\s*</script>', re.S),
    re.compile(r'<script[^>]*src="/js/track\.js"[^>]*>\s*</script>', re.S),
    re.compile(r'<script[^>]*src="/js/newsletter-inline\.js"[^>]*>\s*</script>', re.S),
    re.compile(r'<script[^>]*src="/js/exit-intent\.js"[^>]*>\s*</script>', re.S),
]

def extract(path):
    t = open(path, encoding="utf-8").read()
    hm = HEAD_RE.search(t)
    if not hm:
        return None, "no <head>"
    head = hm.group(1)
    # pull the <style> block out into its own slot (Base places it after fonts)
    sm = STYLE_RE.search(head)
    style = sm.group(0) if sm else ""
    if sm:
        head = head[:sm.start()] + head[sm.end():]
    # strip the shared boilerplate Base provides
    for rx in BOILERPLATE:
        head = rx.sub("", head)
    # collapse the blank lines left behind, keep page-specific content verbatim
    head = re.sub(r'\n\s*\n+', '\n', head).strip()
    # --- body: everything between the shared glass-nav and </body>, minus the
    # shared trailing chrome (footer + canonical end-scripts). Page ordering of
    # footer vs scripts varies, so strip by pattern rather than by position. ---
    nav = NAV_RE.search(t)
    if nav:
        nav_end = nav.end()  # canonical: bare <nav class="glass-nav">
    else:
        # older templates wrap the site nav in a <header> (glass-nav / max-w-*).
        # Body starts after the first <header> block that contains a <nav>.
        nav_end = None
        for hm in re.finditer(r'<header\b[^>]*>.*?</header>', t, re.S):
            if '<nav' in hm.group(0):
                nav_end = hm.end(); break
        if nav_end is None:
            return None, "no recognised nav"
    bm = re.search(r'</body>', t[nav_end:])
    region = t[nav_end: nav_end + bm.start()] if bm else t[nav_end:]
    for rx in BODY_TAIL:
        region = rx.sub("", region)
    body = re.sub(r'\n\s*\n+', '\n', region).rstrip()
    return (head, style, body), None

def gen(section, slug):
    src = os.path.join(ROOT, section, slug + ".html")
    res, err = extract(src)
    if err:
        return err
    head, style, body = res
    fdir = os.path.join(ASTRO, "src", "fragments", section)
    os.makedirs(fdir, exist_ok=True)
    open(os.path.join(fdir, slug + ".head.html"), "w", encoding="utf-8").write(head)
    open(os.path.join(fdir, slug + ".style.html"), "w", encoding="utf-8").write(style)
    open(os.path.join(fdir, slug + ".body.html"), "w", encoding="utf-8").write(body)
    pdir = os.path.join(ASTRO, "src", "pages", section)
    os.makedirs(pdir, exist_ok=True)
    page = (
        "---\n"
        "import Base from '../../layouts/Base.astro';\n"
        f"import head from '../../fragments/{section}/{slug}.head.html?raw';\n"
        f"import style from '../../fragments/{section}/{slug}.style.html?raw';\n"
        f"import body from '../../fragments/{section}/{slug}.body.html?raw';\n"
        "---\n"
        "<Base>\n"
        '  <Fragment slot="head" set:html={head} />\n'
        '  <Fragment slot="style" set:html={style} />\n'
        "  <Fragment set:html={body} />\n"
        "</Base>\n"
    )
    open(os.path.join(pdir, slug + ".astro"), "w", encoding="utf-8").write(page)
    return None

if __name__ == "__main__":
    targets = sys.argv[1:]  # "journal/slug" entries; empty = all standard pages
    if not targets:
        # all journal+guides pages that have the standard glass-nav
        for p in sorted(glob.glob(os.path.join(ROOT, "journal", "*.html")) +
                        glob.glob(os.path.join(ROOT, "guides", "*.html"))):
            section = os.path.basename(os.path.dirname(p))
            slug = os.path.basename(p)[:-5]
            if slug == "index":
                continue
            targets.append(f"{section}/{slug}")
    ok = err = 0
    for tgt in targets:
        section, slug = tgt.split("/", 1)
        e = gen(section, slug)
        if e:
            err += 1; print(f"SKIP {tgt}: {e}")
        else:
            ok += 1
    print(f"\nGenerated {ok} pages, {err} skipped.")
