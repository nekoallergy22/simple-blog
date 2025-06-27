#!/bin/bash

# Firebase Webアプリ設定サポートスクリプト
# 使用方法: ./scripts/firebase-web-config.sh [PROJECT_ID] [REPO_OWNER/REPO_NAME]

set -e

PROJECT_ID=${1:-""}
REPO=${2:-""}

if [ -z "$PROJECT_ID" ] || [ -z "$REPO" ]; then
    echo "❌ パラメータが不足です"
    echo "使用方法: ./scripts/firebase-web-config.sh PROJECT_ID OWNER/REPO_NAME"
    exit 1
fi

echo "🔥 Firebase Webアプリ設定サポート"
echo "プロジェクトID: $PROJECT_ID"
echo "リポジトリ: $REPO"
echo ""

echo "📋 Firebase Consoleでの手順:"
echo "1. 以下のURLを開く:"
echo "   https://console.firebase.google.com/project/$PROJECT_ID/settings/general"
echo ""
echo "2. 'ウェブアプリを追加' ボタンをクリック"
echo "3. アプリ名: 'simple-blog-web' と入力"
echo "4. 'アプリを登録' をクリック"
echo "5. 表示された設定情報をコピーして以下のコマンドを実行:"
echo ""
echo "# API Key"
echo "gh secret set NEXT_PUBLIC_FIREBASE_API_KEY --body 'YOUR_API_KEY_HERE' --repo '$REPO'"
echo ""
echo "# Auth Domain (通常はこの値)"
echo "gh secret set NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN --body '$PROJECT_ID.firebaseapp.com' --repo '$REPO'"
echo ""
echo "# Project ID (通常はこの値)"
echo "gh secret set NEXT_PUBLIC_FIREBASE_PROJECT_ID --body '$PROJECT_ID' --repo '$REPO'"
echo ""
echo "# Storage Bucket (通常はこの値)"
echo "gh secret set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET --body '$PROJECT_ID.appspot.com' --repo '$REPO'"
echo ""
echo "# Messaging Sender ID"
echo "gh secret set NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID --body 'YOUR_SENDER_ID_HERE' --repo '$REPO'"
echo ""
echo "# App ID"
echo "gh secret set NEXT_PUBLIC_FIREBASE_APP_ID --body 'YOUR_APP_ID_HERE' --repo '$REPO'"
echo ""
echo "✅ 全てのコマンドを実行後、git push で自動デプロイが開始されます"
echo ""
echo "🔍 デプロイ状況確認:"
echo "GitHub Actions: https://github.com/$REPO/actions"
echo "Cloud Run: https://console.cloud.google.com/run?project=$PROJECT_ID"
