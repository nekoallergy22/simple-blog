# Tech-Master デプロイメントガイド

このガイドでは、Tech-Master（技術学習プラットフォーム）のセットアップからデプロイまでの全手順を説明します。

## 📋 目次

1. [アーキテクチャ概要](#アーキテクチャ概要)
2. [初期セットアップ](#初期セットアップ)
3. [開発環境での作業](#開発環境での作業)
4. [プロダクション環境へのデプロイ](#プロダクション環境へのデプロイ)
5. [独自ドメインの設定](#独自ドメインの設定)
6. [トラブルシューティング](#トラブルシューティング)

## 🏗️ アーキテクチャ概要

### Static JSON アーキテクチャ

Tech-Masterは軽量でコスト効率的なStatic JSONアーキテクチャを採用：

```
Markdown Files → JSON Generation → Static Hosting
       ↓               ↓               ↓
   posts/*.md → public/data/*.json → Cloud Run
```

**主な特徴**：
- **データソース**: Markdown files → Static JSON
- **フォールバック**: JSON → Markdown files (双方向対応)
- **デプロイ**: GitHub Actions完全自動化
- **コスト**: $0追加費用（Firebase削除済み）

### 技術スタック

- **フロントエンド**: Next.js 14 (App Router) + TypeScript
- **スタイリング**: Tailwind CSS + Typography
- **データ処理**: Gray-matter (Markdown frontmatter)
- **レンダリング**: React-markdown + Syntax highlighting
- **ホスティング**: Google Cloud Run
- **CI/CD**: GitHub Actions

## 🚀 初期セットアップ

### 前提条件

- Node.js 18+ がインストールされていること
- Google Cloud CLI がインストールされていること
- GitHub CLI がインストールされていること（オプション）

### 1. プロジェクトクローンと依存関係インストール

```bash
git clone https://github.com/nekoallergy22/simple-blog.git
cd simple-blog
npm install
```

### 2. 環境変数の設定（オプション）

デプロイ時のみ必要。ローカル開発は環境変数なしで動作します。

`.env.local`ファイルを作成（デプロイ用）：

```bash
# プロジェクト設定（デプロイ時のみ必要）
GCP_PROJECT_ID=your_project_id
GITHUB_REPO=your_username/simple-blog
SERVICE_NAME=tech-master
CUSTOM_DOMAIN=techmaster.dev
```

## 💻 開発環境での作業

### ローカル開発サーバーの起動

```bash
npm run dev
```

アプリケーションは `http://localhost:3000` で利用可能になります。

### 主要コマンド

| コマンド                     | 用途                    |
| ---------------------------- | ---------------------- |
| `npm run dev`                | ローカル開発            |
| `npm run build`              | プロダクションビルド     |
| `npm run generate-json`      | Static JSON生成         |
| `npm run type-check`         | TypeScript型チェック    |
| `npm run lint`               | ESLintチェック          |

### Static JSON生成

Markdownファイルを静的JSONに変換：

```bash
npm run generate-json
```

**効果**: 
- `posts/` ディレクトリのMarkdownファイルを解析
- `public/data/posts.json` に統合JSONファイル生成
- `public/data/sections/*.json` にセクション別JSONファイル生成
- `public/data/metadata.json` にメタデータファイル生成

## 🌐 プロダクション環境へのデプロイ

### GitHub Actions自動デプロイ（推奨）

```bash
# 記事追加・コード変更後
git add .
git commit -m "新記事追加"
git push origin main
```

**デプロイフロー**:
1. GitHub Actions トリガー
2. 依存関係インストール
3. Static JSON生成 (`npm run generate-json`)
4. Next.jsビルド (`npm run build`)
5. Dockerイメージ作成
6. Artifact Registryプッシュ
7. Cloud Runデプロイ

### 手動ビルド・テスト

```bash
# ローカルでプロダクションビルドテスト
npm run generate-json
npm run build
npm run type-check
npm run lint
```

## 🌍 独自ドメインの設定

カスタムドメインを設定する場合（任意）：

1. **Cloud DNS設定**
   ```bash
   gcloud dns managed-zones create tech-master-zone \
     --dns-name="yourdomain.com." \
     --description="Tech-Master domain"
   ```

2. **Cloud Runドメインマッピング**
   ```bash
   gcloud run domain-mappings create \
     --service=tech-master \
     --domain=yourdomain.com \
     --region=us-central1
   ```

3. **DNSレコード設定**
   - ドメインレジストラでGoogle Cloud DNSのネームサーバーを設定

## 📝 記事管理

### 記事作成フロー

1. **新しい記事作成**
   ```bash
   # posts/ディレクトリに記事作成
   touch posts/06-new-article.md
   ```

2. **フロントマター設定**
   ```markdown
   ---
   title: "記事タイトル"
   date: "2024-01-01"
   category: "ai-course"
   section: "ai"
   slug: "new-article"
   difficulty: "basic"
   number: 6
   ---
   
   # 記事内容
   記事の本文をMarkdownで記述
   ```

3. **デプロイ**
   ```bash
   git add .
   git commit -m "新記事追加: 記事タイトル"
   git push origin main
   ```

### 記事フィールド説明

- **title**: 記事タイトル
- **date**: 公開日（YYYY-MM-DD）
- **category**: カテゴリ（ai-course等）
- **section**: セクション（ai, python, datascience, tensorflow）
- **slug**: URL用スラッグ
- **difficulty**: 難易度（basic, intermediate, advanced）
- **number**: 記事番号（オプション、ソート用）

## 🔍 トラブルシューティング

### よくある問題と解決法

#### 1. ビルドエラー

```bash
# 型チェックエラー確認
npm run type-check

# Lintエラー確認
npm run lint

# 依存関係再インストール
rm -rf node_modules package-lock.json
npm install
```

#### 2. JSON生成エラー

```bash
# 手動でJSON生成確認
npm run generate-json

# 生成されたファイル確認
ls -la public/data/
cat public/data/metadata.json
```

#### 3. 記事が表示されない

```bash
# JSONファイルの内容確認
cat public/data/posts.json | jq '.[] | {title, slug, section}'

# 開発サーバーでの確認
npm run dev
# http://localhost:3000/ai でアクセス
```

#### 4. デプロイエラー

GitHub Actionsログを確認：
- https://github.com/your-username/simple-blog/actions

よくあるエラー：
- **権限エラー**: Secretsの設定確認
- **ビルドエラー**: TypeScript/Lintエラー修正
- **リソースエラー**: GCPクォータ確認

### ログの確認方法

```bash
# Cloud Runログ
gcloud logging read "resource.type=cloud_run_revision" --limit=50

# 最新デプロイ状況
gcloud run services describe tech-master --region=us-central1
```

## 📊 運用フロー

### 日常的な記事更新

1. `posts/` ディレクトリに記事追加
2. `git add . && git commit -m "新記事追加"`
3. `git push origin main`
4. GitHub Actionsで自動デプロイ（3-5分）

### コード変更デプロイ

1. コード変更・テスト
2. `npm run type-check && npm run lint`
3. `git add . && git commit -m "機能追加"`
4. `git push origin main`

### パフォーマンス監視

- **ビルド時間**: GitHub Actionsログで確認
- **記事数**: `public/data/metadata.json` で確認
- **ファイルサイズ**: `public/data/` ディレクトリのサイズ確認

## 🎯 最適化のポイント

### 1. 記事管理の最適化

- **番号付きファイル名**: `01-title.md` 形式でソート順制御
- **適切なスラッグ**: SEOを考慮したURL構造
- **セクション分類**: カテゴリとセクションの適切な使い分け

### 2. パフォーマンス最適化

- **Static JSON**: ビルド時生成でランタイム負荷削減
- **フォールバック**: JSON→Markdownの二段階フォールバック
- **キャッシュ**: Cloud Runでの適切なキャッシュヘッダー設定

### 3. コスト最適化

- **Firebase削除**: 外部データベース依存なし
- **Serverless**: Cloud Runでのオートスケーリング
- **静的ファイル**: CDN配信での帯域幅削減

## 📞 サポート

問題が解決しない場合は、以下を確認してください：

1. **Node.js バージョン**: 18+ が必要
2. **ファイル形式**: Markdownファイルのfrontmatter形式
3. **文字エンコーディング**: UTF-8での保存
4. **改行コード**: LF（Unix形式）推奨

詳細なエラーログと共に、プロジェクトの管理者に相談してください。