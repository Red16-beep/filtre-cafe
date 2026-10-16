#!/usr/bin/env python3
"""Sert astro/dist comme Cloudflare Pages, pour l'aperçu local de la version test.
- /page -> page.html ; /dossier/ -> dossier/index.html
- /page/ -> 308 vers /page quand page.html existe ; /page.html -> 308 vers /page
- règles exactes de _redirects ; jamais de liste de dossier ; sinon 404.html (statut 404)
Usage : python3 tools/v2/serve.py [port]"""
import http.server, os, sys

RACINE = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', 'astro', 'dist'))

def lire_redirections():
    regles = {}
    try:
        for ligne in open(os.path.join(RACINE, '_redirects'), encoding='utf-8'):
            morceaux = ligne.split()
            if len(morceaux) >= 2 and not ligne.startswith('#') and '*' not in morceaux[0]:
                regles[morceaux[0]] = (morceaux[1], int(morceaux[2]) if len(morceaux) > 2 else 302)
    except OSError:
        pass
    return regles

class Gestion(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=RACINE, **k)

    def rediriger(self, cible, statut):
        self.send_response(statut)
        self.send_header('Location', cible)
        self.send_header('Content-Length', '0')
        self.end_headers()
        return None

    def page_404(self):
        f = open(os.path.join(RACINE, '404.html'), 'rb')
        self.send_response(404)
        self.send_header('Content-Type', 'text/html; charset=utf-8')
        self.send_header('Content-Length', str(os.fstat(f.fileno()).st_size))
        self.end_headers()
        return f

    def send_head(self):
        chemin, _, requete = self.path.partition('?')
        chemin = chemin.split('#', 1)[0]
        suite = ('?' + requete) if requete else ''
        regles = lire_redirections()
        if chemin in regles:
            cible, statut = regles[chemin]
            return self.rediriger(cible + suite, statut)
        local = self.translate_path(chemin)
        if os.path.isdir(local):
            if os.path.exists(os.path.join(local, 'index.html')):
                if not chemin.endswith('/'):
                    return self.rediriger(chemin + '/' + suite, 308)
                self.path = chemin + 'index.html'
                return super().send_head()
            sans = chemin.rstrip('/')
            if sans and os.path.isfile(self.translate_path(sans + '.html')):
                if chemin.endswith('/'):
                    return self.rediriger(sans + suite, 308)
                self.path = sans + '.html'
                return super().send_head()
            return self.page_404()
        if chemin.endswith('.html') and os.path.isfile(local):
            propre = chemin[:-5]
            if propre.endswith('/index'):
                propre = propre[:-5]
            return self.rediriger(propre + suite, 308)
        if not os.path.exists(local) and os.path.isfile(local + '.html'):
            self.path = chemin + '.html'
            return super().send_head()
        if not os.path.exists(local):
            return self.page_404()
        return super().send_head()

    def end_headers(self):
        self.send_header('Cache-Control', 'no-store')
        super().end_headers()

if __name__ == '__main__':
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 4322
    print(f'filtré. v2 : http://localhost:{port}  ({RACINE})', flush=True)
    http.server.ThreadingHTTPServer(('127.0.0.1', port), Gestion).serve_forever()
