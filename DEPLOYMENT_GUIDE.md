# Simple Blog デプロイガイド

## 概要
Next.js + Firebase + Cloud Run を使用したシンプルブログアプリのデプロイ手順を記載します。

## 前提条件
- macOS環境
- Google Cloud アカウント
- GitHub アカウント
- 基本的なターミナル操作の知識

## 1. 環境準備

### 1.1 Node.js アップグレード（Node.js 20が必要）

```bash
# Homebrew で Node.js 20 をインストール
brew install node@20

# PATH を更新
export PATH="/usr/local/Cellar/node@20/20.19.3/bin:$PATH"

# バージョン確認
node --version  # v20.19.3 であることを確認
```

### 1.2 Firebase CLI インストール

```bash
# プロジェクト内にローカルインストール
npm install firebase-tools

# バージョン確認
npx firebase --version  # 14.9.0 であることを確認
```

## 2. GCP プロジェクト設定

### 2.1 GCP 初期設定

```bash
# GCP 設定スクリプト実行
./scripts/setup-gcp.sh YOUR_PROJECT_ID

# 例: ./scripts/setup-gcp.sh pid-my-portfolio-project
```

このスクリプトが実行する内容：
- Google Cloud ログイン
- プロジェクト設定
- 必要なAPI有効化（Cloud Run, Cloud Build, Container Registry等）
- Artifact Registry リポジトリ作成
- サービスアカウント作成
- 権限設定
- サービスアカウントキー作成（`service-account-key.json`）

### 2.2 Firebase 設定

```bash
# Firebase API 有効化
./scripts/setup-firebase-existing.sh YOUR_PROJECT_ID
```

