#!/bin/bash

# Tech Master API デプロイスクリプト
# Firebase Functions → Cloud Run 移行版

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

# 環境変数読み込み
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '#' | xargs)
fi

# 必要な環境変数チェック
if [ -z "$GCP_PROJECT_ID" ]; then
    print_error "GCP_PROJECT_ID が設定されていません"
    exit 1
fi

print_status "🚀 Tech Master API デプロイ開始"
print_status "プロジェクト: $GCP_PROJECT_ID"

# APIディレクトリに移動
cd api

print_status "📦 依存関係インストール"
npm install

print_status "🔨 TypeScriptビルド"
npm run build

print_status "🐳 Cloud Run サービスデプロイ"
gcloud run deploy tech-master-api \
  --source . \
  --region asia-northeast1 \
  --project $GCP_PROJECT_ID \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --timeout 300 \
  --concurrency 1000 \
  --min-instances 0 \
  --max-instances 5 \
  --port 8080 \
  --set-env-vars "NODE_ENV=production,FIREBASE_PROJECT_ID=$FIREBASE_PROJECT_ID,FIREBASE_CLIENT_EMAIL=$FIREBASE_CLIENT_EMAIL,FIREBASE_PRIVATE_KEY=$FIREBASE_PRIVATE_KEY"

# デプロイ完了確認
print_status "🔍 デプロイ状況確認"
API_URL=$(gcloud run services describe tech-master-api --region asia-northeast1 --project $GCP_PROJECT_ID --format 'value(status.url)')

print_success "✅ Tech Master API デプロイ完了"
print_success "🌐 API URL: $API_URL"
print_success "📋 利用可能エンドポイント:"
print_success "   GET  $API_URL/health"
print_success "   POST $API_URL/sync-markdown"

# ヘルスチェック実行
print_status "💓 ヘルスチェック実行"
if curl -s -f "$API_URL/health" > /dev/null; then
    print_success "✅ API サービスは正常に稼働中"
else
    print_error "❌ API サービスの起動に問題があります"
    exit 1
fi

cd ..

print_success "🎉 全てのデプロイが完了しました！"