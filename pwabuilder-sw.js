console.log('Hello from service-worker.js')

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.4/workbox-sw.js')

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST)
