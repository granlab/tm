// offline cache: network first (4 s), cache fallback. Caches only same-origin GETs of this static site.
const C = "tm-mugn8dzb";
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(["./", "./probe/"])).catch(() => {}).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const r = e.request; if (r.method !== "GET" || new URL(r.url).origin !== location.origin) return;
  const net = fetch(r).then(res => { if (res.ok) { const cp = res.clone(); caches.open(C).then(c => c.put(r, cp)); } return res; });
  const slow = new Promise((_, rej) => setTimeout(() => rej(new Error("slow")), 4000));
  e.respondWith(Promise.race([net, slow]).catch(() => caches.match(r, { ignoreSearch: true }).then(m => m || net)));
});
