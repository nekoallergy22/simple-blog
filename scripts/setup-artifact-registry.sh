#!/bin/bash

# Artifact Registry Setup Script for Simple Blog
# Usage: ./scripts/setup-artifact-registry.sh [PROJECT_ID]
# If PROJECT_ID is not provided, it will be read from .env.local

set -e

# Load environment variables from .env.local
if [ -f ".env.local" ]; then
    export $(grep -v '^#' .env.local | xargs)
    echo "📋 Loaded environment from .env.local"
else
    echo "⚠️  Warning: .env.local not found"
fi

PROJECT_ID=${1:-$GCP_PROJECT_ID}
REGION="asia-northeast1"
REPOSITORY="simple-blog-repo"
SERVICE_ACCOUNT_NAME="simple-blog-deploy"

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: PROJECT_ID is required"
    echo "Usage: $0 [PROJECT_ID]"
    echo "Or set GCP_PROJECT_ID in .env.local"
    exit 1
fi

echo "🚀 Setting up Artifact Registry for Simple Blog"
echo "📋 Project ID: $PROJECT_ID"
echo "📍 Region: $REGION"
echo "📦 Repository: $REPOSITORY"
echo ""

# Set the project
echo "🔧 Setting gcloud project..."
gcloud config set project $PROJECT_ID

# Enable required APIs
echo "🔧 Enabling required APIs..."
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable run.googleapis.com

# Create Artifact Registry repository
echo "🔧 Creating Artifact Registry repository..."
if gcloud artifacts repositories describe $REPOSITORY --location=$REGION >/dev/null 2>&1; then
    echo "✅ Repository '$REPOSITORY' already exists"
else
    gcloud artifacts repositories create $REPOSITORY \
        --repository-format=docker \
        --location=$REGION \
        --description="Docker repository for Simple Blog application"
    echo "✅ Repository '$REPOSITORY' created successfully"
fi

# Configure Docker authentication
echo "🔧 Configuring Docker authentication..."
gcloud auth configure-docker ${REGION}-docker.pkg.dev

# Update service account permissions for Artifact Registry
echo "🔧 Updating service account permissions..."
SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

# Add Artifact Registry permissions
gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/artifactregistry.writer"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
    --role="roles/storage.admin"

echo ""
echo "✅ Artifact Registry setup completed!"
echo ""
echo "📋 Configuration Summary:"
echo "  • Repository URL: ${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPOSITORY}"
echo "  • Service Account: ${SERVICE_ACCOUNT_EMAIL}"
echo "  • Permissions: artifactregistry.writer, storage.admin"
echo ""
echo "🔄 Next steps:"
echo "  1. Push your changes to trigger GitHub Actions"
echo "  2. Monitor deployment at: https://console.cloud.google.com/run?project=${PROJECT_ID}"
echo ""