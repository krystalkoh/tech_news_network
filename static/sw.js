console.info("Service worker");

//assets that we need to cache
const toCache = [
  "/dov-bear.gif",
  "/favicon.ico",
  "/offline.html",
  "/placeholder.png",
  "/polar-bear.png",
  "/styles.css",
  "/unplugged.png",
  "/manifest.json",
  "/images/icons/icon-128x128.png",
  "/images/icons/icon-144x144.png",
  "/images/icons/icon-152x152.png",
  "/images/icons/icon-192x192.png",
  "/images/icons/icon-384x384.png",
  "/images/icons/icon-512x512.png",
  "/images/icons/icon-72x72.png",
  "/images/icons/icon-96x96.png",
  "/images/icons/hanbok-192x192.png",
  "/images/icons/merlion-192x192.png",
  "/sw.js",
  "/reg_sw.js",
];

//separate asset and content cache so changing content doesn't affect assets
//for asset cache
const assetCache = "asset";
//for content
const contentCache = "content";

// Step 0: Cache all static assets
self.addEventListener("install", (event) => {
  console.info("Installing service worker");
  // Install the assets, wait until the promise resolves
  event.waitUntil(
    //caches is a global object (global cache) in the service worker
    caches
      .open(assetCache)
      //if the assetCache doesnt' exist, it'll be created
      //returns a promise
      .then((cache) => cache.addAll(toCache))
  );
});

// Step 1 - intercept the fetch event
self.addEventListener("fetch", (event) => {
  //whenever have a request, it'll be intercepted here
  //this event holds the request
  const req = event.request;
  //network-first strategy
  //make a request out

  //check if the request is part of our application assets
  //if it is, then load from asset, don't go to the network
  if (toCache.find((v) => req.url.endsWith(v))) {
    //if find it
    event.respondWith(
      caches.open(assetCache).then((cache) => cache.match(req))
    );
    //exit if find coz cannot have 2 responses
    return;
  }

  //Scenario 1
  //if cannot then will display offline page
  event.respondWith(
    //inside the fetch, return a response from either network or we create it
    // Proxy and forward the reqeust
    fetch(req)
      //if everything ok, it's fine.
      //Scenario 2
      //if network works, then cache the content responsesupon offline, if cannot then show offline page
      .then((resp) => {
        //We have the response
        //Clone a copy of the response
        const copy = resp.clone();
        //Cache a copy of the response with the request as the key
        event.waitUntil(
          caches.open(contentCache).then((cache) => cache.put(req, copy))
        );
        //Return the response to the browswer
        return resp;
      })

      //but if fails, use cache
      //catch tells u got problem w the network
      .catch((err) => {
        //Network issue
        //Check if we are loading the container (HTML page)
        if (req.headers.get("Accept").includes("text/html")) {
          //if have means we're dealing w the container page'
          //Check if we have a previously cached content
          return caches
            .open(contentCache)
            .then((cache) =>
              //find the request, coz the req is the key
              //Attempt to match the content with the request
              cache.match(req)
            )
            .then((resp) => {
              //Found the response to the request
              //if resp is not null, return the resp
              if (!!resp) return resp;
              //Otherwise, load the offline.html
              return (
                caches
                  .open(assetCache)
                  //Otherwise , replace the page with offline page
                  .then((cache) => cache.match("/offline.html"))
              );
            });
        }

        //Otherwise all other resource type, look it up from our asset cache
        return caches.match(req); //attempt to match across all your cache
        // return caches.open(assetCache).then((cache) => cache.match(req)); //if yknow which specific cache to look in
      })
  ); //event.respondWith
}); //self.addEventListener('fetch')
