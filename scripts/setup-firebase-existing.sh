#!/bin/bash

# 既存GCPプロジェクトをFirebaseプロジェクトとして設定するスクリプト
# 使用方法: ./scripts/setup-firebase-existing.sh [PROJECT_ID]

set -e

# パラメータ取得
PROJECT_ID=${1:-""}

if [ -z "$PROJECT_ID" ]; then
    echo "❌ プロジェクトIDを指定してください"
    echo "使用方法: ./scripts/setup-firebase-existing.sh YOUR_PROJECT_ID"
    exit 1
fi

echo "🔥 既存GCPプロジェクトのFirebase設定開始"
echo "プロジェクトID: $PROJECT_ID"
echo ""

# 1. GCPプロジェクト存在確認
echo "🔍 GCPプロジェクト存在確認..."
if ! gcloud projects describe $PROJECT_ID &>/dev/null; then
    echo "❌ GCPプロジェクト '$PROJECT_ID' が見つかりません"
    echo "利用可能なプロジェクト:"
    gcloud projects list --format="table(projectId,name)"
    exit 1
fi

echo "✅ GCPプロジェクト確認完了"

# 2. Firebase API有効化
echo "🔌 Firebase API有効化..."
gcloud services enable firebase.googleapis.com --project=$PROJECT_ID
gcloud services enable firestore.googleapis.com --project=$PROJECT_ID
gcloud services enable cloudfunctions.googleapis.com --project=$PROJECT_ID

echo "✅ Firebase API有効化完了"

# 3. Firebase Management API有効化 (プロジェクト追加用)
echo "🔌 Firebase Management API有効化..."
gcloud services enable firebasehosting.googleapis.com --project=$PROJECT_ID
gcloud services enable identitytoolkit.googleapis.com --project=$PROJECT_ID

echo "✅ Firebase Management API有効化完了"

echo ""
echo "⚠️  次のステップ (手動操作が必要):"
echo ""
echo "1. Firebase Consoleでプロジェクトを追加:"
echo "   https://console.firebase.google.com/"
echo "   → 'プロジェクトを追加' → '既存のGoogle Cloudプロジェクトを選択'"
echo "   → '$PROJECT_ID' を選択"
echo ""
echo "2. Firebase追加後、以下のコマンドを実行:"
echo "   firebase use $PROJECT_ID"
echo "   firebase init firestore"
echo "   firebase init functions"
echo ""
echo "3. または、この設定ファイルを使用:"
echo "   ./scripts/setup-firebase-files.sh $PROJECT_ID"
echo ""
echo "🌐 Firebase Console: https://console.firebase.google.com/"
echo "🌐 GCP Console: https://console.cloud.google.com/welcome?project=$PROJECT_ID"
