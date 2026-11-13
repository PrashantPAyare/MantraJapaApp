const CACHE='still-__VERSION__';const ASSETS=__ASSETS__;
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS))));
// Updates wait until the user saves and explicitly accepts; never auto-reload a session.
self.addEventListener('message',e=>{if(e.data==='ACTIVATE')self.skipWaiting();});
self.addEventListener('activate',e=>e.waitUntil(self.clients.claim()));
// Retain earlier caches so tabs still running an earlier version remain usable.
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==self.location.origin)return;e.respondWith(caches.open(CACHE).then(async c=>(await c.match(e.request,{ignoreSearch:true}))||(e.request.mode==='navigate' ? await c.match('./index.html') : undefined)||fetch(e.request)));});
