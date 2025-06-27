#!/bin/bash

# 完全GitHub自動デプロイ設定スクリプト
# 使用方法: ./scripts/setup-github-complete.sh [PROJECT_ID] [REPO_OWNER/REPO_NAME]

set -e

# パラメータ取得
PROJECT_ID=${1:-""}
REPO=${2:-""}

if [ -z "$PROJECT_ID" ] || [ -z "$REPO" ]; then
    echo "❌ パラメータが不足です"
    echo "使用方法: ./scripts/setup-github-complete.sh PROJECT_ID OWNER/REPO_NAME"
    echo "例: ./scripts/setup-github-complete.sh pid-my-portfolio-project username/simple-blog"
    exit 1
fi

echo "🚀 GitHub自動デプロイ完全設定開始"
echo "プロジェクトID: $PROJECT_ID"
echo "リポジトリ: $REPO"
echo ""

# 1. GitHub CLIインストール確認
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh)がインストールされていません"
    echo "インストール: brew install gh"
    exit 1
fi

# 2. GitHub認証確認
echo "🔑 GitHub認証確認..."
if ! gh auth status &>/dev/null; then
    echo "❌ GitHub認証が必要です"
    echo "gh auth login を実行してください"
    exit 1
fi

# 3. サービスアカウントキー確認
KEY_FILE="service-account-key.json"
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ サービスアカウントキーが見つかりません"
    echo "./scripts/setup-gcp.sh $PROJECT_ID を先に実行してください"
    exit 1
fi

# 4. GitHub Secrets設定
echo "🔐 GitHub Secrets設定中..."

# GCP関連
echo "📊 GCP Secrets設定..."
gh secret set GCP_PROJECT_ID --body "$PROJECT_ID" --repo "$REPO"
gh secret set GCP_SA_KEY --body "$(cat $KEY_FILE)" --repo "$REPO"

# Firebase Admin関連
echo "🔥 Firebase Admin Secrets設定..."
FIREBASE_PROJECT_ID=$(cat $KEY_FILE | jq -r '.project_id')
FIREBASE_CLIENT_EMAIL=$(cat $KEY_FILE | jq -r '.client_email')
FIREBASE_PRIVATE_KEY=$(cat $KEY_FILE | jq -r '.private_key')

gh secret set FIREBASE_PROJECT_ID --body "$FIREBASE_PROJECT_ID" --repo "$REPO"
gh secret set FIREBASE_CLIENT_EMAIL --body "$FIREBASE_CLIENT_EMAIL" --repo "$REPO"
gh secret set FIREBASE_PRIVATE_KEY --body "$FIREBASE_PRIVATE_KEY" --repo "$REPO"

echo "✅ 基本Secrets設定完了"
echo ""
echo "⚠️  Next.js用Firebase設定が必要です"
echo "Firebase Console ( https://console.firebase.google.com/project/$PROJECT_ID/settings/general ) で:"
echo ""
echo "1. 'ウェブアプリを追加' をクリック"
echo "2. アプリ名: 'simple-blog-web' で作成"
echo "3. 設定情報を取得して以下のコマンドを実行:"
echo ""
echo "gh secret set NEXT_PUBLIC_FIREBASE_API_KEY --body 'YOUR_API_KEY' --repo '$REPO'"
echo "gh secret set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN --body '$FIREBASE_PROJECT_ID.firebaseapp.com' --repo '$REPO'"
echo "gh secret set NEXT_PUBLIC_FIREBASE_PROJECT_ID --body '$FIREBASE_PROJECT_ID' --repo '$REPO'"
echo "gh secret set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET --body '$FIREBASE_PROJECT_ID.appspot.com' --repo '$REPO'"
echo "gh secret set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --body 'YOUR_SENDER_ID' --repo '$REPO'"
echo "gh secret set NEXT_PUBLIC_FIREBASE_APP_ID --body 'YOUR_APP_ID' --repo '$REPO'"
echo ""
echo "4. 設定完了後、git push で自動デプロイが開始されます"
echo ""
echo "🌐 Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID/settings/general"
echo "🐙 GitHub Actions: https://github.com/$REPO/actions"
