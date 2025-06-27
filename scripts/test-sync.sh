#!/bin/bash

# Markdown同期テストスクリプト
# 使用方法: ./scripts/test-sync.sh

set -e

echo "🧪 Markdown同期テスト開始"
echo ""

# 1. Firebaseプロジェクト確認
PROJECT_ID=$(firebase use --json | jq -r '.result[0].project' 2>/dev/null || echo "")
if [ -z "$PROJECT_ID" ] || [ "$PROJECT_ID" = "null" ]; then
    echo "❌ Firebaseプロジェクトが設定されていません"
    echo "firebase use YOUR_PROJECT_ID でプロジェクトを設定してください"
    exit 1
fi

echo "🔥 Firebaseプロジェクト: $PROJECT_ID"

# 2. postsディレクトリ確認
if [ ! -d "posts" ]; then
    echo "❌ postsディレクトリが存在しません"
    exit 1
fi

# 3. Markdownファイル数確認
MD_COUNT=$(find posts -name "*.md" | wc -l | tr -d ' ')
echo "📊 Markdownファイル数: $MD_COUNT件"

if [ "$MD_COUNT" -eq 0 ]; then
    echo "❌ Markdownファイルが見つかりません"
    exit 1
fi

# 4. ローカルsync-mdスクリプトテスト
echo "📋 ローカル同期スクリプトテスト..."
if [ -f "scripts/sync-md.js" ]; then
    echo "🚀 ローカル同期実行..."
    npm run sync-md
    echo "✅ ローカル同期完了"
else
    echo "⚠️  sync-md.jsが見つかりません。Functions経由でテストします"
fi

# 5. Firebase Functions経由での同期テスト
echo ""
echo "🔥 Firebase Functions経由での同期テスト..."

# Functions URL取得
FUNCTIONS_URL="https://asia-northeast1-$PROJECT_ID.cloudfunctions.net/syncMarkdownFiles"
echo "🌐 Functions URL: $FUNCTIONS_URL"

# HTTPリクエスト送信
echo "📤 HTTPリクエスト送信中..."
if command -v curl &> /dev/null; then
    RESPONSE=$(curl -s -w "%{http_code}" -X POST "$FUNCTIONS_URL" || echo "000")
    HTTP_CODE=${RESPONSE: -3}
    BODY=${RESPONSE%???}
    
    if [ "$HTTP_CODE" = "200" ]; then
        echo "✅ Functions同期成功!"
        echo "$BODY" | jq '.' 2>/dev/null || echo "$BODY"
    else
        echo "❌ Functions同期エラー (HTTP $HTTP_CODE)"
        echo "$BODY"
    fi
else
    echo "⚠️  curlがインストールされていません。手動でテストしてください"
    echo "テストURL: $FUNCTIONS_URL"
fi

# 6. Firestoreデータ確認
echo ""
echo "📊 Firestoreデータ確認..."
if command -v gcloud &> /dev/null; then
    echo "📋 postsコレクション確認..."
    
    # gcloudでFirestoreデータ取得
    POST_COUNT=$(gcloud firestore collections list --project="$PROJECT_ID" 2>/dev/null | grep -c "posts" || echo "0")
    
    if [ "$POST_COUNT" -gt 0 ]; then
        echo "✅ postsコレクションを発見"
        
        # ドキュメント数を取得（具体的な数は取得できないためサンプルで確認）
        echo "📋 サンプルドキュメント取得中..."
        SAMPLE_DOC=$(gcloud firestore documents list posts --project="$PROJECT_ID" --limit=1 --format="value(name)" 2>/dev/null | head -1 || echo "")
        
        if [ -n "$SAMPLE_DOC" ]; then
            echo "✅ Firestoreにデータが存在します"
            echo "サンプル: $SAMPLE_DOC"
        else
            echo "⚠️  postsコレクションは存在しますが、ドキュメントが見つかりません"
        fi
    else
        echo "⚠️  postsコレクションが見つかりません"
    fi
else
    echo "⚠️  gcloud CLIがインストールされていません"
    echo "Firebase Consoleで手動確認: https://console.firebase.google.com/project/$PROJECT_ID/firestore"
fi

echo ""
echo "✅ テスト完了!"
echo ""
echo "📝 次のステップ:"
echo "1. Firebase Consoleでデータ確認: https://console.firebase.google.com/project/$PROJECT_ID/firestore"
echo "2. Cloud Runデプロイ: ./scripts/deploy-cloudrun.sh $PROJECT_ID"
echo "3. ローカルテスト: npm run dev"
