// Register service worker

// Check if service worker is supported
if ("serviceWorker" in navigator) {
  //install service worker if it's supported
  navigator.serviceWorker
    .register("/sw.js")
    //this registration returns a promise
    .then((reg) => {
      console.info("Service worker reg", reg);
    })
    .catch((err) => {
      console.error("Failed to register service worker", err);
    });
} else {
  console.info("Service worker is not supported");
}
