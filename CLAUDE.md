# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Tech-Master - 技術学習プラットフォーム 開発戦略・アーキテクチャ

## 基本コンセプト & アーキテクチャ

### システム構成
- **フロントエンド**: Next.js 14.2.5 (App Router) + TypeScript + Tailwind CSS
- **データソース**: Static JSON (ビルド時生成) + Markdown Fallback
- **ホスティング**: Google Cloud Run (コンテナ化)
- **デプロイ**: GitHub Actions CI/CD
- **記事管理**: セクション別ローカルMarkdownファイル → Static JSON生成
- **ルーティング**: セクション別ルート (/ai, /python, /datascience, /tensorflow)

### Static JSON アーキテクチャ
- **Primary**: ビルド時生成Static JSONから記事取得
- **Fallback**: JSON取得失敗時はMarkdownファイルから直接取得
- **Generation**: `scripts/generate-static-json.js`でMarkdown→JSON変換

## 技術スタック（実装済み）

### コア技術
- **React**: 18.3.1
- **Next.js**: 14.2.5 (App Router, standalone output設定済み)
- **TypeScript**: 5.5.4 
- **Tailwind CSS**: 3.4.7 + @tailwindcss/typography

### Markdownレンダリング
- **react-markdown**: 9.0.1 + remark-gfm
- **react-syntax-highlighter**: 15.5.0（コードハイライト）
- **gray-matter**: 4.0.3（frontmatter解析）

### 開発ツール
- **ESLint**: 8.57.0 + @typescript-eslint
- **Prettier**: 3.3.3

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

# Static JSON生成（Markdownファイル→JSON変換）
npm run generate-json
```

### テスト・検証
- **テストフレームワーク**: 現在設定なし（必要に応じて設定を確認）
- **型チェック**: `npm run type-check`で実行
- **Lint**: `npm run lint`で実行

### デプロイ・運用
```bash
# GitHub Actionsによる自動デプロイ（メイン使用方法）
git add .
git commit -m "コミットメッセージ"
git push origin main

# ローカルでStatic JSON生成テスト
npm run generate-json

# ローカルビルドテスト
npm run build
```

### セットアップ・初期設定
```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# プロダクションビルドテスト
npm run generate-json && npm run build
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

