#!/bin/bash

# GCP初期設定スクリプト
# 使用方法: ./scripts/setup-gcp.sh [PROJECT_ID]

set -e

# パラメータ取得
PROJECT_ID=${1:-""}

if [ -z "$PROJECT_ID" ]; then
    echo "❌ プロジェクトIDを指定してください"
    echo "使用方法: ./scripts/setup-gcp.sh YOUR_PROJECT_ID"
    exit 1
fi

echo "🚀 GCPプロジェクト初期設定開始"
echo "プロジェクトID: $PROJECT_ID"
echo ""

# 1. gcloud CLIインストール確認
if ! command -v gcloud &> /dev/null; then
    echo "❌ gcloud CLIがインストールされていません"
    echo "次のURLからインストールしてください:"
    echo "https://cloud.google.com/sdk/docs/install"
    exit 1
fi

# 2. Google Cloud認証
echo "📋 Google Cloud認証..."
if ! gcloud auth list --format="value(account)" | grep -q "."; then
    echo "🔑 Google Cloudログインが必要です"
    gcloud auth login
fi

# 3. プロジェクト設定
echo "🔧 プロジェクト設定: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# 4. プロジェクト存在確認
if ! gcloud projects describe $PROJECT_ID &>/dev/null; then
    echo "❌ プロジェクト '$PROJECT_ID' が存在しません"
    echo "新しいプロジェクトを作成しますか? (y/N)"
    read -r response
    if [[ "$response" =~ ^[Yy]$ ]]; then
        echo "🆕 プロジェクト作成中..."
        gcloud projects create $PROJECT_ID
        gcloud config set project $PROJECT_ID
    else
        echo "プロジェクト作成をキャンセルしました"
        exit 1
    fi
fi

# 5. 請求有効化確認
echo "💳 請求有効化状態確認..."
if ! gcloud beta billing projects describe $PROJECT_ID &>/dev/null; then
    echo "⚠️  請求が有効化されていません"
    echo "Google Cloud Consoleで請求を有効化してください:"
    echo "https://console.cloud.google.com/billing/linkedaccount?project=$PROJECT_ID"
    echo ""
    echo "請求有効化後、Enterキーで続行..."
    read -r
fi

# 6. 必要なAPI有効化
echo "🔌 必要なAPIを有効化中..."
APIS=(
    "run.googleapis.com"
    "cloudbuild.googleapis.com"
    "containerregistry.googleapis.com"
    "artifactregistry.googleapis.com"
    "firebase.googleapis.com"
    "firestore.googleapis.com"
)

for api in "${APIS[@]}"; do
    echo "📦 $api を有効化中..."
    gcloud services enable $api
done

# 7. Artifact Registryリポジトリ作成
echo "📦 Artifact Registryリポジトリ作成..."
REPO_NAME="simple-blog"
REGION="asia-northeast1"

if ! gcloud artifacts repositories describe $REPO_NAME --location=$REGION &>/dev/null; then
    gcloud artifacts repositories create $REPO_NAME \
        --repository-format=docker \
        --location=$REGION \
        --description="Simple Blog Docker repository"
    echo "✅ Artifact Registryリポジトリ作成完了"
else
    echo "✅ Artifact Registryリポジトリは既に存在します"
fi

# 8. サービスアカウント作成
echo "🔑 サービスアカウント作成..."
SA_NAME="simple-blog-deploy"
SA_EMAIL="$SA_NAME@$PROJECT_ID.iam.gserviceaccount.com"

if ! gcloud iam service-accounts describe $SA_EMAIL &>/dev/null; then
    gcloud iam service-accounts create $SA_NAME \
        --display-name="Simple Blog Deploy Service Account"
    echo "✅ サービスアカウント作成完了"
else
    echo "✅ サービスアカウントは既に存在します"
fi

# 9. サービスアカウント権限設定
echo "🛡️ サービスアカウント権限設定..."
ROLES=(
    "roles/run.admin"
    "roles/storage.admin"
    "roles/cloudbuild.builds.editor"
    "roles/artifactregistry.writer"
    "roles/firebase.admin"
)

for role in "${ROLES[@]}"; do
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:$SA_EMAIL" \
        --role="$role"
done

# 10. サービスアカウントキー作成
echo "🔐 サービスアカウントキー作成..."
KEY_FILE="service-account-key.json"

if [ ! -f "$KEY_FILE" ]; then
    gcloud iam service-accounts keys create $KEY_FILE \
        --iam-account=$SA_EMAIL
    echo "✅ サービスアカウントキー作成: $KEY_FILE"
    echo "⚠️  このファイルを安全に保管し、Gitにコミットしないでください"
else
    echo "✅ サービスアカウントキーは既に存在します"
fi

echo ""
echo "✅ GCP初期設定完了!"
echo ""
echo "📝 次のステップ:"
echo "1. Firebaseプロジェクト設定: ./scripts/setup-firebase.sh $PROJECT_ID"
echo "2. GitHub Secrets設定:"
echo "   - GCP_PROJECT_ID: $PROJECT_ID"
echo "   - GCP_SA_KEY: $(cat $KEY_FILE | base64 -w 0 2>/dev/null || cat $KEY_FILE | base64)"
echo "3. Cloud Runデプロイ: ./scripts/deploy-cloudrun.sh $PROJECT_ID"
echo ""
echo "🌐 コンソール URL: https://console.cloud.google.com/run?project=$PROJECT_ID"