**手動操作が必要**：
1. [Firebase Console](https://console.firebase.google.com/) にアクセス
2. 「プロジェクトを追加」→「既存のGoogle Cloudプロジェクトを選択」
3. 作成したプロジェクトIDを選択
4. Firebase を追加

### 2.3 Firebase 設定ファイル作成

```bash
# Firebase 設定ファイル作成
./scripts/setup-firebase-files.sh YOUR_PROJECT_ID

# Firebase プロジェクト設定
export PATH="/usr/local/Cellar/node@20/20.19.3/bin:$PATH"
npx firebase use YOUR_PROJECT_ID
```

## 3. Firebase Functions デプロイ

### 3.1 Functions デプロイ

```bash
# Firebase Functions デプロイ
export PATH="/usr/local/Cellar/node@20/20.19.3/bin:$PATH"
./scripts/deploy-functions.sh
```

このスクリプトが実行する内容：
- Functions ソースコード作成（TypeScript）
- 依存関係インストール
- TypeScript コンパイル
- Firebase Functions デプロイ
- Firestore ルールとインデックス デプロイ

**注意**：Firestore インデックスでエラーが出た場合、不要なインデックスを削除します：

```bash
# firestore.indexes.json を編集（単一フィールドインデックスを削除）
# 再デプロイ
npx firebase deploy --only firestore:rules,firestore:indexes
```

### 3.2 作成される Functions

デプロイ完了後、以下の関数が作成されます：
- `syncMarkdownFiles`: Markdown ファイルを Firestore に同期
- `healthCheck`: ヘルスチェック用

Functions URL例：
- https://asia-northeast1-YOUR_PROJECT_ID.cloudfunctions.net/syncMarkdownFiles
- https://asia-northeast1-YOUR_PROJECT_ID.cloudfunctions.net/healthCheck

## 4. 初回データ同期

### 4.1 環境変数設定とMarkdown同期

```bash
# 環境変数設定（サービスアカウント情報）
export FIREBASE_PROJECT_ID="YOUR_PROJECT_ID"
export FIREBASE_CLIENT_EMAIL=$(cat service-account-key.json | grep -o '"client_email": "[^"]*"' | cut -d'"' -f4)
export FIREBASE_PRIVATE_KEY=$(cat service-account-key.json | grep -o '"private_key": "[^"]*"' | cut -d'"' -f4)

# Markdown ファイル同期実行
npm run sync-md
```

成功すると、posts/ ディレクトリ内の全 Markdown ファイルが Firestore の posts コレクションに同期されます。

### 4.2 同期結果確認

```bash
# Firebase Console でデータ確認
echo "Firebase Console: https://console.firebase.google.com/project/YOUR_PROJECT_ID/firestore"
```

## 5. GitHub Secrets 設定（CI/CD用）

### 5.1 GitHub Secrets 自動設定

```bash
# GitHub Secrets 設定スクリプト実行
./scripts/github-secrets-setup.sh YOUR_PROJECT_ID YOUR_GITHUB_USERNAME/REPO_NAME

# 例：
./scripts/github-secrets-setup.sh pid-my-portfolio-project username/simple-blog
```

### 5.2 手動で追加が必要なSecrets

Firebase Console からウェブアプリ設定を取得して、以下を手動で追加：

```bash
gh secret set NEXT_PUBLIC_FIREBASE_API_KEY --body 'YOUR_API_KEY' --repo 'YOUR_REPO'
gh secret set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN --body 'YOUR_PROJECT_ID.firebaseapp.com' --repo 'YOUR_REPO'
gh secret set NEXT_PUBLIC_FIREBASE_PROJECT_ID --body 'YOUR_PROJECT_ID' --repo 'YOUR_REPO'
gh secret set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET --body 'YOUR_PROJECT_ID.appspot.com' --repo 'YOUR_REPO'
gh secret set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --body 'YOUR_SENDER_ID' --repo 'YOUR_REPO'
gh secret set NEXT_PUBLIC_FIREBASE_APP_ID --body 'YOUR_APP_ID' --repo 'YOUR_REPO'
```

## 6. GitHub Actions 自動デプロイ設定（推奨）

### 6.1 GitHub Secrets 設定

```bash
# 基本設定（GCP、Firebase Admin）
./scripts/setup-github-complete.sh YOUR_PROJECT_ID YOUR_USERNAME/REPO_NAME

# 例：
./scripts/setup-github-complete.sh pid-my-portfolio-project username/simple-blog
```

### 6.2 Firebase Web アプリ設定

```bash
# Firebase Console での設定手順を表示
./scripts/firebase-web-config.sh YOUR_PROJECT_ID YOUR_USERNAME/REPO_NAME
```

**手動操作が必要**：
1. [Firebase Console](https://console.firebase.google.com/project/YOUR_PROJECT_ID/settings/general) を開く
2. 「ウェブアプリを追加」をクリック
3. アプリ名: `simple-blog-web` で作成
4. 表示された設定情報で以下を実行：

```bash
gh secret set NEXT_PUBLIC_FIREBASE_API_KEY --body 'YOUR_API_KEY' --repo 'YOUR_REPO'
gh secret set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN --body 'YOUR_PROJECT_ID.firebaseapp.com' --repo 'YOUR_REPO'
gh secret set NEXT_PUBLIC_FIREBASE_PROJECT_ID --body 'YOUR_PROJECT_ID' --repo 'YOUR_REPO'
gh secret set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET --body 'YOUR_PROJECT_ID.appspot.com' --repo 'YOUR_REPO'
gh secret set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --body 'YOUR_SENDER_ID' --repo 'YOUR_REPO'
gh secret set NEXT_PUBLIC_FIREBASE_APP_ID --body 'YOUR_APP_ID' --repo 'YOUR_REPO'
```

### 6.3 自動デプロイ実行

```bash
# コード変更後、自動デプロイ実行
./scripts/deploy-github.sh "新機能追加"

# または手動で
git add .
git commit -m "Deploy: $(date)"
git push origin main
```

### 6.4 GitHub Actions ワークフロー

main ブランチに push すると自動実行される処理：

1. **sync-markdown** job:
   - Node.js 20 セットアップ
   - 依存関係インストール
   - Markdown ファイルを Firestore に同期

2. **deploy** job:
   - Node.js 20 セットアップ
   - Next.js アプリケーションビルド
   - Docker イメージ作成・プッシュ
   - Cloud Run デプロイ

### 6.5 デプロイ状況確認

```bash
# GitHub Actions ログ確認
open "https://github.com/YOUR_USERNAME/REPO_NAME/actions"

# Cloud Run サービス確認
gcloud run services list --project=YOUR_PROJECT_ID
```

## 7. 手動 Cloud Run デプロイ（オプション）

### 7.1 手動デプロイ

```bash
# Cloud Run デプロイ
export PATH="/usr/local/Cellar/node@20/20.19.3/bin:$PATH"
./scripts/deploy-cloudrun.sh YOUR_PROJECT_ID
```

## 7. 動作確認

### 7.1 Functions 動作確認

```bash
# 同期テストスクリプト実行
./scripts/test-sync.sh
```

### 7.2 ローカル開発サーバー

```bash
# 環境変数設定後、開発サーバー起動
export PATH="/usr/local/Cellar/node@20/20.19.3/bin:$PATH"
npm run dev
```

http://localhost:3000 でアプリケーションが確認できます。

### 7.3 本番サイト確認

Cloud Run デプロイ完了後、表示されるURLでアプリケーションが確認できます。

## 8. トラブルシューティング

### 8.1 Firebase CLI 認証エラー

```bash
# Firebase 再ログイン（対話モード必要）
npx firebase logout
npx firebase login

# プロジェクト一覧確認
npx firebase projects:list
```

### 8.2 Node.js バージョン問題

```bash
# 現在のバージョン確認
node --version

# PATH 確認・更新
export PATH="/usr/local/Cellar/node@20/20.19.3/bin:$PATH"
```

### 8.3 Firebase Functions タイムアウト

Functions の処理が重い場合、タイムアウト設定を調整：

```typescript
// functions/src/index.ts
export const syncMarkdownFiles = functions
  .region('asia-northeast1')
  .runWith({ timeoutSeconds: 540 }) // 9分に延長
  .https.onRequest(async (req, res) => {
    // ...
  });
```

## 9. プロジェクト構成

```
simple-blog/
├── .github/workflows/
│   └── deploy.yml                 # GitHub Actions ワークフロー
├── scripts/
│   ├── setup-gcp.sh              # GCP 初期設定
│   ├── setup-firebase-existing.sh # Firebase API 有効化
│   ├── setup-firebase-files.sh   # Firebase 設定ファイル作成
│   ├── deploy-functions.sh       # Functions デプロイ
│   ├── deploy-cloudrun.sh        # Cloud Run デプロイ
│   ├── test-sync.sh             # 同期テスト
│   ├── github-secrets-setup.sh  # GitHub Secrets 設定
│   └── sync-md.js               # Markdown 同期スクリプト
├── functions/                    # Firebase Functions
├── posts/                       # Markdown 記事ファイル（24記事）
├── src/                         # Next.js アプリケーション
├── firebase.json               # Firebase 設定
├── firestore.rules            # Firestore セキュリティルール
├── firestore.indexes.json     # Firestore インデックス
├── .firebaserc               # Firebase プロジェクト設定
├── Dockerfile               # Cloud Run 用 Docker 設定
└── service-account-key.json # GCP サービスアカウントキー（秘匿）
```

## 10. 重要なファイル

### 10.1 環境変数（.env.example）

```env
# Firebase 設定
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=service-account@your-project-id.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----

# Next.js Firebase 設定
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project-id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project-id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

### 10.2 記事フォーマット（posts/*.md）

```markdown
---
title: "記事タイトル"
date: "2024-01-01"
category: "ai-course"
slug: "article-slug"
---

# 記事内容
Markdown で記述された本文内容
```

## 11. セキュリティ注意事項

- `service-account-key.json` は絶対に Git にコミットしない
- `.gitignore` に `service-account-key.json` が含まれていることを確認
- GitHub Secrets は慎重に管理する
- Firestore セキュリティルールで適切なアクセス制御を設定

## 12. 参考リンク

- [Firebase Console](https://console.firebase.google.com/)
- [Google Cloud Console](https://console.cloud.google.com/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)

---

**最終更新**: 2024-06-27
**対象バージョン**: Node.js 20.19.3, Firebase CLI 14.9.0