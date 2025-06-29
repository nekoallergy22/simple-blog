# Tech-Master デプロイメントガイド

このガイドでは、Tech-Master（技術学習プラットフォーム）のセットアップからデプロイまでの全手順を説明します。

## 📋 目次

1. [スクリプト一覧と目的](#スクリプト一覧と目的)
2. [初期セットアップ](#初期セットアップ)
3. [開発環境での作業](#開発環境での作業)
4. [プロダクション環境へのデプロイ](#プロダクション環境へのデプロイ)
5. [独自ドメインの設定](#独自ドメインの設定)
6. [トラブルシューティング](#トラブルシューティング)

## 📜 スクリプト一覧と目的

### 🚀 メインスクリプト（主要操作）

| スクリプト | 目的 | いつ使う | 効果 |
|------------|------|----------|------|
| `deploy-github.sh` | **GitHub Actions経由デプロイ**（推奨） | 日常的なデプロイ | Markdown同期→コミット→プッシュ→自動デプロイ |
| `deploy-cloudbuild.sh` | **Cloud Build直接デプロイ** | GitHub Actions使わずデプロイしたい時 | Cloud Build→Artifact Registry→Cloud Run |
| `domain-setup.sh` | **独自ドメイン設定** | カスタムドメインを設定したい時 | DNS設定→SSL証明書→Load Balancer設定 |

### ⚙️ セットアップスクリプト（初回のみ）

| スクリプト | 目的 | いつ使う | 効果 |
|------------|------|----------|------|
| `setup-firebase-existing.sh` | **Firebase初期設定** | プロジェクト開始時 | Firebase API有効化→Firestore設定 |
| `setup-github-complete.sh` | **GitHub Actions設定** | CI/CD構築時 | GitHub Secrets設定→権限設定 |
| `setup-secrets-from-env.sh` | **Secrets一括設定** | 環境変数をSecretsに反映したい時 | .env.local→GitHub Secretsに一括転送 |

### 🔧 補助スクリプト（必要に応じて）

| スクリプト | 目的 | いつ使う | 効果 |
|------------|------|----------|------|
| `check-deployment-status.sh` | **デプロイ状況確認** | デプロイ後の状態確認 | Cloud Run状態→ログ→イメージ情報表示 |
| `test-sync.sh` | **Markdown同期テスト** | 同期機能のテスト | ローカル→Firebase同期テスト |
| `setup-artifact-registry.sh` | **Artifact Registry設定** | Dockerリポジトリ設定 | Docker用リポジトリ作成 |
| `setup-firebase-files.sh` | **Firebase設定ファイル生成** | Firebase設定ファイル必要時 | firebase.json等の生成 |
| `firebase-web-config.sh` | **Firebase Web設定取得** | Web SDK設定情報取得 | Firebase Web設定の表示 |
| `fix-service-account-permissions.sh` | **権限修正** | 権限エラー発生時 | サービスアカウント権限修正 |

### 📄 その他ファイル

| ファイル | 目的 |
|----------|------|
| `sync-md.js` | Markdownファイル→Firestore同期のメインロジック |

## 🚀 初期セットアップ

### 前提条件

- Node.js 18+ がインストールされていること
- Google Cloud CLI がインストールされていること
- Firebase CLI がインストールされていること
- GitHub CLI がインストールされていること（オプション）

### 1. プロジェクトクローンと依存関係インストール

```bash
git clone https://github.com/nekoallergy22/simple-blog.git
cd simple-blog
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の内容を設定：

```bash
# Firebase設定
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Firebase Admin設定
FIREBASE_PROJECT_ID=your_project_id
FIREBASE_CLIENT_EMAIL=service-account@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----"

# プロジェクト設定
GCP_PROJECT_ID=your_project_id
GITHUB_REPO=your_username/simple-blog
SERVICE_NAME=tech-master
CUSTOM_DOMAIN=techmaster.dev
```

### 3. Firebase プロジェクトの設定

既存のGCPプロジェクトをFirebaseプロジェクトとして設定：

```bash
./scripts/setup-firebase-existing.sh
```

**効果**: 
- Firestore API有効化
- Firebase Authentication有効化
- Firestore セキュリティルール設定
- 必要なサービスアカウント作成

### 4. GitHub Actions の設定

GitHubリポジトリにCI/CDを設定：

```bash
./scripts/setup-github-complete.sh
```

**効果**: 
- GitHub Secretsが自動設定される
- サービスアカウントキーがSecretsに登録される
- mainブランチへのpush時に自動デプロイが実行される
- 必要なGCP権限が設定される

## 💻 開発環境での作業

### ローカル開発サーバーの起動

```bash
npm run dev
```

アプリケーションは `http://localhost:3000` で利用可能になります。

### Markdownファイルの同期

記事（Markdownファイル）をFirestoreに同期：

```bash
npm run sync-md
```

**効果**: `posts/` ディレクトリ内のMarkdownファイルがFirestoreの`posts`コレクションに同期されます。

### 同期機能のテスト

```bash
./scripts/test-sync.sh
```

**効果**: 
- Markdownファイルの存在確認
- ローカル同期の実行
- Firebase Functions経由での同期テスト（該当する場合）
- Firestoreデータの確認

## 🌐 プロダクション環境へのデプロイ

### 方法1: GitHub Actions経由（推奨）

```bash
./scripts/deploy-github.sh "コミットメッセージ"
```

**効果**:
- Markdownファイルの自動同期
- 変更のコミット・プッシュ
- GitHub Actionsによる自動ビルド・デプロイ
- Cloud Runへのデプロイ

**使用場面**: 
- 日常的な記事更新
- コード変更のデプロイ
- 複数人での開発

### 方法2: 直接デプロイ

```bash
./scripts/deploy-cloudbuild.sh
```

**効果**:
- Cloud Build経由でのDockerイメージビルド
- Artifact Registryへのプッシュ
- Cloud Runへの直接デプロイ

**使用場面**:
- GitHub Actionsを使わずにデプロイしたい場合
- ローカルからの直接デプロイ
- CI/CD設定前のテストデプロイ

### デプロイ状況の確認

```bash
./scripts/check-deployment-status.sh
```

**効果**:
- Cloud Runサービスの状態確認
- 最近のCloud Buildの状況
- コンテナイメージの確認
- エラーログの表示
- 推奨コマンドの提示

## 🌍 独自ドメインの設定

### カスタムドメインの設定

```bash
./scripts/domain-setup.sh
```

**効果**:
- Cloud DNS マネージドゾーンの作成
- 静的IPアドレスの割り当て
- SSL証明書の作成（Google Managed）
- Load Balancerの設定（NEG、バックエンドサービス、URLマップ）
- HTTPSプロキシの作成
- HTTP→HTTPSリダイレクトの設定
- 設定状態の最終確認

**使用場面**:
- 初回のドメイン設定
- ドメイン設定のトラブル解決
- SSL証明書の更新

### 手動設定が必要な作業

1. **ドメインレジストラでのネームサーバー設定**
   - スクリプト実行後に表示されるGoogle Cloud DNSのネームサーバーを設定

2. **Firebase Authenticationの設定**
   - Firebase Consoleで独自ドメインを承認済みドメインに追加

## 🔧 補助スクリプト詳細

### 環境設定関連

#### Artifact Registry の設定
```bash
./scripts/setup-artifact-registry.sh
```
**効果**: Dockerイメージ用のArtifact Registryリポジトリを作成
**使用場面**: Container Registry廃止に伴う移行、初回セットアップ

#### Firebase設定ファイルの生成
```bash
./scripts/setup-firebase-files.sh
```
**効果**: Firebase設定ファイル（`firebase.json`、`.firebaserc`）を生成
**使用場面**: Firebase設定が必要な場合、設定ファイル紛失時

#### Firebase Web設定の取得
```bash
./scripts/firebase-web-config.sh
```
**効果**: Firebase Web SDKの設定情報を取得・表示
**使用場面**: フロントエンド設定情報が必要な場合

### デプロイ関連

#### GitHub Secretsの設定
```bash
./scripts/setup-secrets-from-env.sh
```
**効果**: `.env.local`の内容を基にGitHub Secretsを一括設定
**使用場面**: 環境変数の更新時、Secrets設定の一括更新

#### サービスアカウント権限の修正
```bash
./scripts/fix-service-account-permissions.sh
```
**効果**: デプロイに必要なサービスアカウントの権限を適切に設定
**使用場面**: 権限エラー発生時、初回セットアップ時

### 監視・テスト関連

#### デプロイ状況確認
```bash
./scripts/check-deployment-status.sh
```
**効果**: 包括的なデプロイ状況レポート
**使用場面**: デプロイ後の状態確認、トラブルシューティング

#### Markdown同期テスト
```bash
./scripts/test-sync.sh
```
**効果**: 同期機能の詳細テスト
**使用場面**: 記事が表示されない場合、同期機能のデバッグ

## 🔍 トラブルシューティング

### よくある問題と解決法

#### 1. Firebase接続エラー
```bash
# 環境変数の確認
cat .env.local | grep FIREBASE

# Firebase プロジェクトの再設定
./scripts/setup-firebase-existing.sh
```

#### 2. デプロイエラー
```bash
# デプロイ状況の確認
./scripts/check-deployment-status.sh

# サービスアカウント権限の修正
./scripts/fix-service-account-permissions.sh
```

#### 3. ドメイン設定エラー
```bash
# 既存のリソース確認
gcloud compute addresses list --global
gcloud dns managed-zones list

# ドメイン設定の再実行（冪等性あり）
./scripts/domain-setup.sh
```

#### 4. Markdown同期エラー
```bash
# 同期テスト実行
./scripts/test-sync.sh

# 手動同期
npm run sync-md
```

#### 5. GitHub Actions失敗
```bash
# Secrets確認
gh secret list

# Secrets再設定
./scripts/setup-secrets-from-env.sh
```

### ログの確認方法

```bash
# Cloud Runログ
source .env.local && gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" --limit=50

# Cloud Buildログ
gcloud builds list --limit=5

# GitHub Actionsログ
# https://github.com/your-username/simple-blog/actions
```

## 📊 運用フロー

### 日常的な記事更新
1. `posts/` ディレクトリに記事追加
2. `./scripts/deploy-github.sh "新記事追加"`
3. GitHub Actionsで自動デプロイ
4. 数分後に本番サイトに反映

### コード変更デプロイ
1. コード変更・テスト
2. `./scripts/deploy-github.sh "機能追加"`
3. GitHub Actions経由で自動デプロイ

### 設定変更
1. `.env.local` 更新
2. `./scripts/setup-secrets-from-env.sh` でSecrets更新
3. 必要に応じて `./scripts/deploy-github.sh "設定更新"`

## 📞 サポート

問題が解決しない場合は、以下を確認してください：

1. `.env.local`の設定が正しいか
2. 必要なAPIが有効化されているか
3. サービスアカウントの権限が適切か
4. GitHub Secretsが正しく設定されているか

詳細なエラーログと共に、プロジェクトの管理者に相談してください。