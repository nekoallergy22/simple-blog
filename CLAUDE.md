# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Tech-Master - 技術学習プラットフォーム 開発戦略・アーキテクチャ

## 基本コンセプト & アーキテクチャ

### システム構成
- **フロントエンド**: Next.js 14.2.5 (App Router) + TypeScript + Tailwind CSS
- **バックエンド**: Firebase (Firestore, Storage) + Cloud Run API
- **ホスティング**: Google Cloud Run (コンテナ化)
- **デプロイ**: GitHub Actions CI/CD
- **記事管理**: セクション別ローカルMarkdownファイル → Firestore同期
- **ルーティング**: セクション別ルート (/ai, /python, /datascience, /tensorflow)

### ハイブリッドデータ戦略
- **Firebase優先**: 本番環境ではFirestoreから記事取得
- **Markdownフォールバック**: Firebase未設定時はローカルMarkdownから取得
- **自動同期**: `scripts/sync-md.js`でMarkdown→Firestore同期

## 技術スタック（実装済み）

### コア技術
- **React**: 18.3.1
- **Next.js**: 14.2.5 (App Router, standalone output設定済み)
- **TypeScript**: 5.5.4 
- **Tailwind CSS**: 3.4.7 + @tailwindcss/typography
- **Firebase**: 10.12.2 (client) + 12.1.1 (admin)

### Markdownレンダリング
- **react-markdown**: 9.0.1 + remark-gfm
- **react-syntax-highlighter**: 15.5.0（コードハイライト）
- **gray-matter**: 4.0.3（frontmatter解析）

### 開発ツール
- **ESLint**: 8.57.0 + @typescript-eslint
- **Prettier**: 3.3.3
- **Firebase CLI**: 14.9.0

## 重要なコマンド

### 日常開発
```bash
# 開発サーバー起動（ポート3000）
npm run dev

# プロダクションビルド
npm run build

# 型チェック実行
npm run type-check

# ESLint実行
npm run lint

# Markdownファイル→Firestore同期 (Cloud Run API経由)
npm run sync-md

# レガシー同期 (直接Firebase Admin使用)
npm run sync-md-legacy
```

### テスト・検証
- **テストフレームワーク**: 現在設定なし（必要に応じて設定を確認）
- **型チェック**: `npm run type-check`で実行
- **Lint**: `npm run lint`で実行

### デプロイ・運用
```bash
# GitHub Actionsによる自動デプロイ（メイン使用方法）
./scripts/deploy-github.sh "コミットメッセージ"

# Markdownローカル同期のみ
npm run sync-md

# Firebase Functions単体デプロイ
./scripts/deploy-functions.sh

# Cloud Run手動デプロイ
./scripts/deploy-cloudrun.sh

# API サービス単体デプロイ
./scripts/deploy-api.sh
```

### セットアップ・初期設定
```bash
# 初回セットアップ（.env.localから自動読み取り）
./scripts/setup-gcp.sh
./scripts/fix-service-account-permissions.sh
./scripts/setup-artifact-registry.sh
./scripts/setup-firebase-files.sh

# GitHub Secrets設定
./scripts/setup-secrets-from-env.sh
```

## プロジェクト構造

### アプリケーション構造（src/）
```
src/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # ルートレイアウト（Tech-Master全体）
│   ├── page.tsx                # ホームページ（全セクション表示）
│   ├── ai/                     # AI学習セクション
│   │   ├── page.tsx           # AI学習コース一覧
│   │   └── posts/[slug]/      # AI記事ページ
│   ├── python/                 # Python学習セクション
│   │   └── page.tsx           # Python学習コース（準備中）
│   ├── datascience/           # データサイエンス学習セクション
│   │   └── page.tsx           # データサイエンス学習コース（準備中）
│   ├── tensorflow/            # TensorFlow学習セクション
│   │   └── page.tsx           # TensorFlow学習コース（準備中）
│   └── globals.css            # グローバルスタイル
├── components/
│   ├── MarkdownRenderer.tsx   # Markdown描画コンポーネント
│   └── PostCard.tsx          # 記事カード（セクション対応）
├── lib/
│   ├── posts.ts              # 記事取得ロジック（セクション対応）
│   ├── firebase.ts           # Firebase client設定
│   ├── firebase-admin.ts     # Firebase admin設定
│   └── markdown.ts           # Markdownファイル読み込み
└── types/
    └── index.ts             # TypeScript型定義（Section型追加）
```

### 記事管理
- **AIセクション**: 24記事収録（基礎→応用→実践）
- **ファイル命名**: `XX-slug-format.md`（番号順）
- **セクション構造**: 各セクション専用のルート（/ai/posts/[slug]）
- **既存記事**: `ai-course`カテゴリはAIセクションに自動マッピング

### Firebase設定
- **Firestore Collections**: `posts`（記事データ）
- **Functions**: Node.js 18, TypeScript設定済み  
- **Security Rules**: firestore.rules設定済み

