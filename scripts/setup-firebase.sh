#!/bin/bash

# Firebaseプロジェクト設定スクリプト
# 使用方法: ./scripts/setup-firebase.sh [PROJECT_ID]

set -e

# パラメータ取得
PROJECT_ID=${1:-""}

if [ -z "$PROJECT_ID" ]; then
    echo "❌ プロジェクトIDを指定してください"
    echo "使用方法: ./scripts/setup-firebase.sh YOUR_PROJECT_ID"
    exit 1
fi

echo "🔥 Firebaseプロジェクト設定開始"
echo "プロジェクトID: $PROJECT_ID"
echo ""

# 1. Firebase CLIインストール確認
if ! command -v firebase &> /dev/null; then
    echo "📦 Firebase CLIをインストール中..."
    npm install -g firebase-tools
fi

# 2. Firebaseログイン
echo "🔑 Firebaseログイン確認..."
if ! firebase projects:list &>/dev/null; then
    echo "🔑 Firebaseログインが必要です"
    firebase login
fi

# 3. Firebaseプロジェクト初期化
echo "🔧 Firebaseプロジェクト初期化..."
if [ ! -f "firebase.json" ]; then
    # 非対話モードでFirebase初期化
    cat > firebase.json << EOF
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  },
  "hosting": {
    "public": "out",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
EOF
    echo "✅ firebase.json 作成完了"
fi

# 4. Firestoreルール作成
if [ ! -f "firestore.rules" ]; then
    cat > firestore.rules << EOF
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 公開ブログのため、読み取りは許可
    match /posts/{postId} {
      allow read: if true;
      allow write: if false; // 管理者のみ書き込み可能
    }
    
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if false;
    }
  }
}
EOF
    echo "✅ firestore.rules 作成完了"
fi

# 5. Firestoreインデックス作成
if [ ! -f "firestore.indexes.json" ]; then
    cat > firestore.indexes.json << EOF
{
  "indexes": [
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "category",
          "order": "ASCENDING"
        },
        {
          "fieldPath": "date",
          "order": "DESCENDING"
        }
      ]
    },
    {
      "collectionGroup": "posts",
      "queryScope": "COLLECTION",
      "fields": [
        {
          "fieldPath": "date",
          "order": "DESCENDING"
        }
      ]
    }
  ],
  "fieldOverrides": []
}
EOF
    echo "✅ firestore.indexes.json 作成完了"
fi

# 6. Firebase Functionsディレクトリ作成
if [ ! -d "functions" ]; then
    mkdir -p functions
    
    # package.json作成
    cat > functions/package.json << EOF
{
  "name": "functions",
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "lib/index.js",
  "dependencies": {
    "firebase-admin": "^12.1.1",
    "firebase-functions": "^5.0.1",
    "gray-matter": "^4.0.3"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@types/node": "^20.0.0"
  },
  "private": true
}
EOF

    # TypeScript設定
    cat > functions/tsconfig.json << EOF
{
  "compilerOptions": {
    "module": "commonjs",
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "outDir": "lib",
    "sourceMap": true,
    "strict": true,
    "target": "es2017"
  },
  "compileOnSave": true,
  "include": [
    "src"
  ]
}
EOF

    # Functionsソースディレクトリ
    mkdir -p functions/src
    
    echo "✅ Firebase Functionsディレクトリ作成完了"
fi

# 7. Firebaseプロジェクト設定
echo "🔧 Firebaseプロジェクト設定: $PROJECT_ID"
firebase use $PROJECT_ID

# 8. Firestore有効化
echo "📊 Firestore有効化..."
gcloud services enable firestore.googleapis.com --project=$PROJECT_ID

# 9. Firestoreデータベース作成
echo "📊 Firestoreデータベース作成..."
if ! gcloud firestore databases describe --project=$PROJECT_ID &>/dev/null; then
    gcloud firestore databases create --region=asia-northeast1 --project=$PROJECT_ID
    echo "✅ Firestoreデータベース作成完了"
else
    echo "✅ Firestoreデータベースは既に存在します"
fi

echo ""
echo "✅ Firebase設定完了!"
echo ""
echo "📝 次のステップ:"
echo "1. Firebase Functionsデプロイ: ./scripts/deploy-functions.sh"
echo "2. 初回データ同期: npm run sync-md"
echo "3. Firestoreルールデプロイ: firebase deploy --only firestore:rules,firestore:indexes"
echo ""
echo "🌐 Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID"
