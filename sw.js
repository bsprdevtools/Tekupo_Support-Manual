// Service Worker for 脳にいいアプリ FAQ PWA
const CACHE_NAME = 'tekupo-support-v2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// インストール時の処理
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

// フェッチ時の処理（ネットワークファーストストラテジー）
self.addEventListener('fetch', (event) => {
  event.respondWith(
    // HTMLファイルは常に最新版をチェック
    fetch(event.request)
      .then((response) => {
        // 有効なレスポンスかチェック
        if (!response || response.status !== 200) {
          // ネットワークエラーの場合はキャッシュから返す
          return caches.match(event.request);
        }
        // 新しいレスポンスをキャッシュに保存
        const responseToCache = response.clone();
        caches.open(CACHE_NAME)
          .then((cache) => {
            cache.put(event.request, responseToCache);
          });
        return response;
      })
      .catch(() => {
        // ネットワークに接続できない場合はキャッシュから返す
        return caches.match(event.request);
      })
  );
});

// アクティベート時の処理（古いキャッシュの削除）
self.addEventListener('activate', (event) => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
