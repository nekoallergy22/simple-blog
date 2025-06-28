#!/bin/bash

# Fix Service Account Permissions for Artifact Registry
# Usage: ./scripts/fix-service-account-permissions.sh [PROJECT_ID]
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
SERVICE_ACCOUNT_NAME="simple-blog-deploy"

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Error: PROJECT_ID is required"
    echo "Usage: $0 [PROJECT_ID]"
    echo "Or set GCP_PROJECT_ID in .env.local"
    exit 1
fi

echo "🔧 Fixing service account permissions for Artifact Registry"
echo "📋 Project ID: $PROJECT_ID"
echo "👤 Service Account: $SERVICE_ACCOUNT_NAME"
echo ""

# Set the project
gcloud config set project $PROJECT_ID

SERVICE_ACCOUNT_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"

echo "🔧 Adding required IAM roles..."

# Essential roles for GitHub Actions deployment
ROLES=(
    "roles/artifactregistry.writer"
    "roles/storage.admin"
    "roles/run.admin"
    "roles/iam.serviceAccountUser"
    "roles/cloudbuild.builds.builder"
)

for role in "${ROLES[@]}"; do
    echo "  Adding role: $role"
    gcloud projects add-iam-policy-binding $PROJECT_ID \
        --member="serviceAccount:${SERVICE_ACCOUNT_EMAIL}" \
        --role="$role" \
        --quiet
done

echo ""
echo "✅ Service account permissions updated successfully!"
echo ""
echo "📋 Applied roles:"
for role in "${ROLES[@]}"; do
    echo "  • $role"
done
echo ""
echo "🔄 You can now run the Artifact Registry setup:"
echo "  ./scripts/setup-artifact-registry.sh $PROJECT_ID"
echo ""