#!/bin/bash

# Firebase Functions と Cloud Run Functions の古い関数を削除するスクリプト

set -e

# 色付きメッセージ関数
print_status() {
    echo -e "\033[1;34m[INFO]\033[0m $1"
}

print_success() {
    echo -e "\033[1;32m[SUCCESS]\033[0m $1"
}

print_error() {
    echo -e "\033[1;31m[ERROR]\033[0m $1"
}

print_status "🗑️  古いFirebase Functions/Cloud Run Functionsの削除開始"

# 環境変数読み込み
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '#' | xargs)
fi

REGION="asia-northeast1"
FUNCTIONS_TO_DELETE=("syncMarkdownFiles" "healthCheck")

print_status "📋 現在のFirebase Functions一覧："
firebase functions:list 2>/dev/null || echo "Firebase Functions not found or not logged in"

print_status "📋 現在のCloud Run Functions一覧："
gcloud functions list --region=$REGION 2>/dev/null || echo "Cloud Run Functions not found"

print_status "📋 現在のCloud Run Services一覧："
gcloud run services list --region=$REGION 2>/dev/null || echo "Cloud Run Services not found"

echo ""
print_status "🗑️  削除対象の関数: ${FUNCTIONS_TO_DELETE[*]}"
echo ""

# Firebase Functions削除
print_status "🔥 Firebase Functions削除中..."
for func in "${FUNCTIONS_TO_DELETE[@]}"; do
    if firebase functions:list 2>/dev/null | grep -q "$func"; then
        print_status "削除中: Firebase Function '$func'"
        firebase functions:delete "$func" --force 2>/dev/null && \
            print_success "✅ Firebase Function '$func' 削除完了" || \
            print_error "❌ Firebase Function '$func' 削除失敗"
    else
        print_status "⚠️  Firebase Function '$func' は存在しません"
    fi
done

# Cloud Run Functions削除
print_status "☁️  Cloud Run Functions削除中..."
for func in "${FUNCTIONS_TO_DELETE[@]}"; do
    if gcloud functions list --region=$REGION 2>/dev/null | grep -q "$func"; then
        print_status "削除中: Cloud Run Function '$func'"
        gcloud functions delete "$func" --region=$REGION --quiet 2>/dev/null && \
            print_success "✅ Cloud Run Function '$func' 削除完了" || \
            print_error "❌ Cloud Run Function '$func' 削除失敗"
    else
        print_status "⚠️  Cloud Run Function '$func' は存在しません"
    fi
done

echo ""
print_status "🔍 削除後の状況確認："

print_status "Firebase Functions:"
firebase functions:list 2>/dev/null || echo "No Firebase Functions found"

print_status "Cloud Run Functions:"
gcloud functions list --region=$REGION 2>/dev/null || echo "No Cloud Run Functions found"

print_status "Cloud Run Services:"
gcloud run services list --region=$REGION 2>/dev/null || echo "No Cloud Run Services found"

echo ""
print_success "🎉 古い関数の削除処理が完了しました！"
print_status "💡 新しいCloud Run APIサービス 'tech-master-api' は保持されています"