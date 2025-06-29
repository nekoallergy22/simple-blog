# 📜 Tech-Master スクリプトガイド

## 🎯 スクリプト分類と使用順序

### 🚀 メインスクリプト（日常使用）

#### `deploy-github.sh` ⭐️ 推奨
```bash
./scripts/deploy-github.sh "コミットメッセージ"
```
**目的**: GitHub Actions経由でのデプロイ
**効果**: Markdown同期 → コミット → プッシュ → 自動デプロイ
**使用タイミング**: 日常的な記事更新・コード変更時

#### `deploy-cloudbuild.sh`
```bash
./scripts/deploy-cloudbuild.sh
```
**目的**: Cloud Build直接デプロイ
**効果**: Cloud Build → Artifact Registry → Cloud Run
**使用タイミング**: GitHub Actions使わずにデプロイしたい時

#### `domain-setup.sh`
```bash
./scripts/domain-setup.sh
```
**目的**: 独自ドメインの完全設定
**効果**: DNS設定 → SSL証明書 → Load Balancer → リダイレクト設定
**使用タイミング**: カスタムドメイン設定時

---

### ⚙️ 初期セットアップスクリプト（初回のみ）

#### `setup-firebase-existing.sh`
```bash
./scripts/setup-firebase-existing.sh
```
**目的**: Firebase初期設定
**効果**: Firebase API有効化 → Firestore設定 → セキュリティルール
**使用タイミング**: プロジェクト開始時

#### `setup-github-complete.sh`
```bash
./scripts/setup-github-complete.sh
```
**目的**: GitHub Actions完全設定
**効果**: GitHub Secrets設定 → サービスアカウント権限設定
**使用タイミング**: CI/CD構築時

#### `setup-secrets-from-env.sh`
```bash
./scripts/setup-secrets-from-env.sh
```
**目的**: 環境変数からSecrets一括設定
**効果**: .env.local → GitHub Secretsに一括転送
**使用タイミング**: 環境変数をSecretsに反映したい時

---

### 🔧 補助スクリプト（必要に応じて）

#### `check-deployment-status.sh`
```bash
./scripts/check-deployment-status.sh
```
**目的**: デプロイ状況の包括的確認
**効果**: Cloud Run状態 → ログ → イメージ情報表示
**使用タイミング**: デプロイ後の状態確認

#### `test-sync.sh`
```bash
./scripts/test-sync.sh
```
**目的**: Markdown同期機能のテスト
**効果**: ローカル同期 → Firebase同期テスト
**使用タイミング**: 記事が表示されない場合

#### `setup-artifact-registry.sh`
```bash
./scripts/setup-artifact-registry.sh
```
**目的**: Dockerリポジトリ設定
**効果**: Artifact Registryリポジトリ作成
**使用タイミング**: Container Registry移行時

#### `setup-firebase-files.sh`
```bash
./scripts/setup-firebase-files.sh
```
**目的**: Firebase設定ファイル生成
**効果**: firebase.json等の生成
**使用タイミング**: Firebase設定ファイル必要時

#### `firebase-web-config.sh`
```bash
./scripts/firebase-web-config.sh
```
**目的**: Firebase Web設定取得
**効果**: Firebase Web設定の表示
**使用タイミング**: Web SDK設定情報取得時

#### `fix-service-account-permissions.sh`
```bash
./scripts/fix-service-account-permissions.sh
```
**目的**: サービスアカウント権限修正
**効果**: デプロイ用権限の適切な設定
**使用タイミング**: 権限エラー発生時

---

## 🔄 典型的な使用フロー

### 初回セットアップ
```bash
1. ./scripts/setup-firebase-existing.sh
2. ./scripts/setup-github-complete.sh
3. ./scripts/setup-secrets-from-env.sh
4. ./scripts/deploy-github.sh "Initial deployment"
```

### 日常的な記事更新
```bash
1. 記事作成（posts/ディレクトリ）
2. ./scripts/deploy-github.sh "新記事追加"
```

### 独自ドメイン設定
```bash
1. ./scripts/domain-setup.sh
2. ドメインレジストラでネームサーバー設定（手動）
```

### トラブルシューティング
```bash
1. ./scripts/check-deployment-status.sh
2. ./scripts/test-sync.sh
3. ./scripts/fix-service-account-permissions.sh（必要に応じて）
```

---

## 📄 その他のファイル

### `sync-md.js`
**目的**: Markdownファイル→Firestore同期のメインロジック
**使用方法**: `npm run sync-md`で実行
**効果**: posts/ディレクトリのMarkdownファイルをFirestoreに同期

---

## ⚠️ 注意事項

1. **環境変数**: 全スクリプトは`.env.local`から設定を自動読み取り
2. **冪等性**: `domain-setup.sh`などは繰り返し実行可能
3. **エラーハンドリング**: 各スクリプトは詳細なエラーメッセージを出力
4. **権限**: 必要に応じてサービスアカウント権限の修正が必要

---

## 🆘 よくあるエラーと対処法

| エラー | 対処スクリプト |
|--------|----------------|
| Firebase接続エラー | `setup-firebase-existing.sh` |
| デプロイエラー | `check-deployment-status.sh` → `fix-service-account-permissions.sh` |
| ドメイン設定エラー | `domain-setup.sh`（再実行） |
| 同期エラー | `test-sync.sh` |
| GitHub Actions失敗 | `setup-secrets-from-env.sh` |