# ⚙️ Backend Source Code

> Cosmos Tarot 프로젝트의 백엔드 소스 코드  
> Backend source code for the Cosmos Tarot project  
> Cosmos Tarot プロジェクトのバックエンドソースコード

---

## 📁 한글

### 개요

Node.js Express 기반의 RESTful API 서버로, MongoDB를 사용한 데이터 관리 및 AI API 통합을 제공합니다.

### 주요 구성

```
src/
├── api/
│   ├── routes/          # API 엔드포인트 라우터
│   │   ├── authRoutes.js       # Google OAuth 인증
│   │   ├── tarotRoutes.js      # 타로 서비스
│   │   ├── chargeRoutes.js     # Toss PG 결제
│   │   └── userRoutes.js       # 사용자 정보 관리
│   └── middlewares/     # 미들웨어
│       ├── authMiddleware.js   # JWT 검증
│       ├── errorHandler.js     # 전역 에러 처리
│       └── validator.js        # 입력 검증
├── domains/             # 비즈니스 로직 (Controller-Service-Repository)
│   ├── admin/           # 관리자 기능
│   │   ├── controller/  # 요청 처리 및 응답
│   │   ├── service/     # 비즈니스 로직
│   │   └── repository/  # 데이터베이스 쿼리
│   ├── charge/          # 결제 및 충전
│   │   ├── tossPayment.js      # Toss PG 결제 처리
│   │   └── iapVerification.js  # IAP 영수증 검증
│   ├── tarot/           # 타로 서비스
│   │   ├── spreadLogic.js      # 스프레드별 해석 로직
│   │   └── historyManager.js   # 이용 내역 관리
│   ├── user/            # 사용자 관리
│   │   ├── authService.js      # Google OAuth 처리
│   │   └── tokenManager.js     # JWT 토큰 관리
│   └── violation/       # 위반 사항 관리
├── AI/                  # AI 통합
│   ├── prompt/          # AI 프롬프트 템플릿
│   ├── command/         # AI 명령 파서
│   └── tarotCardInterpreterWithAIAPI.js  # 타로 해석 AI
├── db/
│   └── mongoose/        # MongoDB 스키마 및 연결
│       ├── User.js      # 사용자 스키마
│       ├── Tarot.js     # 타로 내역 스키마
│       └── Payment.js   # 결제 내역 스키마
├── cache/
│   └── redisClient.js   # Redis 캐싱 클라이언트
├── config/
│   ├── secretKey.js     # 환경 변수 및 시크릿
│   └── tarotConfig.js   # 타로 서비스 설정
└── common/
    ├── errors/          # 커스텀 에러 클래스
    ├── helpers/         # 헬퍼 함수
    └── utils/           # 공통 유틸리티
```

### 핵심 기능

- **계층 아키텍처**: Controller-Service-Repository 패턴으로 명확한 책임 분리
- **인증 시스템**: Passport.js + JWT (Access/Refresh Token) 기반 Google OAuth
- **결제 통합**: Toss PG 웹 결제 + Google IAP 영수증 검증
- **AI 해석**: AI API를 활용한 타로 카드 맞춤형 해석
- **데이터 관리**: Mongoose TTL Index로 자동 데이터 정리
- **캐싱 전략**: Redis를 통한 API 응답 캐싱
- **보안**: Helmet, CSP, Compression 미들웨어 적용
- **검증**: 입력 데이터 검증 및 에러 핸들링

### 기술 스택

`Node.js (Express)` · `MongoDB (Mongoose)` · `Redis` · `AI API` · `Passport.js` · `JWT` · `Toss PG`

### 아키텍처 패턴

**Controller-Service-Repository** 계층 구조

```
Client Request → Router → Middleware → Controller → Service → Repository → Database
                                                  ↓
                                              AI/Cache
```

---

## 📁 English

### Overview

A RESTful API server based on Node.js Express, providing data management with MongoDB and AI API integration.

### Main Structure

```
src/
├── api/
│   ├── routes/          # API endpoint routers
│   │   ├── authRoutes.js       # Google OAuth authentication
│   │   ├── tarotRoutes.js      # Tarot services
│   │   ├── chargeRoutes.js     # Toss PG payment
│   │   └── userRoutes.js       # User information management
│   └── middlewares/     # Middlewares
│       ├── authMiddleware.js   # JWT verification
│       ├── errorHandler.js     # Global error handling
│       └── validator.js        # Input validation
├── domains/             # Business logic (Controller-Service-Repository)
│   ├── admin/           # Admin features
│   │   ├── controller/  # Request handling and response
│   │   ├── service/     # Business logic
│   │   └── repository/  # Database queries
│   ├── charge/          # Payment and charging
│   │   ├── tossPayment.js      # Toss PG payment processing
│   │   └── iapVerification.js  # IAP receipt verification
│   ├── tarot/           # Tarot services
│   │   ├── spreadLogic.js      # Spread-specific interpretation logic
│   │   └── historyManager.js   # Usage history management
│   ├── user/            # User management
│   │   ├── authService.js      # Google OAuth handling
│   │   └── tokenManager.js     # JWT token management
│   └── violation/       # Violation management
├── AI/                  # AI integration
│   ├── prompt/          # AI prompt templates
│   ├── command/         # AI command parser
│   └── tarotCardInterpreterWithAIAPI.js  # Tarot interpretation AI
├── db/
│   └── mongoose/        # MongoDB schemas and connection
│       ├── User.js      # User schema
│       ├── Tarot.js     # Tarot history schema
│       └── Payment.js   # Payment history schema
├── cache/
│   └── redisClient.js   # Redis caching client
├── config/
│   ├── secretKey.js     # Environment variables and secrets
│   └── tarotConfig.js   # Tarot service configuration
└── common/
    ├── errors/          # Custom error classes
    ├── helpers/         # Helper functions
    └── utils/           # Common utilities
```

