#!/usr/bin/env python3
"""Encadré promo « Le café pour aller avec » (Caprisette / Parallel, Coffee Friend).

Source unique : src/promo/cafe-cf.html. Les pages portent le bloc entre les
marqueurs <!-- cafe-cf --> ... <!-- /cafe-cf -->.

  python3 promo-cafe.py apply    # réécrit le bloc sur toutes les pages qui ont les marqueurs
  python3 promo-cafe.py remove   # retire marqueurs + bloc de toutes les pages (fin de promo)
  python3 promo-cafe.py status   # liste les pages concernées et les écarts avec la source
"""
import re, sys, glob, os

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "src/promo/cafe-cf.html")
PAGES = sorted(glob.glob(os.path.join(HERE, "src/fragments/**/*.body.html"), recursive=True))
BLOCK = re.compile(r"[ \t]*<!-- cafe-cf -->.*?<!-- /cafe-cf -->[ \t]*\n?", re.S)

def main(mode):
    block = open(SRC).read().strip("\n")
    wrapped = "<!-- cafe-cf -->\n" + block + "\n<!-- /cafe-cf -->\n"
    n = 0
    for f in PAGES:
        s = open(f).read()
        if not BLOCK.search(s):
            continue
        n += 1
        rel = os.path.relpath(f, HERE)
        if mode == "status":
            cur = BLOCK.search(s).group(0)
            print(("ok     " if cur.strip() == wrapped.strip() else "ECART  ") + rel)
            continue
        new = BLOCK.sub(lambda m: wrapped if mode == "apply" else "", s, count=1)
        if new != s:
            open(f, "w").write(new)
        print(f"{mode}: {rel}")
    print(f"{n} page(s)")

if __name__ == "__main__" and len(sys.argv) == 2 and sys.argv[1] in ("apply", "remove", "status"):
    main(sys.argv[1])
else:
    sys.exit(__doc__)
