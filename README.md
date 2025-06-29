# 🎓 Tech-Master

技術学習プラットフォーム - AI学習コース収録のNext.jsアプリケーション

## 🚀 クイックスタート

### 1. 環境変数の設定（オプション）

```bash
# .env.local.example をコピーして設定（GCP設定用）
cp .env.local.example .env.local
# GCP・GitHub設定を実際の値に編集（デプロイ時のみ必要）
```

### 2. ローカル開発

```bash
npm install
npm run dev
```

http://localhost:3000 でアクセス可能

## 🌐 デプロイ

### GitHub Actionsによる自動デプロイ

```bash
# 記事追加後、自動でデプロイされます
git add .
git commit -m "新記事追加"
git push origin main
```

## 📜 主要コマンド

| コマンド                     | 用途                    |
| ---------------------------- | ---------------------- |
| `npm run dev`                | ローカル開発            |
| `npm run build`              | プロダクションビルド     |
| `npm run generate-json`      | Static JSON生成         |
| `npm run type-check`         | TypeScript型チェック    |
| `npm run lint`               | ESLintチェック          |

詳細は [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) を参照

## 記事の作成

```bash
# 1. posts/ディレクトリに記事作成
# 2. フロントマター設定（title, date, category, section, slug）
# 3. Git push（自動デプロイ）
git add .
git commit -m "新記事追加"
git push origin main
```

## 📁 プロジェクト構成

```
tech-master/
├── posts/                 # Markdown記事
├── public/data/          # Generated JSON files
├── scripts/               # ビルドスクリプト
├── src/                  # Next.jsアプリ
│   ├── app/             # App Router
│   ├── components/      # コンポーネント
│   └── lib/             # ユーティリティ
└── .env.local           # 環境変数（オプション）
```

## ✨ Static JSON アーキテクチャ

Firebase削除により、軽量でコスト効率的なStatic JSONアーキテクチャに移行：

- **データソース**: Markdown files → Static JSON
- **フォールバック**: JSON → Markdown files
- **デプロイ**: GitHub Actions自動化
- **コスト**: $0追加費用

## ライセンス

MIT
