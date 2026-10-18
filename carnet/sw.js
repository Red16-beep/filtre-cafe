/* Carnet filtré. : hors ligne. Réponse depuis le cache, mise à jour en arrière-plan pour la visite suivante.
   Changer VERSION quand la liste des fichiers change. */
var VERSION = 'carnet-v1';
var FICHIERS = [
  './', 'index.html', 'app.css', 'app.js', 'donnees.js', 'carte.js', 'manifest.webmanifest',
  'polices/newsreader-latin-wght-normal.woff2', 'polices/newsreader-latin-wght-italic.woff2', 'polices/instrument-sans-latin-wght-normal.woff2',
  'icones/icone-192.png', 'icones/apple-touch-icon.png'
];

self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(VERSION).then(function (c) { return c.addAll(FICHIERS); }).then(function () { return self.skipWaiting(); }));
});

self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (cles) {
    return Promise.all(cles.filter(function (k) { return k !== VERSION; }).map(function (k) { return caches.delete(k); }));
  }).then(function () { return self.clients.claim(); }));
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  var reseau = fetch(req).then(function (rep) {
    if (rep.ok) { var copie = rep.clone(); caches.open(VERSION).then(function (c) { c.put(req, copie); }); }
    return rep;
  });
  e.respondWith(caches.match(req).then(function (enCache) { return enCache || reseau; }));
  e.waitUntil(reseau.catch(function () { /* hors ligne : le cache a répondu */ }));
});
