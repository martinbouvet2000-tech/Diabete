// Service worker Diavie — cache des ressources statiques pour l'usage hors ligne.
// Les données du journal sont en IndexedDB et ne passent jamais par le réseau.
// Incrémenter à CHAQUE modification des fichiers de l'app : c'est ce qui
// déclenche le remplacement du cache chez les visiteurs déjà venus.
const VERSION = 'diavie-v0.2.0'
const RESSOURCES = [
  './',
  'index.html',
  'css/app.css',
  'js/app.js',
  'js/config.js',
  'js/db.js',
  'js/settings.js',
  'js/foods.js',
  'js/scan.js',
  'js/stats.js',
  'data/aliments.json',
  'manifest.webmanifest',
  'icons/icon.svg',
]

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(VERSION).then((c) => c.addAll(RESSOURCES)).then(() => self.skipWaiting()))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((cles) => Promise.all(cles.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  )
})

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  // Open Food Facts : réseau uniquement (données produit à jour), échec silencieux hors ligne.
  if (url.hostname.endsWith('openfoodfacts.org')) return
  if (e.request.method !== 'GET' || url.origin !== location.origin) return
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then(
      (hit) =>
        hit ||
        fetch(e.request).then((res) => {
          const copie = res.clone()
          caches.open(VERSION).then((c) => c.put(e.request, copie))
          return res
        })
    )
  )
})
