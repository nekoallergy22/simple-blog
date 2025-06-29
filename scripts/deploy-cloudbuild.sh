#!/bin/bash

# Cloud Build経由 Cloud Run デプロイスクリプト
# 使用方法: ./scripts/deploy-cloudbuild.sh

set -e

# .env.localから環境変数を読み込み
if [ -f ".env.local" ]; then
    source .env.local
fi

# 設定確認
PROJECT_ID=${GCP_PROJECT_ID}
SERVICE_NAME=${SERVICE_NAME:-"tech-master"}
REGION="asia-northeast1"

if [ -z "$PROJECT_ID" ]; then
    echo "❌ GCP_PROJECT_ID が設定されていません"
    exit 1
fi

if [ -z "$SERVICE_NAME" ]; then
    echo "❌ SERVICE_NAME が設定されていません"
    exit 1
fi

echo "🚀 Cloud Build経由 Cloud Run デプロイ開始"
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
APIS=("run.googleapis.com" "cloudbuild.googleapis.com" "artifactregistry.googleapis.com")
for api in "${APIS[@]}"; do
    if ! gcloud services list --enabled --filter="name:$api" --format="value(name)" | grep -q "$api"; then
        echo "📦 $api を有効化中..."
        gcloud services enable $api
    else
        echo "✅ $api は既に有効です"
    fi
done

# 4. Artifact Registryリポジトリの確認/作成
echo "📦 Artifact Registryリポジトリ確認..."
REPOSITORY="simple-blog-repo"
if ! gcloud artifacts repositories describe $REPOSITORY --location=$REGION &>/dev/null; then
    echo "🔨 Artifact Registryリポジトリを作成中..."
    gcloud artifacts repositories create $REPOSITORY \
        --repository-format=docker \
        --location=$REGION \
        --description="Tech-Master Docker repository"
    echo "✅ リポジトリを作成しました: $REPOSITORY"
else
    echo "✅ リポジトリは既に存在します: $REPOSITORY"
fi

# 5. アプリケーションビルド
echo "🔨 アプリケーションビルド..."
npm ci
npm run build

# 6. Cloud Buildでデプロイ
echo "🏗️  Cloud Buildでデプロイ中..."
IMAGE_URL="$REGION-docker.pkg.dev/$PROJECT_ID/$REPOSITORY/$SERVICE_NAME"

gcloud builds submit --tag $IMAGE_URL .

# 7. Cloud Runデプロイ
echo "🚀 Cloud Runデプロイ..."
gcloud run deploy $SERVICE_NAME \
    --image $IMAGE_URL \
    --platform managed \
    --region $REGION \
    --allow-unauthenticated \
    --port 8080 \
    --memory 2Gi \
    --cpu 1 \
    --min-instances 0 \
    --max-instances 5 \
    --timeout 300

# 8. サービスURL取得
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
echo ""
echo "🔍 次のステップ:"
echo "  1. ./scripts/domain-setup.sh を実行してカスタムドメインを設定"
echo "  2. https://$SERVICE_NAME-$PROJECT_ID.a.run.app でアクセステスト"