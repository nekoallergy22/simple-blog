# シンプルBlogアプリ - 開発戦略・アーキテクチャ

## 開発戦略

### 基本コンセプト
- **フロントエンド**: Google Cloud Run でホスティング
- **記事管理**: ローカルでmdファイルを作成・編集・削除
- **デプロイ方式**: git push で記事が自動反映
- **バックエンド**: Firebase を活用
- **方針**: シンプルでミニマムな機能実現

## 技術スタック

### フロントエンド
- **React**: 18.3.1
- **Next.js**: 14.2.5 (App Router)
- **TypeScript**: 5.5.4
- **Tailwind CSS**: 3.4.7
- **react-markdown**: 9.0.1
- **react-syntax-highlighter**: 15.5.0

### バックエンド
- **Firebase**: メインバックエンド
  - Firestore Database
  - Firebase Authentication
  - Firebase Storage
  - Firebase Functions

### 開発ツール
- **ESLint**: 8.57.0
- **Prettier**: 3.3.3
- **TypeScript ESLint**: 7.17.0

## アーキテクチャ

### システム構成
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cloud Run     │    │    Firebase     │    │      Git        │
│ (Next.js App)   │────│   (Backend)     │    │  (md files)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                        ┌─────────────────┐
                        │   GitHub        │
                        │   Actions       │
                        └─────────────────┘
```

### デプロイフロー
1. ローカルでmdファイル作成・編集
2. Git commit & push
3. GitHub Actions トリガー
4. mdファイルをFirestoreに同期
5. Cloud Run 自動デプロイ

## Firebase設定

### Firestore Collections
- **posts**: 記事データ
  - title, content, slug, createdAt, updatedAt
- **categories**: カテゴリデータ (オプション)

### Firebase Functions
- mdファイル同期処理
- 記事メタデータ生成
- 検索インデックス更新

## Cloud Run 設定

### サービス仕様
- **CPU**: 1 vCPU
- **Memory**: 2Gi
- **Min instances**: 0
- **Max instances**: 5
- **Port**: 8080

### 環境変数
```
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=your-service-account-email
FIREBASE_PRIVATE_KEY=your-private-key
```

## GitHub Actions CI/CD

### ワークフロー
```yaml
name: Deploy to Cloud Run
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Sync markdown to Firebase
        run: npm run sync-md
      - name: Deploy to Cloud Run
        run: gcloud run deploy
```

## 記事管理フロー

### 記事作成
1. `posts/` ディレクトリに `.md` ファイル作成
2. フロントマター形式でメタデータ設定
3. git commit & push
4. 自動でFirestoreに同期・デプロイ

### 記事フォーマット
```markdown
---
title: "記事タイトル"
date: "2024-01-01"
category: "ai-course"
slug: "article-slug"
---

# 記事内容
本文をMarkdownで記述
```

### サンプル記事について
- AIについて初歩から教えるコース記事（10記事）
- カテゴリ：`ai-course`（AIコース）
- 順序立てた学習コンテンツとして構成

## 開発コマンド

### ローカル開発
```bash
# 開発サーバー起動
npm run dev

# Firebaseエミュレータ起動
npm run firebase:emulators

# 型チェック
npm run type-check
```

### デプロイ
```bash
# mdファイル同期
npm run sync-md

# Cloud Run デプロイ
npm run deploy
```