### Core Features

- **Layered Architecture**: Clear separation of concerns with Controller-Service-Repository pattern
- **Authentication System**: Passport.js + JWT (Access/Refresh Token) based Google OAuth
- **Payment Integration**: Toss PG web payment + Google IAP receipt verification
- **AI Interpretation**: Personalized tarot card interpretation using AI API
- **Data Management**: Automatic data cleanup with Mongoose TTL Index
- **Caching Strategy**: API response caching via Redis
- **Security**: Applied Helmet, CSP, Compression middleware
- **Validation**: Input data validation and error handling

### Tech Stack

`Node.js (Express)` · `MongoDB (Mongoose)` · `Redis` · `AI API` · `Passport.js` · `JWT` · `Toss PG`

### Architecture Pattern

**Controller-Service-Repository** layered structure

```
Client Request → Router → Middleware → Controller → Service → Repository → Database
                                                  ↓
                                              AI/Cache
```

---

## 📁 日本語

### 概要

Node.js Express ベースの RESTful API サーバーで、MongoDB を使用したデータ管理と AI API 統合を提供します。

### 主な構成

```
src/
├── api/
│   ├── routes/          # API エンドポイントルーター
│   │   ├── authRoutes.js       # Google OAuth 認証
│   │   ├── tarotRoutes.js      # タロットサービス
│   │   ├── chargeRoutes.js     # Toss PG 決済
│   │   └── userRoutes.js       # ユーザー情報管理
│   └── middlewares/     # ミドルウェア
│       ├── authMiddleware.js   # JWT 検証
│       ├── errorHandler.js     # グローバルエラー処理
│       └── validator.js        # 入力検証
├── domains/             # ビジネスロジック (Controller-Service-Repository)
│   ├── admin/           # 管理者機能
│   │   ├── controller/  # リクエスト処理とレスポンス
│   │   ├── service/     # ビジネスロジック
│   │   └── repository/  # データベースクエリ
│   ├── charge/          # 決済および充電
│   │   ├── tossPayment.js      # Toss PG 決済処理
│   │   └── iapVerification.js  # IAP レシート検証
│   ├── tarot/           # タロットサービス
│   │   ├── spreadLogic.js      # スプレッド別解釈ロジック
│   │   └── historyManager.js   # 利用履歴管理
│   ├── user/            # ユーザー管理
│   │   ├── authService.js      # Google OAuth 処理
│   │   └── tokenManager.js     # JWT トークン管理
│   └── violation/       # 違反事項管理
├── AI/                  # AI 統合
│   ├── prompt/          # AI プロンプトテンプレート
│   ├── command/         # AI コマンドパーサー
│   └── tarotCardInterpreterWithAIAPI.js  # タロット解釈 AI
├── db/
│   └── mongoose/        # MongoDB スキーマと接続
│       ├── User.js      # ユーザースキーマ
│       ├── Tarot.js     # タロット履歴スキーマ
│       └── Payment.js   # 決済履歴スキーマ
├── cache/
│   └── redisClient.js   # Redis キャッシングクライアント
├── config/
│   ├── secretKey.js     # 環境変数とシークレット
│   └── tarotConfig.js   # タロットサービス設定
└── common/
    ├── errors/          # カスタムエラークラス
    ├── helpers/         # ヘルパー関数
    └── utils/           # 共通ユーティリティ
```

### コア機能

- **レイヤーアーキテクチャ**: Controller-Service-Repository パターンによる明確な責任分離
- **認証システム**: Passport.js + JWT (Access/Refresh Token) ベースの Google OAuth
- **決済統合**: Toss PG Web 決済 + Google IAP レシート検証
- **AI 解釈**: AI API を活用したタロットカードのカスタマイズ解釈
- **データ管理**: Mongoose TTL Index による自動データクリーンアップ
- **キャッシング戦略**: Redis による API レスポンスキャッシング
- **セキュリティ**: Helmet、CSP、Compression ミドルウェア適用
- **検証**: 入力データ検証とエラーハンドリング

### 技術スタック

`Node.js (Express)` · `MongoDB (Mongoose)` · `Redis` · `AI API` · `Passport.js` · `JWT` · `Toss PG`

### アーキテクチャパターン

**Controller-Service-Repository** レイヤー構造

```
Client Request → Router → Middleware → Controller → Service → Repository → Database
                                                  ↓
                                              AI/Cache
```
