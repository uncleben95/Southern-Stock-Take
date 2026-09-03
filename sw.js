// Bump this version number EVERY TIME you deploy changes to
// index.html or firebase.js — otherwise installed phones may
// keep using the old cached version indefinitely.
const CACHE_NAME = "renocal-stock-take-v2";

const APP_FILES = [
  "./",
  "./index.html",
  "./firebase.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png"
];

// Files that should always be fetched fresh from the network first,
// falling back to cache only when offline. This is what makes sure
// a phone actually picks up your latest deploy instead of being
// stuck on a stale cached copy.
const NETWORK_FIRST_FILES = [
  "index.html",
  "firebase.js"
];


/* =========================================
   INSTALL
========================================= */

self.addEventListener("install", event => {

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_FILES))
  );

  self.skipWaiting();

});


/* =========================================
   ACTIVATE
========================================= */

self.addEventListener("activate", event => {

  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
  );

  self.clients.claim();

});


/* =========================================
   FETCH
========================================= */

self.addEventListener("fetch", event => {

  if(event.request.method !== "GET") {
    return;
  }

  const url = new URL(event.request.url);
  const isNetworkFirst = NETWORK_FIRST_FILES.some(f => url.pathname.endsWith(f));

  if(isNetworkFirst){

    // Try the network first so updates (like new login/auth code)
    // reach the device immediately. Only fall back to cache if offline.
    event.respondWith(
      fetch(event.request)
        .then(response => {

          if(response && response.status === 200){
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
          }

          return response;

        })
        .catch(() => caches.match(event.request).then(cached => cached || caches.match("./index.html")))
    );

    return;
  }

  // Everything else (CSS-in-file, icons, manifest, Firebase SDK, etc):
  // cache-first as before, since those rarely change.
  event.respondWith(

    caches.match(event.request)
      .then(cached => {

        if(cached) {
          return cached;
        }

        return fetch(event.request)
          .then(response => {

            if(
              !response ||
              response.status !== 200 ||
              response.type === "opaque"
            ){
              return response;
            }

            const copy = response.clone();

            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, copy);
              });

            return response;

          })
          .catch(() => caches.match("./index.html"));

      })

  );

});
