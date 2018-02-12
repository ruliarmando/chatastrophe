importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-app.js')
importScripts('https://www.gstatic.com/firebasejs/3.9.0/firebase-messaging.js')

firebase.initializeApp({
  'messagingSenderId': '993745526339'
})

const messaging = firebase.messaging();

messaging.setBackgroundMessageHandler(function(payload) {
  console.log(payload)
  const notification = payload.notification
  const title = notification.title
  const options = {
    body: notification.body,
    icon: notification.icon,
    click_action: notification.click_action,
  }
  return self.registration.showNotification(title, options)
})

const CACHE_NAME = 'v1'

self.addEventListener('install', function(event) {
  event.waitUntil(caches.open(CACHE_NAME).then(function(cache) {
    fetch('asset-manifest.json').then(function(response) {
      if (response.ok) {
        response.json().then(function(manifest) {
          const urls = Object.keys(manifest).map(function(key) { return manifest[key] })
          urls.push('/')
          urls.push('/assets/icon.png')
          cache.addAll(urls)
        })
      }
    })
  }))
})

self.addEventListener('fetch', function(event) {
  event.respondWith(caches.match(event.request).then(function(response) {
    return response || fetch(event.request)
  }))
})

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(keyList) {
      Promise.all(keyList.map(function(key) {
        if (key !== CACHE_NAME) {
          return caches.delete(key)
        }
      }))
    })
  )
})
