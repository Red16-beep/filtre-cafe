#!/usr/bin/env python3
"""Sert astro/dist comme Cloudflare Pages : /page -> page.html, /dossier/ -> index.html, sinon 404.html (statut 404).
Usage : python3 tools/v2/serve.py [port]"""
import http.server, os, sys

RACINE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'astro', 'dist'))

class Gestion(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=RACINE, **k)

    def send_head(self):
        chemin = self.path.split('?', 1)[0].split('#', 1)[0]
        local = self.translate_path(chemin)
        if not os.path.exists(local) and os.path.exists(local + '.html'):
            self.path = chemin + '.html'
        elif not os.path.exists(local) and not (os.path.isdir(local) and os.path.exists(os.path.join(local, 'index.html'))):
            try:
                f = open(os.path.join(RACINE, '404.html'), 'rb')
            except OSError:
                return super().send_head()
            self.send_response(404)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(os.fstat(f.fileno()).st_size))
            self.end_headers()
            return f
        return super().send_head()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4322
    print(f'filtré. v2 : http://localhost:{port}  ({RACINE})', flush=True)
    http.server.ThreadingHTTPServer(('127.0.0.1', port), Gestion).serve_forever()
