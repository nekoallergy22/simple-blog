#!/bin/bash

# .env.local からGitHub Secretsを設定するスクリプト
# 使用方法: ./scripts/setup-secrets-from-env.sh

set -e

ENV_FILE=".env.local"

echo "🔐 GitHub Secrets自動設定（環境変数ファイルから）"
echo ""

# 1. 環境変数ファイル確認
if [ ! -f "$ENV_FILE" ]; then
    echo "❌ $ENV_FILE ファイルが見つかりません"
    echo "まず Firebase Console で設定を取得し、$ENV_FILE を作成してください"
    exit 1
fi

# 2. 環境変数読み込み
echo "📋 環境変数ファイル読み込み: $ENV_FILE"
source $ENV_FILE

# 3. 必須パラメータ確認
if [ -z "$GITHUB_REPO" ] || [ -z "$GCP_PROJECT_ID" ]; then
    echo "❌ GITHUB_REPO または GCP_PROJECT_ID が設定されていません"
    echo "$ENV_FILE ファイルを確認してください"
    exit 1
fi

echo "リポジトリ: $GITHUB_REPO"
echo "プロジェクトID: $GCP_PROJECT_ID"
echo ""

# 4. GitHub CLI確認
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh) がインストールされていません"
    echo "brew install gh でインストールしてください"
    exit 1
fi

# 5. GitHub認証確認
if ! gh auth status &>/dev/null; then
    echo "❌ GitHub認証が必要です"
    echo "gh auth login を実行してください"
    exit 1
fi

# 6. サービスアカウントキー確認
KEY_FILE="service-account-key.json"
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ $KEY_FILE が見つかりません"
    echo "./scripts/setup-gcp.sh を先に実行してください"
    exit 1
fi

echo "🚀 GitHub Secrets設定開始..."
echo ""

# 7. GCP関連Secrets
echo "📊 GCP Secrets設定..."
gh secret set GCP_PROJECT_ID --body "$GCP_PROJECT_ID" --repo "$GITHUB_REPO"
gh secret set GCP_SA_KEY --body "$(cat $KEY_FILE)" --repo "$GITHUB_REPO"

# 8. Firebase Admin関連Secrets
echo "🔥 Firebase Admin Secrets設定..."
FIREBASE_CLIENT_EMAIL=$(cat $KEY_FILE | jq -r '.client_email')
FIREBASE_PRIVATE_KEY=$(cat $KEY_FILE | jq -r '.private_key')

gh secret set FIREBASE_PROJECT_ID --body "$FIREBASE_PROJECT_ID" --repo "$GITHUB_REPO"
gh secret set FIREBASE_CLIENT_EMAIL --body "$FIREBASE_CLIENT_EMAIL" --repo "$GITHUB_REPO"
gh secret set FIREBASE_PRIVATE_KEY --body "$FIREBASE_PRIVATE_KEY" --repo "$GITHUB_REPO"

# 9. Next.js Firebase設定Secrets
echo "⚛️  Next.js Firebase Secrets設定..."
gh secret set NEXT_PUBLIC_FIREBASE_API_KEY --body "$NEXT_PUBLIC_FIREBASE_API_KEY" --repo "$GITHUB_REPO"
gh secret set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN --body "$NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN" --repo "$GITHUB_REPO"
gh secret set NEXT_PUBLIC_FIREBASE_PROJECT_ID --body "$NEXT_PUBLIC_FIREBASE_PROJECT_ID" --repo "$GITHUB_REPO"
gh secret set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET --body "$NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET" --repo "$GITHUB_REPO"
gh secret set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --body "$NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" --repo "$GITHUB_REPO"
gh secret set NEXT_PUBLIC_FIREBASE_APP_ID --body "$NEXT_PUBLIC_FIREBASE_APP_ID" --repo "$GITHUB_REPO"

# 10. オプション: Measurement ID
if [ -n "$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" ]; then
    gh secret set NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID --body "$NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID" --repo "$GITHUB_REPO"
fi

echo ""
echo "✅ GitHub Secrets設定完了！"
echo ""
echo "📋 設定されたSecrets一覧:"
gh secret list --repo "$GITHUB_REPO"

echo ""
echo "🚀 次のステップ:"
echo "1. 自動デプロイテスト実行:"
echo "   ./scripts/deploy-github.sh \"Firebase設定完了 - 初回自動デプロイ\""
echo ""
echo "2. デプロイ状況確認:"
echo "   GitHub Actions: https://github.com/$GITHUB_REPO/actions"
echo "   Cloud Run: https://console.cloud.google.com/run?project=$GCP_PROJECT_ID"
echo ""
echo "3. 約5-10分後にアプリが公開されます！"
