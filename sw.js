const CACHE='jeju-planner-shell-v2';
const ASSETS=['./','./index.html','./manifest.json','./icon-192.png','./icon-512.png'];

self.addEventListener('install',(e)=>{
  e.waitUntil(caches.open(CACHE).then((c)=>c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate',(e)=>{
  e.waitUntil(
    caches.keys().then((keys)=>Promise.all(keys.filter((k)=>k!==CACHE).map((k)=>caches.delete(k))))
  );
  self.clients.claim();
});

self.addEventListener('fetch',(e)=>{
  const url=new URL(e.request.url);
  // 우리 사이트 파일(GET)만 캐싱 처리. Firebase 등 외부 요청은 그대로 통과시킴.
  if(e.request.method!=='GET'||url.origin!==self.location.origin){
    return;
  }
  e.respondWith(
    caches.match(e.request).then((cached)=>{
      const fetchPromise=fetch(e.request).then((res)=>{
        const resClone=res.clone();
        caches.open(CACHE).then((c)=>c.put(e.request,resClone));
        return res;
      }).catch(()=>cached);
      return cached||fetchPromise;
    })
  );
});
