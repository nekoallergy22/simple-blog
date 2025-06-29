#!/bin/bash

# Static JSON移行実行スクリプト
echo "🚀 Static JSON移行を開始します"

# JSON生成
echo "📝 JSON生成中..."
npm run generate-json

if [ $? -ne 0 ]; then
    echo "❌ JSON生成に失敗しました"
    exit 1
fi

# ビルドテスト
echo "🔧 ビルドテスト中..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ ビルドに失敗しました"
    exit 1
fi

# 型チェック
echo "🔍 型チェック中..."
npm run type-check

if [ $? -ne 0 ]; then
    echo "❌ 型チェックに失敗しました"
    exit 1
fi

# Lint チェック
echo "📋 Lintチェック中..."
npm run lint

if [ $? -ne 0 ]; then
    echo "❌ Lintチェックに失敗しました"
    exit 1
fi

# 移行テスト
echo "🧪 移行テスト中..."
node test-migration.js

if [ $? -ne 0 ]; then
    echo "❌ 移行テストに失敗しました"
    exit 1
fi

echo "✨ Static JSON移行が完了しました！"
echo ""
echo "📊 移行結果:"
echo "- Firebase依存関係を削除"
echo "- 静的JSONファイルベースのデータ管理に移行"
echo "- ビルド時間短縮とコスト削減を実現"
echo "- 3段階フォールバック（Static JSON → Firebase → Markdown）で可用性確保"
echo ""
echo "🚀 次回のデプロイで本番環境に反映されます"