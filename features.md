# シンプルBlogアプリ - 機能仕様

## 概要
Gitベースのワークフローを使用した個人ブログ管理・公開のためのシンプルなWebアプリケーション

## 基本コンセプト
- **フロントエンド**: Google Cloud Run でホスティング
- **コンテンツ管理**: ローカルでmarkdownファイルを作成・編集・削除
- **デプロイ**: git push で記事が自動反映
- **バックエンド**: Firebase を活用
- **方針**: シンプルでミニマムな機能実現

## 基本機能

### 1. 記事管理（Git-based）
- **ローカル開発**
  - `posts/` ディレクトリに `.md` ファイルを作成
  - ローカルテキストエディタで記事編集
  - ファイル削除で記事削除

- **自動デプロイ**
  - Git commit & push でデプロイトリガー
  - MarkdownファイルをFirestoreに同期
  - Cloud Run が自動更新

- **記事フォーマット**
  ```markdown
  ---
  title: "記事タイトル"
  date: "2024-01-01"
  category: "ai-course"
  slug: "article-slug"
  ---
  
  # 記事内容
  Markdownで書かれた本文
  ```

### 2. 公開ページ
- **ブログホームページ**
  - 最新記事の表示
  - カテゴリ別絞り込み
  - シンプルな検索機能

- **記事詳細ページ**
  - Markdownコンテンツのレンダリング
  - コードのシンタックスハイライト
  - メタ情報の表示

- **カテゴリページ**
  - カテゴリ別記事一覧
  - カテゴリ説明の表示

### 3. コンテンツレンダリング
- **Markdownサポート**
  - 完全なMarkdown記法対応
  - コードシンタックスハイライト
  - レスポンシブデザイン

## 技術スタック

### フロントエンド
- React 18.3.1
- Next.js 14.2.5 (App Router)
- TypeScript 5.5.4
- Tailwind CSS 3.4.7
- react-markdown 9.0.1
- react-syntax-highlighter 15.5.0

### バックエンド
- Firebase Firestore Database
- Firebase Functions
- Firebase Storage (必要に応じて)

### 開発ツール
- ESLint 8.57.0
- Prettier 3.3.3
- TypeScript ESLint 7.17.0

### インフラ
- Google Cloud Run (ホスティング)
- Artifact Registry (Dockerイメージ保存、Container Registry後継)
- GitHub Actions (CI/CD)
- Firebase (バックエンドサービス)

## データ構造 (Firestore)

### Posts コレクション
```javascript
{
  id: string,           // 自動生成されるドキュメントID
  title: string,        // 記事タイトル
  content: string,      // Markdownコンテンツ
  slug: string,         // URLスラッグ
  category: string,     // カテゴリ名
  date: timestamp,      // 公開日
  createdAt: timestamp, // 作成日時
  updatedAt: timestamp  // 最終更新日時
}
```

### Categories コレクション (オプション)
```javascript
{
  id: string,           // カテゴリID
  name: string,         // カテゴリ名
  description: string,  // カテゴリ説明
  color: string,        // 表示色
  createdAt: timestamp
}
```

## ファイル構成
```
simple-blog/
├── posts/              # Markdownファイル
│   ├── hello-world.md
│   └── second-post.md
├── src/
│   ├── app/           # Next.js App Router
│   ├── components/    # Reactコンポーネント
│   ├── lib/          # ユーティリティ関数
│   └── types/        # TypeScript型定義
├── scripts/
│   └── sync-md.js    # Markdown同期スクリプト
└── .github/
    └── workflows/    # GitHub Actions
```

## デプロイフロー
1. ローカルで `.md` ファイル作成・編集
2. Git commit and push
3. GitHub Actions トリガー
4. MarkdownファイルをFirestoreに同期
5. Cloud Run サービス更新
6. 新しいコンテンツがWebサイトに反映

## 開発ワークフロー

### ローカル開発
```bash
# 開発サーバー起動
npm run dev

# MarkdownファイルをFirebaseに同期 (テスト用)
npm run sync-md

# 型チェック
npm run type-check

# ESLint実行
npm run lint
```

### 自動化セットアップ
```bash
# 初回セットアップ（.env.deploymentから自動読み取り）
./scripts/setup-gcp.sh
./scripts/fix-service-account-permissions.sh
./scripts/setup-artifact-registry.sh
./scripts/setup-firebase-files.sh

# GitHub Secrets設定
./scripts/setup-secrets-from-env.sh
```

### コンテンツ作成
1. `posts/` ディレクトリに新しい `.md` ファイル作成
2. フロントマターでタイトル、日付、カテゴリを設定
3. Markdownでコンテンツを記述
4. Commit & push でデプロイ

### ミニマム機能 (フェーズ1)
- Markdownファイルからの静的サイト生成
- 基本的な記事一覧・詳細ページ
- シンプルなレスポンシブデザイン
- Firebaseとの統合でデータ保存
- Cloud Run デプロイ

## サンプルコンテンツ
- **AIコース記事**: AIについて初歩から学べる24記事のシリーズ
  - 基礎編 (01-10): AI基礎からNLP、コンピュータビジョンまで
  - 応用編 (11-20): ニューラルネット、深層学習、強化学習
  - 実践編 (21-24): システム設計、カスタムニューラルネット
- **カテゴリ**: `ai-course`（AIコース）として統一
- **記事カードデザイン**: タイトル、カテゴリタグ、日付のみのシンプルデザイン
- **カラーコーディング**: カテゴリごとに異なる色のバーとタグ

## デザイン仕様
- **レイアウト**: フッターが常に下部に配置される構造
- **記事カード**: 上部にカテゴリカラーバー、カテゴリタグ、タイトル、日付の順
- **カラーパレット**: AIコースは青色（bg-blue-500）

## 将来的な拡張機能 (オプション)
- コメント機能 (Firebase)
- 検索機能の強化
- RSS配信機能
- SEO最適化
- PWA機能
- アクセス解析統合