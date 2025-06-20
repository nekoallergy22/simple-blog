# Simple Blog

Git-basedなワークフローを使用したシンプルなブログアプリケーション

## 特徴

- **Next.js 14** - React フレームワーク
- **Firebase Firestore** - データベース
- **Tailwind CSS** - スタイリング
- **TypeScript** - 型安全性
- **Git-based Workflow** - Markdownファイルによる記事管理
- **Google Cloud Run** - ホスティング

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local.example` を `.env.local` にコピーして、Firebaseの設定を追加：

```bash
cp .env.local.example .env.local
```

### 3. Firebaseプロジェクトの設定

1. [Firebase Console](https://console.firebase.google.com/)でプロジェクトを作成
2. Firestore Databaseを有効化
3. プロジェクト設定から設定値を取得して`.env.local`に設定

### 4. 開発サーバーの起動

```bash
npm run dev
```

## 記事の作成

1. `posts/` ディレクトリに `.md` ファイルを作成
2. フロントマターでメタデータを設定：

```markdown
---
title: "記事タイトル"
date: "2024-01-01"
category: "tech"
slug: "article-slug"
---

# 記事内容
Markdownで記事を書いてください。
```

3. Git commit & push で自動デプロイ

## デプロイ

### GitHub Actions

リポジトリのSecretsに以下を設定：

- `GCP_PROJECT_ID`: Google Cloud Project ID
- `GCP_SA_KEY`: Service Account Key (JSON)
- `FIREBASE_PROJECT_ID`: Firebase Project ID
- `FIREBASE_CLIENT_EMAIL`: Firebase Service Account Email
- `FIREBASE_PRIVATE_KEY`: Firebase Private Key
- `NEXT_PUBLIC_FIREBASE_*`: Firebase Client Configuration

### ローカルでのMarkdown同期

```bash
npm run sync-md
```

## スクリプト

- `npm run dev`: 開発サーバーの起動
- `npm run build`: プロダクションビルド
- `npm run start`: プロダクションサーバーの起動
- `npm run lint`: ESLintの実行
- `npm run type-check`: TypeScriptの型チェック
- `npm run sync-md`: MarkdownファイルをFirestoreに同期

## ファイル構造

```
simple-blog/
├── posts/              # Markdownファイル
├── src/
│   ├── app/           # Next.js App Router
│   ├── components/    # Reactコンポーネント
│   ├── lib/          # ユーティリティ関数
│   └── types/        # TypeScript型定義
├── scripts/
│   └── sync-md.js    # Markdown同期スクリプト
└── .github/
    └── workflows/    # GitHub Actions
```

## ライセンス

MIT