# 🚀 Simple Blog

**GitHub Actions 完全自動デプロイ対応** - AIコース記事24本収録のシンプルブログアプリケーション

[![Deploy Status](https://github.com/nekoallergy22/simple-blog/workflows/Deploy%20to%20Cloud%20Run/badge.svg)](https://github.com/nekoallergy22/simple-blog/actions)

## ✨ 特徴

- 🚀 **GitHub Actions 完全自動デプロイ** - git push だけで本番反映
- 📝 **Git-based Workflow** - Markdownファイルで記事管理
- 🔥 **Firebase Integration** - Firestore + Cloud Functions
- ☁️ **Cloud Run Hosting** - スケーラブルなサーバーレス環境
- ⚛️ **Modern Stack** - Next.js 14 + TypeScript + Tailwind CSS
- 🛠️ **CLI Automation** - 設定から運用まで全自動化

## 🚀 クイックスタート

### 自動デプロイセットアップ（推奨）

```bash
# 1. プロジェクトクローン
git clone <your-repo-url>
cd simple-blog

# 2. 依存関係インストール
npm install

# 3. GCP・Firebase自動設定
./scripts/setup-gcp.sh YOUR_PROJECT_ID
./scripts/setup-firebase-files.sh YOUR_PROJECT_ID

# 4. Firebase Console でWebアプリ作成
# → .env.deployment ファイル編集

# 5. GitHub Secrets一括設定
./scripts/setup-secrets-from-env.sh

# 6. 自動デプロイ開始
./scripts/deploy-github.sh "Initial deployment"
```

### ローカル開発

```bash
# 開発サーバー起動
npm run dev
```

詳細な手順は [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) を参照してください。

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

## 📋 現在の状況（2025-06-27）

- ✅ **Node.js**: 20.19.3対応
- ✅ **Firebase CLI**: 14.9.0対応  
- ✅ **GitHub Actions**: 完全自動デプロイ設定済み
- ✅ **GitHub Secrets**: 12個設定完了
- ✅ **記事数**: 24記事（AI学習コース）
- ⏳ **デプロイ状況**: [GitHub Actions で確認](https://github.com/nekoallergy22/simple-blog/actions)

## 🔄 日常の使い方

### 記事投稿・更新

```bash
# 1. 記事作成・編集
echo '---
title: "新しい記事"
date: "2024-01-01"
category: "tech"
slug: "new-article"
---

# 内容
記事内容をここに書く' > posts/new-article.md

# 2. 自動デプロイ実行
./scripts/deploy-github.sh "新記事追加"

# または手動で
git add . && git commit -m "新記事追加" && git push origin main
```

### Markdownローカル同期

```bash
npm run sync-md
```

## 🛠️ 開発・運用コマンド

### 開発
- `npm run dev`: 開発サーバー起動
- `npm run build`: プロダクションビルド
- `npm run start`: プロダクションサーバー起動
- `npm run lint`: ESLint実行
- `npm run type-check`: TypeScript型チェック

### 運用・デプロイ
- `npm run sync-md`: MarkdownをFirestoreに同期
- `./scripts/deploy-github.sh "メッセージ"`: 自動デプロイ実行
- `./scripts/setup-secrets-from-env.sh`: GitHub Secrets一括設定

### セットアップ（初回のみ）
- `./scripts/setup-gcp.sh PROJECT_ID`: GCP環境構築
- `./scripts/setup-firebase-files.sh PROJECT_ID`: Firebase設定
- `./scripts/deploy-functions.sh`: Firebase Functions デプロイ

## 📁 プロジェクト構成

```
simple-blog/
├── .github/workflows/       # GitHub Actions（自動デプロイ）
├── posts/                  # Markdown記事（24記事収録）
├── scripts/                # 自動化スクリプト
│   ├── setup-gcp.sh       # GCP環境構築
│   ├── setup-firebase-files.sh # Firebase設定
│   ├── deploy-github.sh    # 自動デプロイ実行
│   ├── setup-secrets-from-env.sh # GitHub Secrets設定
│   └── sync-md.js         # Markdown同期
├── src/                   # Next.js アプリケーション
│   ├── app/              # App Router
│   ├── components/       # Reactコンポーネント
│   ├── lib/             # ユーティリティ
│   └── types/           # TypeScript型定義
├── functions/            # Firebase Functions
├── firebase.json        # Firebase設定
├── Dockerfile          # Cloud Run用
└── .env.deployment     # 環境変数（Git管理外）
```

## 🔗 関連リンク

- **デプロイ状況**: [GitHub Actions](https://github.com/nekoallergy22/simple-blog/actions)
- **本番サイト**: [Cloud Run](https://console.cloud.google.com/run?project=pid-my-portfolio-project)
- **Firebase Console**: [Firestore](https://console.firebase.google.com/project/pid-my-portfolio-project/firestore)
- **詳細手順**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

## ライセンス

MIT