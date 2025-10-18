import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import viteImagemin from 'vite-plugin-imagemin';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import fs from 'fs';

// 현재 파일 디렉토리 경로 추출 / Extract current file directory path / 現在のファイルディレクトリパスを抽出
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 빌드 버전 생성 (타임스탬프 기반) / Generate build version (timestamp-based) / ビルドバージョン生成（タイムスタンプベース）
const BUILD_VERSION = `v${Date.now()}`;

/**
 * Service Worker에 빌드 버전 주입 플러그인
 * Plugin to inject build version into Service Worker
 * Service Workerにビルドバージョンを注入するプラグイン
 */
const injectBuildVersionPlugin = () => ({
  name: 'inject-build-version',
  writeBundle() {
    const swPath = path.resolve(__dirname, 'dist/sw.js');
    if (fs.existsSync(swPath)) {
      let swContent = fs.readFileSync(swPath, 'utf-8');
      swContent = swContent.replace(/__BUILD_VERSION__/g, `"${BUILD_VERSION}"`);
      fs.writeFileSync(swPath, swContent, 'utf-8');
      console.log(
        `✅ Service Worker updated with BUILD_VERSION: ${BUILD_VERSION}`
      );
    }
  },
});

export default defineConfig(({ mode }) => ({
  base: '/',
  define: {
    __BUILD_VERSION__: JSON.stringify(BUILD_VERSION),
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern',
      },
    },
  },
  plugins: [
    react(),
    injectBuildVersionPlugin(),
    VitePWA({
      // 사용자 제어 업데이트 / User-controlled update / ユーザー制御アップデート
      registerType: 'prompt',
      devOptions: {
        enabled: false,
        type: 'module',
      },
      workbox: {
        // 오래된 캐시 자동 정리 / Auto-cleanup outdated caches / 古いキャッシュの自動クリーンアップ
        cleanupOutdatedCaches: true,
        // SW 수동 제어 (sw.js에서 처리) / Manual SW control (handled in sw.js) / SW手動制御（sw.jsで処理）
        skipWaiting: false,
        clientsClaim: false,
      },
      manifest: {
        name: 'Cosmos Tarot',
        short_name: 'Cosmos Tarot',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        lang: 'en',
        scope: '/',
        description:
          'Read the hearts of the person you would like to know about',
        theme_color: '#000000',
        icons: [
          {
            src: 'assets/cosmos_tarot_favicon/android-icon-36x36.png',
            sizes: '36x36',
            type: 'image/png',
            density: '0.75',
            purpose: 'any',
          },
          {
            src: 'assets/cosmos_tarot_favicon/android-icon-48x48.png',
            sizes: '48x48',
            type: 'image/png',
            density: '1.0',
            purpose: 'any',
          },
          {
            src: 'assets/cosmos_tarot_favicon/android-icon-72x72.png',
            sizes: '72x72',
            type: 'image/png',
            density: '1.5',
            purpose: 'any',
          },
          {
            src: 'assets/cosmos_tarot_favicon/android-icon-96x96.png',
            sizes: '96x96',
            type: 'image/png',
            density: '2.0',
            purpose: 'any',
          },
          {
            src: 'assets/cosmos_tarot_favicon/android-icon-144x144.png',
            sizes: '144x144',
            type: 'image/png',
            density: '3.0',
            purpose: 'any',
          },
          {
            src: 'assets/cosmos_tarot_favicon/android-icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            density: '4.0',
            purpose: 'any',
          },
          {
            src: 'assets/cosmos_tarot_favicon/cosmos_tarot-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
          {
            src: 'assets/cosmos_tarot_favicon/cosmos_tarot-512x512-maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        id: 'com.cosmostarot.cosmostarot',
      },
      /**
       * injectManifest 전략: 커스텀 Service Worker 사용
       * injectManifest strategy: Use custom Service Worker
       * injectManifest戦略：カスタムService Workerを使用
       */
      strategies: 'injectManifest',
      srcDir: 'public',
      filename: 'sw.js',
      injectManifest: {
        swSrc: 'public/sw.js',
        swDest: 'dist/sw.js',
        globDirectory: 'dist',
        injectionPoint: 'self.__WB_MANIFEST',
        additionalManifestEntries: [],
        // Precache 대상 파일 패턴 / Precache target file patterns / Precache対象ファイルパターン
        globPatterns: [
          '**/*.{webmanifest,js,css,png,jpg,jpeg,svg,ttf,gltf,glb,bin}',
        ],
        // Precache 제외 파일 / Exclude from precache / Precacheから除外
        globIgnores: [
          '**/sw.js',
          '**/sw.mjs',
          '**/*.html',
          '**/cosmos_tarot_favicon/**',
        ],
        maximumFileSizeToCacheInBytes: 9 * 1024 * 1024,
        rollupFormat: 'iife',
      },
    }),
    // 이미지 최적화 설정 / Image optimization configuration / 画像最適化設定
    viteImagemin({
      gifsicle: {
        optimizationLevel: 7,
        interlaced: false,
      },
      optipng: {
        optimizationLevel: 7,
      },
      mozjpeg: {
        quality: 60,
      },
      pngquant: {
        quality: [0.8, 0.9],
        speed: 4,
      },
      svgo: {
        plugins: [
          {
            name: 'removeViewBox',
          },
          {
            name: 'removeEmptyAttrs',
            active: false,
          },
        ],
      },
    }),
  ],
  build: {
    minify: 'esbuild',
    rollupOptions: {
      output: {
        // 파일명 해시 패턴 / File name hash patterns / ファイル名ハッシュパターン
        entryFileNames: 'assets/index-[hash].js',
        chunkFileNames: 'assets/chunk-[hash].js',
        assetFileNames: assetInfo => {
          const fileName = assetInfo?.names?.[0] || assetInfo?.name;
          const fileNameArr = fileName.split('.');
          const extension = fileNameArr[fileNameArr.length - 1];
          const baseName = fileNameArr[0];

          // 폰트 파일 (해시 없음) / Font files (no hash) / フォントファイル（ハッシュなし）
          if (fileName === 'KosugiMaru-Regular.ttf') {
            return 'assets/font/Kosugi_Maru/[name].[ext]';
          }
          if (fileName === 'Dongle-Regular.ttf') {
            return 'assets/font/Dongle/[name].[ext]';
          }

          // 타로 카드 뒷면 / Tarot card back / タロットカード裏面
          if (baseName === 'tarot_card_back') {
            return 'assets/images/[name].[ext]';
          }

          // 타로 카드 덱 이미지 / Tarot deck images / タロットデッキ画像
          const numPrefix = Number(baseName.split('_')[0]);
          if (
            !isNaN(numPrefix) &&
            extension === 'jpg' &&
            fileName !== 'universe.jpg'
          ) {
            return 'assets/images/deck/[name].[ext]';
          }

          // Durumagi 이미지 / Durumagi images / Durumagi画像
          if (baseName.slice(0, 8) === 'durumagi') {
            return 'assets/images/[name].[ext]';
          }

          // Universe 이미지 / Universe image / Universe画像
          if (baseName === 'universe') {
            return 'assets/images/[name].[ext]';
          }

          // 기타 파일 (해시 적용) / Other files (with hash) / その他のファイル（ハッシュ適用）
          return 'assets/[name]-[hash].[ext]';
        },
      },
    },
  },
}));
