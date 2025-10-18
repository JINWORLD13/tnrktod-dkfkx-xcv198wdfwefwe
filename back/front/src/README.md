# 🎨 Frontend Source Code

> Cosmos Tarot 프로젝트의 프론트엔드 소스 코드  
> Frontend source code for the Cosmos Tarot project  
> Cosmos Tarot プロジェクトのフロントエンドソースコード

---

## 📁 한글

### 개요
Vite 기반의 React 애플리케이션으로, Three.js를 활용한 3D 타로 카드 시뮬레이션과 PWA 기능을 제공합니다.

### 주요 구성
```
src/
├── components/          # UI 컴포넌트
│   ├── ThreeScene/      # Three.js 3D 장면 및 카드 애니메이션
│   ├── TarotCardForm/   # 타로 카드 선택 및 폼 관리
│   ├── Chart/           # Recharts 통계 시각화
│   ├── GoogleAd/        # AdMob 광고 통합
│   ├── Charge/          # Toss PG 결제 UI
│   ├── Navbar/          # 네비게이션 바
│   ├── Footer/          # 푸터
│   └── ui/              # shadcn/ui 기반 공통 UI
├── pages/               # 라우트별 페이지
│   ├── Home/            # 메인 페이지
│   ├── Tarot/           # 타로 서비스 페이지
│   ├── MyPage/          # 마이페이지 (이용내역, 통계)
│   └── ETC/             # 기타 페이지
├── hooks/               # 커스텀 훅
│   ├── tarot/           # 타로 관련 로직
│   ├── modal/           # 모달 상태 관리
│   ├── form/            # 폼 검증 및 제출
│   └── common/          # 공통 훅 (언어, 테마 등)
├── modals/              # 모달 컴포넌트
│   ├── AnswerModal/     # 타로 결과 표시
│   ├── TarotModal/      # 타로 카드 상세
│   ├── PurchaseModal/   # 구매 및 결제
│   └── SpreadModal/     # 스프레드 선택
├── api/                 # API 클라이언트
│   ├── tarotApi.jsx     # 타로 관련 API
│   ├── authApi.jsx      # 인증 API (Google OAuth)
│   ├── chargeApi.jsx    # 결제 API (Toss)
│   └── userApi.jsx      # 사용자 정보 API
├── store/               # Redux Toolkit 상태 관리
│   ├── userInfoStore.jsx      # 사용자 정보
│   ├── tarotCardStore.jsx     # 타로 카드 상태
│   └── tarotHistoryStore.jsx  # 타로 이용 내역
├── lib/                 # 유틸리티 및 비즈니스 로직
│   ├── tarot/           # 타로 카드 해석 로직
│   ├── chart/           # 차트 데이터 변환
│   └── user/            # 사용자 권한 및 검증
├── styles/scss/         # SCSS 스타일시트
├── locales/             # i18next 다국어 리소스 (ko, en, ja)
└── data/                # 정적 데이터 (타로 카드 덱, 스프레드 등)
```

### 핵심 기능
- **3D 카드 인터랙션**: Three.js, troika-three-text, gltfjsx로 구현된 3D 타로 카드
- **다국어 지원**: react-i18next를 통한 한국어/영어/일본어 자동 전환
- **결제 시스템**: Toss PG 웹 결제 + Capacitor IAP 앱 결제
- **광고 수익화**: Capacitor AdMob 통합 (배너, 전면, 보상형)
- **통계 시각화**: Recharts를 활용한 사용자 데이터 그래프
- **PWA 지원**: Vite PWA 플러그인 기반 오프라인 캐싱
- **SEO 최적화**: react-spa-prerender로 정적 HTML 생성

### 기술 스택
`React` · `Three.js` · `Redux Toolkit` · `SCSS` · `Capacitor` · `i18next` · `Vite` · `Recharts`

---

## 📁 English

### Overview
A Vite-based React application featuring 3D tarot card simulation with Three.js and PWA capabilities.

### Main Structure
```
src/
├── components/          # UI Components
│   ├── ThreeScene/      # Three.js 3D scenes and card animations
│   ├── TarotCardForm/   # Tarot card selection and form management
│   ├── Chart/           # Recharts statistics visualization
│   ├── GoogleAd/        # AdMob integration
│   ├── Charge/          # Toss PG payment UI
│   ├── Navbar/          # Navigation bar
│   ├── Footer/          # Footer
│   └── ui/              # shadcn/ui based common UI
├── pages/               # Route-based pages
│   ├── Home/            # Main page
│   ├── Tarot/           # Tarot service pages
│   ├── MyPage/          # My page (history, statistics)
│   └── ETC/             # Other pages
├── hooks/               # Custom hooks
│   ├── tarot/           # Tarot-related logic
│   ├── modal/           # Modal state management
│   ├── form/            # Form validation and submission
│   └── common/          # Common hooks (language, theme, etc.)
├── modals/              # Modal components
│   ├── AnswerModal/     # Tarot result display
│   ├── TarotModal/      # Tarot card details
│   ├── PurchaseModal/   # Purchase and payment
│   └── SpreadModal/     # Spread selection
├── api/                 # API clients
│   ├── tarotApi.jsx     # Tarot-related APIs
│   ├── authApi.jsx      # Authentication API (Google OAuth)
│   ├── chargeApi.jsx    # Payment API (Toss)
│   └── userApi.jsx      # User information API
├── store/               # Redux Toolkit state management
│   ├── userInfoStore.jsx      # User information
│   ├── tarotCardStore.jsx     # Tarot card state
│   └── tarotHistoryStore.jsx  # Tarot usage history
├── lib/                 # Utilities and business logic
│   ├── tarot/           # Tarot card interpretation logic
│   ├── chart/           # Chart data transformation
│   └── user/            # User permissions and validation
├── styles/scss/         # SCSS stylesheets
├── locales/             # i18next multi-language resources (ko, en, ja)
└── data/                # Static data (tarot deck, spreads, etc.)
```

