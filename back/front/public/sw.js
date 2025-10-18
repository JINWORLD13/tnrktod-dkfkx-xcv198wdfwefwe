import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import {
  CacheFirst,
  NetworkFirst,
  StaleWhileRevalidate,
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// 캐시 만료 기간 설정 / Cache expiration period / キャッシュ有効期限設定
const days = 1;

// 빌드 버전 (빌드 시 자동 주입됨) / Build version (auto-injected during build) / ビルドバージョン（ビルド時に自動注入）
const version = __BUILD_VERSION__;

// 오래된 precache 자동 정리 / Auto-cleanup outdated precache / 古いprecacheの自動クリーンアップ
cleanupOutdatedCaches();

// Workbox 매니페스트를 사용한 프리캐싱 / Precache using Workbox manifest / Workboxマニフェストによる事前キャッシング
// WB_MANIFEST는 빌드 시 파일 목록으로 자동 주입됨 / WB_MANIFEST is auto-injected with file list during build / WB_MANIFESTはビルド時にファイルリストで自動注入
precacheAndRoute(self.__WB_MANIFEST);

// HTML 캐싱: NetworkFirst 전략 (최신 버전 우선, maxEntries: 20) / HTML caching: NetworkFirst strategy (latest version priority, maxEntries: 20) / HTMLキャッシング：NetworkFirst戦略（最新バージョン優先、maxEntries: 20）
registerRoute(
  ({ request }) => request.destination === 'document',
  new NetworkFirst({
    cacheName: `html-${version}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: days * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// CSS 캐싱: CacheFirst 전략 (해시 버전 관리, maxEntries: 50) / CSS caching: CacheFirst strategy (hash version control, maxEntries: 50) / CSSキャッシング：CacheFirst戦略（ハッシュバージョン管理、maxEntries: 50）
registerRoute(
  ({ request }) => request.destination === 'style',
  new CacheFirst({
    cacheName: `css-${version}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: days * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// JavaScript 캐싱: CacheFirst 전략 (sw.js 제외, maxEntries: 50) / JavaScript caching: CacheFirst strategy (excluding sw.js, maxEntries: 50) / JavaScriptキャッシング：CacheFirst戦略（sw.js除外、maxEntries: 50）
registerRoute(
  ({ request, url }) =>
    request.destination === 'script' && !url.pathname.endsWith('/sw.js'),
  new CacheFirst({
    cacheName: `js-${version}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: days * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// 이미지 캐싱: CacheFirst 전략 (maxEntries: 100) / Image caching: CacheFirst strategy (maxEntries: 100) / 画像キャッシング：CacheFirst戦略（maxEntries: 100）
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: `images-${version}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: days * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// 폰트 캐싱: CacheFirst 전략 (1년 캐시) / Font caching: CacheFirst strategy (1 year cache) / フォントキャッシング：CacheFirst戦略（1年キャッシュ）
registerRoute(
  ({ request }) => request.destination === 'font',
  new CacheFirst({
    cacheName: `fonts-${version}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 30,
        maxAgeSeconds: 365 * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// 3D 모델 캐싱: CacheFirst 전략 (GLTF, GLB, BIN) / 3D model caching: CacheFirst strategy (GLTF, GLB, BIN) / 3Dモデルキャッシング：CacheFirst戦略（GLTF、GLB、BIN）
registerRoute(
  /\.(?:gltf|glb|bin)$/i,
  new CacheFirst({
    cacheName: `models-${version}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: days * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// 매니페스트 캐싱: StaleWhileRevalidate 전략 / Manifest caching: StaleWhileRevalidate strategy / マニフェストキャッシング：StaleWhileRevalidate戦略
registerRoute(
  /\.(?:webmanifest|json)$/i,
  new StaleWhileRevalidate({
    cacheName: `manifest-${version}`,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 10,
        maxAgeSeconds: days * 24 * 60 * 60,
        purgeOnQuotaError: true,
      }),
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
    ],
  })
);

// 런타임 캐시 이름 목록 / Runtime cache names / ランタイムキャッシュ名リスト
const RUNTIME_CACHE_NAMES = [
  `html-${version}`,
  `css-${version}`,
  `js-${version}`,
  `images-${version}`,
  `fonts-${version}`,
  `models-${version}`,
  `manifest-${version}`,
];

// 주기적 캐시 정리 설정 / Periodic cache cleanup configuration / 定期的なキャッシュクリーンアップ設定
const CACHE_SIZE_LIMIT_MB = 100;
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;

/**
 * 캐시 크기 확인 및 오래된 항목 삭제
 * Check cache size and delete old entries when exceeds threshold
 * キャッシュサイズ確認および古いエントリの削除
 */
async function periodicCacheCleanup() {
  try {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const usageMB = (estimate.usage || 0) / (1024 * 1024);
      const quotaMB = (estimate.quota || 0) / (1024 * 1024);
      const usagePercent = (usageMB / quotaMB) * 100;

      console.log(
        `[SW ${version}] Storage: ${usageMB.toFixed(2)}MB / ${quotaMB.toFixed(
          2
        )}MB (${usagePercent.toFixed(1)}%)`
      );

      if (usagePercent > 80 || usageMB > CACHE_SIZE_LIMIT_MB) {
        console.log(`[SW ${version}] Storage limit exceeded, cleaning up...`);
        await cleanupOldCacheEntries();
      }
    }
  } catch (error) {
    console.error(`[SW ${version}] Periodic cleanup error:`, error);
  }
}

/**
 * 오래된 캐시 항목 정리 (50% 삭제)
 * Cleanup old cache entries (delete 50%)
 * 古いキャッシュエントリのクリーンアップ（50%削除）
 */
async function cleanupOldCacheEntries() {
  const cacheNames = await caches.keys();

  for (const cacheName of cacheNames) {
    if (cacheName.startsWith('workbox-precache')) continue;

    const cache = await caches.open(cacheName);
    const keys = await cache.keys();

    if (keys.length > 50) {
      const deleteCount = Math.floor(keys.length * 0.5);
      for (let i = 0; i < deleteCount; i++) {
        await cache.delete(keys[i]);
      }
      console.log(
        `[SW ${version}] Cleaned up ${deleteCount} entries from ${cacheName}`
      );
    }
  }
}

// 5분마다 정리 실행 / Run cleanup every 5 minutes / 5分ごとにクリーンアップ実行
setInterval(periodicCacheCleanup, CLEANUP_INTERVAL_MS);

// 초기 실행 (1분 후) / Initial run (after 1 minute) / 初回実行（1分後）
setTimeout(periodicCacheCleanup, 60000);

// 설치 이벤트: 새로운 Service Worker 설치 / Install event: New Service Worker installation / インストールイベント：新しいService Workerのインストール
self.addEventListener('install', event => {
  console.log(`[SW ${version}] Installing...`);
});

// 활성화 이벤트: 오래된 캐시 삭제 / Activate event: Delete old caches / アクティベートイベント：古いキャッシュの削除
self.addEventListener('activate', event => {
  console.log(`[SW ${version}] Activating...`);

  event.waitUntil(
    (async () => {
      try {
        const cacheNames = await caches.keys();
        let deletedCount = 0;

        await Promise.all(
          cacheNames.map(async cacheName => {
            if (cacheName.startsWith('workbox-precache')) {
              return;
            }

            const isCurrentCache = RUNTIME_CACHE_NAMES.includes(cacheName);
            if (!isCurrentCache) {
              console.log(`[SW ${version}] Deleting old cache: ${cacheName}`);
              await caches.delete(cacheName);
              deletedCount++;
            }
          })
        );

        console.log(
          `[SW ${version}] Activated successfully (deleted ${deletedCount} old caches)`
        );
      } catch (error) {
        console.error(`[SW ${version}] Activation error:`, error);
      }
    })()
  );
});

// 메시지 이벤트: 클라이언트 메시지 처리 / Message event: Handle client messages / メッセージイベント：クライアントメッセージ処理
self.addEventListener('message', event => {
  // SKIP_WAITING 메시지 처리 / Handle SKIP_WAITING message / SKIP_WAITINGメッセージ処理
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log(`[SW ${version}] Received SKIP_WAITING message`);
    self.skipWaiting();
  }

  // 수동 캐시 정리 요청 / Manual cache cleanup request / 手動キャッシュクリーンアップ要求
  if (event.data && event.data.type === 'CLEANUP_CACHE') {
    console.log(`[SW ${version}] Manual cache cleanup requested`);
    event.waitUntil(cleanupOldCacheEntries());
  }

  // 캐시 상태 확인 요청 / Cache status check request / キャッシュステータス確認要求
  if (event.data && event.data.type === 'CHECK_CACHE_STATUS') {
    event.waitUntil(
      (async () => {
        try {
          const estimate = await navigator.storage.estimate();
          const usageMB = (estimate.usage || 0) / (1024 * 1024);
          const quotaMB = (estimate.quota || 0) / (1024 * 1024);

          // 클라이언트에게 응답 전송
          const clients = await self.clients.matchAll();
          clients.forEach(client => {
            client.postMessage({
              type: 'CACHE_STATUS',
              usage: usageMB,
              quota: quotaMB,
              percent: (usageMB / quotaMB) * 100,
            });
          });
        } catch (error) {
          console.error(`[SW ${version}] Cache status check error:`, error);
        }
      })()
    );
  }
});

// 에러 핸들링 / Error handling / エラーハンドリング
self.addEventListener('error', event => {
  console.error(`[SW ${version}] Error:`, event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error(`[SW ${version}] Unhandled rejection:`, event.reason);
});

console.log(`[SW ${version}] Loaded successfully`);
