const CACHE_NAME='vybe-digital-closet-v1';
const ASSETS=['./','./index.html','./manifest.json','./icon.svg'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(ASSETS))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE_NAME).map(k=>caches.delete(k))))));
self.addEventListener('fetch',e=>{if(e.request.method==='GET')e.respondWith(fetch(e.request).then(r=>{if(r.status===200&&e.request.url.startsWith(self.location.origin)){const c=r.clone();caches.open(CACHE_NAME).then(cache=>cache.put(e.request,c))}return r}).catch(()=>caches.match(e.request)))});
