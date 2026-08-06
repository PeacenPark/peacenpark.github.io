const CACHE_NAME = 'electric-calculator-v8';
const urlsToCache = [
  '/icons/IMG_1900.png',
  '/icons/IMG_1901.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/product1.jpg',
  '/icons/product2.jpg',
  '/manifest.json',
  // 계산기 페이지들
  '/cable2.html',
  '/conduit-size.html',
  '/voltage-drop.html',
  '/moltal.html',
  '/earth.html',
  // 인증 관련 페이지/스크립트
  '/login.html',
  '/auth-guard.js',
  '/firebase-config.js'
];

// 인증 관련 파일은 항상 최신 버전을 우선 가져옴 (관리자 승인 로직 등이 바뀔 수 있으므로)
const NETWORK_FIRST = ['index.html', 'login.html', 'admin.html', 'auth-guard.js', 'firebase-config.js'];

// 서비스 워커 설치 및 캐시 파일 선정
self.addEventListener('install', function(event) {
  // 즉시 활성화
  self.skipWaiting();
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('캐시 열림');
        return cache.addAll(urlsToCache);
      })
  );
});

// 캐시 또는 네트워크에서 리소스 가져오기
self.addEventListener('fetch', function(event) {
  // 인증 관련 파일들은 항상 네트워크에서 최신 버전 가져오기
  if (NETWORK_FIRST.some(function(name) { return event.request.url.includes(name); }) || event.request.url.endsWith('/')) {
    event.respondWith(
      fetch(event.request).catch(function() {
        return caches.match(event.request);
      })
    );
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // 캐시에서 찾은 경우 반환
        if (response) {
          return response;
        }
        
        // 캐시에 없는 경우 네트워크 요청
        return fetch(event.request).then(
          function(response) {
            // 유효한 응답이 아닌 경우 그대로 반환
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 중요: 응답을 복제하여 사용
            // 응답 스트림은 한 번만 읽을 수 있기 때문
            var responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          }
        );
      })
    );
});

// 새 서비스 워커가 활성화될 때 이전 캐시 삭제
self.addEventListener('activate', function(event) {
  const cacheWhitelist = [CACHE_NAME];
  
  // 즉시 클라이언트 제어
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(function() {
      return self.clients.claim();
    })
  );
});