### Static JSON設定
- **JSON生成**: `scripts/generate-static-json.js`でビルド時生成
- **出力先**: `public/data/` ディレクトリ
- **ファイル構成**: posts.json（全記事）、sections/*.json（セクション別）、metadata.json（メタデータ）

### GitHub Actions
- **トリガー**: mainブランチpush + 手動実行
- **処理流**: Static JSON生成 → Next.jsビルド → Dockerイメージ作成（Artifact Registry） → Cloud Runデプロイ
- **必要Secrets**: GCP認証用のみ（Firebase関連削除済み）
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
4. `git push origin main`（GitHub Actions自動デプロイ）

## 開発時の注意点

### データ連携
- **環境変数**: 不要（Firebase削除済み）
- **プライマリ**: Static JSON（ビルド時生成）
- **フォールバック**: JSON取得失敗時は自動的にMarkdownファイルを使用
- **生成**: `npm run generate-json`でMarkdown→JSON変換

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
1. **ビルドエラー**: `npm run type-check`で型エラー確認
2. **JSON生成エラー**: `npm run generate-json`実行、Markdownフォーマット確認
3. **デプロイエラー**: GitHub Actions logs確認、Artifact Registry権限確認
4. **記事表示されない**: `npm run generate-json`実行、public/data/ファイル確認
5. **型エラー**: Post interface変更時はsrc/types/index.ts更新必要
6. **セクション表示問題**: frontmatterのsection fieldが正しく設定されているか確認
7. **ビルドハング問題**: 下記の「ビルドハング対策」を参照

### ビルドハング対策（重要）

**原因と対策**：2025-07-01に発生した問題の解決策

#### 主要原因
1. **setInterval による無限プロセス**：`src/lib/static-posts.ts`内のsetIntervalがビルド時にNode.jsプロセスを生かし続ける
2. **循環参照**：エラーハンドリング内で同じ関数を再帰呼び出しする
3. **Webpackキャッシュ問題**：dependency snapshotting で無限ループ

#### 必須チェック項目
```bash
# 1. setIntervalの確認（絶対にビルド時に実行してはいけない）
grep -r "setInterval" src/lib/static-posts.ts

# 2. 循環参照チェック
grep -A10 -B5 "getPostsFromStatic" src/lib/static-posts.ts

# 3. Webpackキャッシュ設定確認
grep -A10 "webpack:" next.config.js
```

#### 対策済み設定
- **setInterval削除**: `src/lib/static-posts.ts:199-204` をコメントアウト
- **循環参照解消**: フォールバック処理で`return []`に変更
- **Webpackキャッシュ無効化**: `next.config.js`で`config.cache = false`設定

#### ビルドハング時の対処法
```bash
# 1. プロセス強制終了
pkill -f "next build"
pkill -f "webpack"

# 2. キャッシュクリア
rm -rf .next node_modules/.cache

# 3. 上記設定を確認後、再ビルド
npm run build
```

#### 予防策
- **Timer類は絶対にサーバーサイドで使用しない**
- **エラーハンドリングで同じ関数を再帰呼び出ししない**
- **ビルド時はWebpackキャッシュを無効化する**

### デバッグコマンド
```bash
# JSON生成テスト
npm run generate-json  # JSON生成ログ確認

# ビルドテスト
npm run build  # ビルドエラー確認

# 型チェック
npm run type-check  # TypeScriptエラー確認

# Lint確認
npm run lint  # ESLintエラー確認

# 開発サーバーテスト
npm run dev  # ローカル動作確認
```

## 重要な実装パターン

### データ取得の優先順位
1. **Static JSON**: ビルド時生成されたJSON（プライマリ）
2. **Markdown Fallback**: JSON取得失敗時の自動フォールバック
3. **Error Handling**: try-catch ブロックで適切なエラーログ出力

### 記事データの流れ
```
Markdown Files → generate-static-json.js → Static JSON → Component Rendering
     ↓ (fallback)                                           ↑
Local Markdown ←─────────────────────────────────────────┘
```

### セクション管理
- **Section Type**: ai, python, datascience, tensorflow
- **Legacy Category**: ai-course → ai section自動マッピング
- **Sorting**: number field優先、次にdate降順

## 現在の状況（2025-06-29）

### 実装完了
- ✅ Next.js 14 + App Router完全設定（セクション別ルーティング）
- ✅ Static JSON アーキテクチャ（Firebase削除済み）
- ✅ Markdown処理（react-markdown + syntax highlighting）
- ✅ レスポンシブUI（Tailwind CSS）
- ✅ Tech-Master統合プラットフォーム
- ✅ AIセクション：6記事AI学習コース（/ai）
- ✅ Python/DataScience/TensorFlowセクション（準備中）
- ✅ GitHub Actions CI/CD（簡素化済み）
- ✅ Cloud Run Dockerデプロイ

### Git状況
- **ブランチ**: main（アクティブ開発）
- **デプロイ**: GitHub Actions自動実行
- **最新変更**: Firebase削除、Static JSONアーキテクチャ移行完了

## 環境変数の設定

### オプション環境変数（.env.local）
```bash
# Project Configuration (デプロイ時のみ必要)
GCP_PROJECT_ID=your-project-id
GITHUB_REPO=username/repository-name
CUSTOM_DOMAIN=yourdomain.com
SERVICE_NAME=tech-master
```

### 環境変数の確認
```bash
# ローカル開発（環境変数不要）
npm run dev  # すぐに起動可能

# 環境変数確認（デプロイ時のみ）
cat .env.local
```