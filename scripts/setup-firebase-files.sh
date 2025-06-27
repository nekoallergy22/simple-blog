#!/bin/bash

# Firebase設定ファイルを作成するスクリプト
# 使用方法: ./scripts/setup-firebase-files.sh [PROJECT_ID]

set -e

# パラメータ取得
PROJECT_ID=${1:-""}

if [ -z "$PROJECT_ID" ]; then
    echo "❌ プロジェクトIDを指定してください"
    echo "使用方法: ./scripts/setup-firebase-files.sh YOUR_PROJECT_ID"
    exit 1
fi

echo "🔥 Firebase設定ファイル作成開始"
echo "プロジェクトID: $PROJECT_ID"
echo ""

# 1. .firebaserc作成
if [ ! -f ".firebaserc" ]; then
    cat > .firebaserc << EOF
{
  "projects": {
    "default": "$PROJECT_ID"
  }
}
EOF
    echo "✅ .firebaserc 作成完了"
else
    echo "✅ .firebaserc は既に存在します"
fi

# 2. firebase.json作成
if [ ! -f "firebase.json" ]; then
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
else
    echo "✅ firebase.json は既に存在します"
fi

# 3. firestore.rules作成
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
else
    echo "✅ firestore.rules は既に存在します"
fi

# 4. firestore.indexes.json作成
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
else
    echo "✅ firestore.indexes.json は既に存在します"
fi

# 5. Firebase Functionsディレクトリ作成
if [ ! -d "functions" ]; then
    mkdir -p functions/src
    
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

    echo "✅ Firebase Functionsディレクトリ作成完了"
else
    echo "✅ Firebase Functionsディレクトリは既に存在します"
fi

# 6. Firestoreデータベース作成
echo "📊 Firestoreデータベース設定..."
if ! gcloud firestore databases describe --project=$PROJECT_ID &>/dev/null; then
    echo "📊 Firestoreデータベース作成中..."
    gcloud firestore databases create --region=asia-northeast1 --project=$PROJECT_ID
    echo "✅ Firestoreデータベース作成完了"
else
    echo "✅ Firestoreデータベースは既に存在します"
fi

echo ""
echo "✅ Firebase設定ファイル作成完了!"
echo ""
echo "📝 次のステップ:"
echo "1. Firebaseプロジェクト設定: firebase use $PROJECT_ID"
echo "2. Functionsデプロイ: ./scripts/deploy-functions.sh"
echo "3. 初回データ同期: npm run sync-md"
echo "4. Firestoreルールデプロイ: firebase deploy --only firestore:rules,firestore:indexes"
echo ""
echo "🌐 Firebase Console: https://console.firebase.google.com/project/$PROJECT_ID"