### Core Features
- **3D Card Interaction**: 3D tarot cards built with Three.js, troika-three-text, gltfjsx
- **Multi-language Support**: Automatic switching between Korean/English/Japanese via react-i18next
- **Payment System**: Toss PG web payment + Capacitor IAP for mobile
- **Ad Monetization**: Capacitor AdMob integration (banner, interstitial, rewarded)
- **Statistics Visualization**: User data graphs using Recharts
- **PWA Support**: Offline caching based on Vite PWA plugin
- **SEO Optimization**: Static HTML generation with react-spa-prerender

### Tech Stack
`React` · `Three.js` · `Redux Toolkit` · `SCSS` · `Capacitor` · `i18next` · `Vite` · `Recharts`

---

## 📁 日本語

### 概要
Vite ベースの React アプリケーションで、Three.js を活用した 3D タロットカードシミュレーションと PWA 機能を提供します。

### 主な構成
```
src/
├── components/          # UI コンポーネント
│   ├── ThreeScene/      # Three.js 3D シーンとカードアニメーション
│   ├── TarotCardForm/   # タロットカード選択とフォーム管理
│   ├── Chart/           # Recharts 統計可視化
│   ├── GoogleAd/        # AdMob 統合
│   ├── Charge/          # Toss PG 決済 UI
│   ├── Navbar/          # ナビゲーションバー
│   ├── Footer/          # フッター
│   └── ui/              # shadcn/ui ベース共通 UI
├── pages/               # ルート別ページ
│   ├── Home/            # メインページ
│   ├── Tarot/           # タロットサービスページ
│   ├── MyPage/          # マイページ（履歴、統計）
│   └── ETC/             # その他のページ
├── hooks/               # カスタムフック
│   ├── tarot/           # タロット関連ロジック
│   ├── modal/           # モーダル状態管理
│   ├── form/            # フォーム検証と送信
│   └── common/          # 共通フック（言語、テーマなど）
├── modals/              # モーダルコンポーネント
│   ├── AnswerModal/     # タロット結果表示
│   ├── TarotModal/      # タロットカード詳細
│   ├── PurchaseModal/   # 購入および決済
│   └── SpreadModal/     # スプレッド選択
├── api/                 # API クライアント
│   ├── tarotApi.jsx     # タロット関連 API
│   ├── authApi.jsx      # 認証 API (Google OAuth)
│   ├── chargeApi.jsx    # 決済 API (Toss)
│   └── userApi.jsx      # ユーザー情報 API
├── store/               # Redux Toolkit 状態管理
│   ├── userInfoStore.jsx      # ユーザー情報
│   ├── tarotCardStore.jsx     # タロットカード状態
│   └── tarotHistoryStore.jsx  # タロット利用履歴
├── lib/                 # ユーティリティおよびビジネスロジック
│   ├── tarot/           # タロットカード解釈ロジック
│   ├── chart/           # チャートデータ変換
│   └── user/            # ユーザー権限と検証
├── styles/scss/         # SCSS スタイルシート
├── locales/             # i18next 多言語リソース (ko, en, ja)
└── data/                # 静的データ（タロットデッキ、スプレッドなど）
```

### コア機能
- **3D カードインタラクション**: Three.js、troika-three-text、gltfjsx で実装された 3D タロットカード
- **多言語サポート**: react-i18next による韓国語/英語/日本語の自動切り替え
- **決済システム**: Toss PG Web 決済 + Capacitor IAP アプリ決済
- **広告収益化**: Capacitor AdMob 統合（バナー、インタースティシャル、リワード）
- **統計可視化**: Recharts を活用したユーザーデータグラフ
- **PWA サポート**: Vite PWA プラグインベースのオフラインキャッシング
- **SEO 最適化**: react-spa-prerender による静的 HTML 生成

### 技術スタック
`React` · `Three.js` · `Redux Toolkit` · `SCSS` · `Capacitor` · `i18next` · `Vite` · `Recharts`
