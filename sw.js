// ============================================================
// 전기(공사) 계산기 서비스 워커
// ------------------------------------------------------------
// 전략:
//  - HTML / JS / JSON  → 네트워크 우선 (오프라인일 때만 캐시 사용)
//    → 파일을 새로 배포하면 새로고침만으로 즉시 반영됩니다.
//  - 이미지 / 아이콘    → 캐시 우선 (거의 바뀌지 않고 용량이 크므로)
//
// 캐시 버전(CACHE_NAME)은 이제 매번 올릴 필요가 없습니다.
// 아이콘 등 정적 리소스를 교체했을 때만 숫자를 올리세요.
// ============================================================
const CACHE_NAME = 'electric-calculator-v10';

// 오프라인 대비용으로 미리 받아두는 파일들
const urlsToCache = [
  '/icons/IMG_1900.png',
  '/icons/IMG_1901.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/product1.jpg',
  '/icons/product2.jpg',
  '/manifest.json',
  // 계산기 페이지들
  '/index.html',
  '/cable.html',
  '/cable2.html',
  '/conduit-size.html',
  '/voltage-drop.html',
  '/moltal.html',
  '/earth.html',
  // 인증 관련
  '/login.html',
  '/auth-guard.js',
  '/firebase-config.js'
];

// 항상 최신을 우선 확인할 확장자
function isFreshFirst(url) {
  // 페이지 이동(내비게이션)이거나 코드/문서 파일이면 네트워크 우선
  return /\.(html|js|json)(\?|$)/i.test(url) || url.endsWith('/');
}

// ---------- 설치 ----------
self.addEventListener('install', function (event) {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      // 일부 파일이 없어도 설치가 실패하지 않도록 개별 처리
      return Promise.all(
        urlsToCache.map(function (url) {
          return cache.add(url).catch(function () {
            console.warn('캐시 실패(무시):', url);
          });
        })
      );
    })
  );
});

// ---------- 요청 처리 ----------
self.addEventListener('fetch', function (event) {
  var req = event.request;

  // GET 이외(POST 등)나 외부 도메인 요청은 그대로 통과
  if (req.method !== 'GET' || !req.url.startsWith(self.location.origin)) {
    return;
  }

  // 1) HTML / JS / JSON → 네트워크 우선, 실패 시 캐시
  if (req.mode === 'navigate' || isFreshFirst(req.url)) {
    event.respondWith(
      fetch(req)
        .then(function (response) {
          if (response && response.status === 200 && response.type === 'basic') {
            var copy = response.clone();
            caches.open(CACHE_NAME).then(function (cache) {
              cache.put(req, copy);
            });
          }
          return response;
        })
        .catch(function () {
          // 오프라인: 캐시에 있으면 그걸로, 없으면 메인 페이지로
          return caches.match(req).then(function (cached) {
            return cached || caches.match('/index.html');
          });
        })
    );
    return;
  }

  // 2) 그 외(이미지 등) → 캐시 우선, 없으면 네트워크
  event.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (response) {
        if (!response || response.status !== 200 || response.type !== 'basic') {
          return response;
        }
        var copy = response.clone();
        caches.open(CACHE_NAME).then(function (cache) {
          cache.put(req, copy);
        });
        return response;
      });
    })
  );
});

// ---------- 활성화: 옛 캐시 정리 ----------
self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys()
      .then(function (names) {
        return Promise.all(
          names.map(function (name) {
            if (name !== CACHE_NAME) return caches.delete(name);
          })
        );
      })
      .then(function () {
        return self.clients.claim();
      })
  );
});
