#!/bin/bash

# Cloud Run デプロイ状況確認スクリプト

# .env.localから環境変数を読み込み
if [ -f ".env.local" ]; then
    source .env.local
fi

PROJECT_ID=${1:-${GCP_PROJECT_ID:-"pid-my-portfolio-project"}}
SERVICE_NAME=${2:-${SERVICE_NAME:-"simple-blog"}}
REGION=${3:-"asia-northeast1"}

echo "🔍 Cloud Run デプロイ状況確認"
echo "プロジェクトID: $PROJECT_ID"
echo "サービス名: $SERVICE_NAME"
echo "リージョン: $REGION"
echo ""

echo "📊 1. Cloud Run サービス一覧"
echo "================================"
gcloud run services list --project=$PROJECT_ID --filter="metadata.name:$SERVICE_NAME"

echo ""
echo "📊 2. 全Cloud Run サービス"
echo "================================"
gcloud run services list --project=$PROJECT_ID

echo ""
echo "🏗️  3. 最近のCloud Build状況"
echo "================================"
gcloud builds list --project=$PROJECT_ID --limit=5

echo ""
echo "🐳 4. ローカルDocker状況"
echo "================================"
echo "Docker Images:"
docker images | grep -E "(simple-blog|gcr.io/$PROJECT_ID)" || echo "関連イメージなし"
echo ""
echo "Docker Containers:"
docker ps -a | grep simple-blog || echo "関連コンテナなし"

echo ""
echo "⚙️  5. 実行中のプロセス確認"
echo "================================"
echo "Docker/gcloud関連プロセス:"
ps aux | grep -E "(docker build|gcloud.*deploy|gcloud.*run)" | grep -v grep || echo "関連プロセスなし"

echo ""
echo "📝 6. Cloud Run ログ (最新10件)"
echo "================================"
if gcloud run services describe $SERVICE_NAME --region=$REGION --project=$PROJECT_ID &>/dev/null; then
    echo "サービス '$SERVICE_NAME' のログ:"
    gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=$SERVICE_NAME" --project=$PROJECT_ID --limit=10 --format="table(timestamp,severity,textPayload)"
else
    echo "サービス '$SERVICE_NAME' は存在しません"
fi

echo ""
echo "🌐 7. Container Registry確認"
echo "================================"
echo "GCR内のイメージ:"
gcloud container images list --repository=gcr.io/$PROJECT_ID --filter="name:simple-blog" || echo "simple-blogイメージなし"

echo ""
echo "📈 8. プロジェクト全体のリソース使用状況"
echo "================================"
echo "アクティブなCloud Runサービス数:"
gcloud run services list --project=$PROJECT_ID --format="value(metadata.name)" | wc -l

echo ""
echo "💡 9. デプロイ推奨コマンド"
echo "================================"
echo "手動デプロイ実行:"
echo "  ./scripts/deploy-cloudrun.sh $PROJECT_ID"
echo ""
echo "個別コマンド:"
echo "  # Dockerビルド"
echo "  docker build -t gcr.io/$PROJECT_ID/$SERVICE_NAME:latest ."
echo ""
echo "  # イメージプッシュ"
echo "  docker push gcr.io/$PROJECT_ID/$SERVICE_NAME:latest"
echo ""
echo "  # Cloud Runデプロイ"
echo "  gcloud run deploy $SERVICE_NAME \\"
echo "    --image gcr.io/$PROJECT_ID/$SERVICE_NAME:latest \\"
echo "    --platform managed \\"
echo "    --region $REGION \\"
echo "    --allow-unauthenticated \\"
echo "    --port 3000 \\"
echo "    --memory 2Gi \\"
echo "    --cpu 1 \\"
echo "    --project $PROJECT_ID"

echo ""
echo "✅ 確認完了！"