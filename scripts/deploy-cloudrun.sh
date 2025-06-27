#!/bin/bash

# Cloud Run デプロイスクリプト
# 使用方法: ./scripts/deploy-cloudrun.sh [PROJECT_ID] [SERVICE_NAME] [REGION]

set -e

# デフォルト値
DEFAULT_PROJECT_ID="your-project-id"
DEFAULT_SERVICE_NAME="simple-blog"
DEFAULT_REGION="asia-northeast1"

# パラメータ取得
PROJECT_ID=${1:-$DEFAULT_PROJECT_ID}
SERVICE_NAME=${2:-$DEFAULT_SERVICE_NAME}
REGION=${3:-$DEFAULT_REGION}

echo "🚀 Cloud Run デプロイ開始"
echo "プロジェクトID: $PROJECT_ID"
echo "サービス名: $SERVICE_NAME"
echo "リージョン: $REGION"
echo ""

# 1. gcloud認証確認
echo "📋 Google Cloud認証状態確認..."
if ! gcloud auth list --format="value(account)" | grep -q "."; then
    echo "❌ Google Cloudにログインしていません"
    echo "次のコマンドでログインしてください:"
    echo "gcloud auth login"
    exit 1
fi

# 2. プロジェクト設定
echo "🔧 プロジェクト設定: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# 3. 必要なAPIの有効化確認
echo "🔌 必要なAPI有効化確認..."
APIS=("run.googleapis.com" "cloudbuild.googleapis.com" "containerregistry.googleapis.com")
for api in "${APIS[@]}"; do
    if ! gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q "$api"; then
        echo "📦 $api を有効化中..."
        gcloud services enable $api
    else
        echo "✅ $api は既に有効です"
    fi
done

# 4. Docker認証設定
echo "🐳 Docker認証設定..."
gcloud auth configure-docker --quiet

# 5. アプリケーションビルド
echo "🔨 アプリケーションビルド..."
npm ci
npm run build

# 6. Dockerイメージビルド
echo "📦 Dockerイメージビルド..."
IMAGE_TAG="gcr.io/$PROJECT_ID/$SERVICE_NAME:$(date +%Y%m%d-%H%M%S)"
docker build -t $IMAGE_TAG .

# 7. イメージプッシュ
echo "📤 イメージプッシュ: $IMAGE_TAG"
docker push $IMAGE_TAG

# 8. Cloud Runデプロイ
echo "🚀 Cloud Runデプロイ..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_TAG \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 3000 \
    --memory 2Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 5 \
    --timeout 300

# 9. サービスURL取得
SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region=$REGION --format="value(status.url)")

echo ""
echo "✅ デプロイ完了!"
echo "🌐 サービスURL: $SERVICE_URL"
echo ""
echo "📝 環境変数を設定する場合:"
echo "gcloud run services update $SERVICE_NAME --region=$REGION --set-env-vars=KEY=VALUE"
echo ""
echo "📊 ログ確認:"
echo "gcloud logging read \"resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME\" --limit=50"