### GitHub Actions
- **トリガー**: mainブランチpush + 手動実行
- **処理流**: Markdown同期 → ビルド → Dockerイメージ作成（Artifact Registry） → Cloud Runデプロイ
- **必要Secrets**: 12個（Firebase, GCP, GitHub設定）
- **Dockerイメージ保存**: Artifact Registry（Container Registry後継）

## 記事管理フロー

### 記事フォーマット（frontmatter）
```markdown
---
title: "記事タイトル"
date: "2024-01-01" 
category: "ai-course"        # 既存はそのまま維持
section: "ai"               # 新規：セクション指定（ai, python, datascience, tensorflow）
slug: "unique-slug"
difficulty: "beginner"      # オプション
number: 1                   # オプション（順序）
---

# 記事内容
Markdownで記事本文を記述
```

### 記事追加手順
1. `posts/XX-title.md`作成
2. frontmatter設定
3. `git add . && git commit -m "新記事追加"`
4. `git push origin main`（自動デプロイ）

## 開発時の注意点

### Firebase連携
- **環境変数**: `.env.local`または環境に設定必要
- **フォールバック**: Firebase未設定時は自動的にMarkdownファイルを使用
- **同期**: `npm run sync-md`でローカル→Firestore同期

### Next.js設定
- **出力形式**: standalone（Dockerコンテナ用）
- **ポート**: 開発3000、本番8080
- **画像**: WebP/AVIF最適化有効、TTL 60秒
- **セキュリティヘッダー**: X-Frame-Options, CSP, XSS保護設定
- **Font最適化**: 無効化（GitHub Actions対応）
- **Webpack**: サーバーサイドでfs fallback設定

### Docker・Cloud Run
- **Base Image**: Node.js 18 Alpine
- **メモリ**: 2Gi
- **CPU**: 1 vCPU
- **スケール**: 0-5インスタンス

## トラブルシューティング

### よくある問題
1. **Firebase接続エラー**: 環境変数確認、Markdownフォールバック確認
2. **ビルドエラー**: `npm run type-check`で型エラー確認
3. **デプロイエラー**: GitHub Actions logs確認、Artifact Registry権限確認
4. **記事表示されない**: `npm run sync-md`実行、Firestore接続確認
5. **Docker push失敗**: `./scripts/fix-service-account-permissions.sh`実行
6. **型エラー**: Post interface変更時はsrc/types/index.ts更新必要
7. **セクション表示問題**: section fieldがai以外でも正しく設定されているか確認

### デバッグコマンド
```bash
# Firebase接続テスト（ログ確認）
npm run dev  # コンソールでFirebase接続ログ確認

# Markdown同期テスト
npm run sync-md  # 同期ログ確認

# ビルドテスト
npm run build  # ビルドエラー確認

# Artifact Registry権限確認
./scripts/fix-service-account-permissions.sh
./scripts/setup-artifact-registry.sh
```

## 重要な実装パターン

### データ取得の優先順位
1. **Firebase Firestore**: 本番環境での優先データソース
2. **Markdown Fallback**: Firebase接続失敗時の自動フォールバック
3. **Error Handling**: try-catch ブロックで適切なエラーログ出力

### 記事データの流れ
```
Markdown Files → sync-md.js → Firestore → Posts API → Component Rendering
     ↓ (fallback)                                       ↑
Local Markdown ←──────────────────────────────────────┘
```

### セクション管理
- **Section Type**: ai, python, datascience, tensorflow
- **Legacy Category**: ai-course → ai section自動マッピング
- **Sorting**: number field優先、次にdate降順

## 現在の状況（2025-06-29）

### 実装完了
- ✅ Next.js 14 + App Router完全設定（セクション別ルーティング）
- ✅ Firebase Firestore統合（セクション対応）
- ✅ Markdown処理（react-markdown + syntax highlighting）
- ✅ レスポンシブUI（Tailwind CSS）
- ✅ Tech-Master統合プラットフォーム
- ✅ AIセクション：24記事AI学習コース（/ai）
- ✅ Python/DataScience/TensorFlowセクション（準備中）
- ✅ GitHub Actions CI/CD
- ✅ Cloud Run Dockerデプロイ
- ✅ 自動化スクリプト一式

### Git状況
- **ブランチ**: main（アクティブ開発）
- **デプロイ**: GitHub Actions自動実行
- **最新変更**: Simple Blog → Tech-Master変更、セクション別ルーティング実装

## 環境変数の設定

### 必須環境変数（.env.local）
```bash
# Firebase Web Configuration (Public)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key

# Firebase Admin Configuration (Private)  
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=service-account-email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# Project Configuration
GCP_PROJECT_ID=your-project-id
GITHUB_REPO=username/repository-name
CUSTOM_DOMAIN=yourdomain.com
SERVICE_NAME=tech-master
```

### 環境変数の確認
```bash
# Firebase接続状況確認
npm run dev  # コンソールでFirebase初期化ログ確認

# 環境変数が正しく読み込まれているか確認
echo $NEXT_PUBLIC_FIREBASE_PROJECT_ID
```