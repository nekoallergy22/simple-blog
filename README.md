# 🎓 Tech-Master

技術学習プラットフォーム - AI学習コース収録のNext.jsアプリケーション

## 🚀 クイックスタート

### 1. 環境変数の設定（必須）

```bash
# .env.local.example をコピーして設定
cp .env.local.example .env.local
# Firebase・GCP・GitHub設定を実際の値に編集
```

### 2. ローカル開発

```bash
npm install
npm run dev
```

http://localhost:3000 でアクセス可能

## 🌐 デプロイ

### 初回セットアップ

```bash
./scripts/setup-firebase-existing.sh
./scripts/setup-github-complete.sh
./scripts/setup-secrets-from-env.sh
./scripts/deploy-github.sh "Initial deployment"
```

### 記事更新・デプロイ

```bash
./scripts/deploy-github.sh "新記事追加"
```

## 📜 主要コマンド

| コマンド                     | 用途                    |
| ---------------------------- | ---------------------- |
| `npm run dev`                | ローカル開発            |
| `npm run sync-md`            | 記事同期 (Cloud Run API) |
| `npm run sync-md-legacy`     | 記事同期 (レガシー)      |
| `./scripts/deploy-github.sh` | デプロイ               |
| `./scripts/deploy-api.sh`    | API単体デプロイ         |
| `./scripts/domain-setup.sh`  | ドメイン設定            |

詳細は [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) を参照

## 記事の作成

```bash
# 1. posts/ディレクトリに記事作成
# 2. フロントマター設定（title, date, category, slug）
# 3. 同期・デプロイ
npm run sync-md
./scripts/deploy-github.sh "新記事追加"
```

## 📁 プロジェクト構成

```
tech-master/
├── api/                   # Cloud Run API サービス
│   ├── src/              # Express API ソース
│   ├── Dockerfile        # API用Docker設定
│   └── package.json      # API依存関係
├── posts/                 # Markdown記事
├── scripts/               # デプロイスクリプト
├── src/                  # Next.jsアプリ
│   ├── app/             # App Router
│   └── components/      # コンポーネント
└── .env.local           # 環境変数
```

## ライセンス

MIT
