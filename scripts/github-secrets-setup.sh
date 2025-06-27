#!/bin/bash

# GitHub Secrets設定スクリプト
# 使用方法: ./scripts/github-secrets-setup.sh [PROJECT_ID] [REPO_OWNER/REPO_NAME]

set -e

# パラメータ取得
PROJECT_ID=${1:-""}
REPO=${2:-""}

if [ -z "$PROJECT_ID" ] || [ -z "$REPO" ]; then
    echo "❌ パラメータが不足です"
    echo "使用方法: ./scripts/github-secrets-setup.sh PROJECT_ID OWNER/REPO_NAME"
    echo "例: ./scripts/github-secrets-setup.sh my-project-123 username/simple-blog"
    exit 1
fi

echo "🔐 GitHub Secrets設定開始"
echo "プロジェクトID: $PROJECT_ID"
echo "リポジトリ: $REPO"
echo ""

# 1. GitHub CLIインストール確認
if ! command -v gh &> /dev/null; then
    echo "❌ GitHub CLI (gh)がインストールされていません"
    echo "次のURLからインストールしてください:"
    echo "https://cli.github.com/"
    echo ""
    echo "macOS: brew install gh"
    echo "Ubuntu: sudo apt install gh"
    exit 1
fi

# 2. GitHub認証確認
echo "🔑 GitHub認証確認..."
if ! gh auth status &>/dev/null; then
    echo "🔑 GitHubログインが必要です"
    gh auth login
fi

# 3. サービスアカウントキー確認
KEY_FILE="service-account-key.json"
if [ ! -f "$KEY_FILE" ]; then
    echo "❌ サービスアカウントキーファイルが見つかりません: $KEY_FILE"
    echo "まず ./scripts/setup-gcp.sh を実行してください"
    exit 1
fi

# 4. Firebase設定情報取得
echo "🔥 Firebase設定情報取得..."
if [ ! -f ".firebaserc" ]; then
    echo "❌ .firebasercファイルが見つかりません"
    echo "まず ./scripts/setup-firebase.sh を実行してください"
    exit 1
fi

# Firebaseプロジェクト設定を取得
FIREBASE_PROJECT_ID=$(cat .firebaserc | jq -r '.projects.default' 2>/dev/null || echo "$PROJECT_ID")

# Firebase設定をgcloudから取得（サンプル値）
echo "📋 Firebase設定サンプルを生成中..."
cat > .env.example << EOF
# Firebase設定 (GitHub Secretsに設定する値)
FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
FIREBASE_CLIENT_EMAIL=simple-blog-deploy@$FIREBASE_PROJECT_ID.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\n...秘密鍵...
-----END PRIVATE KEY-----

# Next.js Firebase設定
NEXT_PUBLIC_FIREBASE_API_KEY=AIza...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=$FIREBASE_PROJECT_ID.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=$FIREBASE_PROJECT_ID.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
EOF

# 5. GitHub Secrets設定
echo "🔐 GitHub Secrets設定中..."

# GCP関連
echo "🌐 GCP Secrets設定..."
gh secret set GCP_PROJECT_ID --body "$PROJECT_ID" --repo "$REPO"
gh secret set GCP_SA_KEY --body "$(cat $KEY_FILE)" --repo "$REPO"

# Firebase Admin関連
echo "🔥 Firebase Admin Secrets設定..."
gh secret set FIREBASE_PROJECT_ID --body "$FIREBASE_PROJECT_ID" --repo "$REPO"

# サービスアカウント情報をJSONから抽出
FIREBASE_CLIENT_EMAIL=$(cat $KEY_FILE | jq -r '.client_email')
FIREBASE_PRIVATE_KEY=$(cat $KEY_FILE | jq -r '.private_key')

gh secret set FIREBASE_CLIENT_EMAIL --body "$FIREBASE_CLIENT_EMAIL" --repo "$REPO"
gh secret set FIREBASE_PRIVATE_KEY --body "$FIREBASE_PRIVATE_KEY" --repo "$REPO"

echo "✅ GitHub Secrets設定完了!"
echo ""
echo "📝 設定されたSecrets:"
echo "- GCP_PROJECT_ID"
echo "- GCP_SA_KEY"
echo "- FIREBASE_PROJECT_ID"
echo "- FIREBASE_CLIENT_EMAIL"
echo "- FIREBASE_PRIVATE_KEY"
echo ""
echo "⚠️  まだ設定が必要なSecrets:"
echo "Next.js用Firebase設定を手動で追加してください:"
echo ""
echo "gh secret set NEXT_PUBLIC_FIREBASE_API_KEY --body 'YOUR_API_KEY' --repo '$REPO'"
echo "gh secret set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN --body '$FIREBASE_PROJECT_ID.firebaseapp.com' --repo '$REPO'"
echo "gh secret set NEXT_PUBLIC_FIREBASE_PROJECT_ID --body '$FIREBASE_PROJECT_ID' --repo '$REPO'"
echo "gh secret set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET --body '$FIREBASE_PROJECT_ID.appspot.com' --repo '$REPO'"
echo "gh secret set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --body 'YOUR_SENDER_ID' --repo '$REPO'"
echo "gh secret set NEXT_PUBLIC_FIREBASE_APP_ID --body 'YOUR_APP_ID' --repo '$REPO'"
echo ""
echo "🌐 Firebase Consoleでウェブアプリ設定を確認:"
echo "https://console.firebase.google.com/project/$FIREBASE_PROJECT_ID/settings/general"
echo ""
echo "🚀 次のステップ:"
echo "1. Firebaseウェブアプリ設定完了後、上記コマンドでSecrets追加"
echo "2. GitHub Actionsテスト: git pushでデプロイ確認"
