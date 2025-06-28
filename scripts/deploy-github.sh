#!/bin/bash

# GitHub経由自動デプロイスクリプト
# 使用方法: ./scripts/deploy-github.sh [COMMIT_MESSAGE]

set -e

COMMIT_MESSAGE=${1:-"Deploy: $(date +'%Y-%m-%d %H:%M:%S')"}

echo "🚀 GitHub Actions経由自動デプロイ開始"
echo "コミットメッセージ: $COMMIT_MESSAGE"
echo ""

# 1. Markdownファイル同期
echo "📄 Markdownファイル同期..."
npm run sync-md || echo "⚠️  Markdown同期をスキップ（Firebase未設定の可能性）"

# 2. 変更ファイル確認
echo "📋 Git状態確認..."
git status --porcelain | head -10 || echo "変更なし"

# 3. 全ての変更をステージング
echo "📦 変更をステージング..."
git add .

# 4. コミット
echo "📝 コミット作成..."
if git diff --staged --quiet; then
    echo "⚠️  コミットする変更がありません"
    echo "ファイルを変更してから再実行してください"
    exit 1
fi

git commit -m "$COMMIT_MESSAGE"

# 5. mainブランチにプッシュ
echo "🚀 mainブランチにプッシュ..."
git push origin main

echo ""
echo "✅ GitHubにプッシュ完了!"
echo ""
echo "🔍 デプロイ状況確認:"
echo "GitHub Actions: $(git remote get-url origin | sed 's/\.git$//' | sed 's/git@github.com:/https:\/\/github.com\//')/actions"
echo ""
echo "📊 デプロイ進行状況:"
echo "1. ローカルMarkdown同期 (完了)"
echo "2. GitHub Actions: Markdown同期 (sync-markdown job)"
echo "3. GitHub Actions: Dockerビルド & Cloud Runデプロイ (deploy job)"
echo "4. 完了後、Cloud Run URLが表示されます"
echo ""
echo "⚙️  デプロイには5-10分程度かかります"
