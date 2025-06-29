# 📜 Tech-Master スクリプトガイド

## 🎯 Static JSON アーキテクチャ

Tech-Masterは**Firebase完全削除**により、軽量でコスト効率的なStatic JSONアーキテクチャに移行しました。

### ✨ 新しい開発フロー

#### 日常的な記事更新・デプロイ

```bash
# 1. 記事作成
echo "記事内容" > posts/06-new-article.md

# 2. Git操作（自動デプロイ）
git add .
git commit -m "新記事追加"
git push origin main
```

**効果**: GitHub Actions → JSON生成 → Next.jsビルド → Cloud Runデプロイ

#### ローカル開発・テスト

```bash
# JSON生成テスト
npm run generate-json

# ローカル開発サーバー
npm run dev

# プロダクションビルドテスト
npm run build

# 型チェック・Lint
npm run type-check
npm run lint
```

### 🗂️ 削除されたスクリプト（Firebase関連）

以下のスクリプトは**Firebase削除により不要**になりました：

- ~~`deploy-github.sh`~~ → 直接Git操作で自動デプロイ
- ~~`setup-firebase-existing.sh`~~ → Firebase設定不要
- ~~`sync-md.js`~~ → Static JSON生成に置換
- ~~`deploy-api.sh`~~ → API サービス削除済み
- ~~`setup-secrets-from-env.sh`~~ → Firebase Secrets不要
- ~~その他Firebase関連スクリプト~~

## 🚀 現在利用可能なスクリプト

### `generate-static-json.js` ⭐️ 新規

```bash
npm run generate-json
```

**目的**: Markdown → Static JSON変換
**効果**: posts/ → public/data/*.json生成
**使用タイミング**: ビルド時自動実行（手動テストも可能）

**生成ファイル**:
- `public/data/posts.json` - 全記事統合JSON
- `public/data/sections/ai.json` - セクション別JSON
- `public/data/metadata.json` - メタデータ

## 📋 アーキテクチャ比較

### 🔴 以前（Firebase）

```
Markdown → sync-md.js → Firestore → API → Frontend
                                 ↑
                           Firebase依存
                         ($5-25/月コスト)
```

### 🟢 現在（Static JSON）

```
Markdown → generate-static-json.js → Static JSON → Frontend
                                           ↑
                                    Fallback: Markdown
                                     ($0追加コスト)
```

## 🎯 主要な改善点

### ✅ メリット

1. **コスト削減**: Firebase課金 → $0
2. **依存関係削減**: 683パッケージ削除
3. **セキュリティ向上**: 脆弱性削減
4. **パフォーマンス向上**: ビルド時JSON生成
5. **シンプル化**: 環境変数設定不要

### ⚡ パフォーマンス

- **ビルド時間**: 短縮（Firebase同期なし）
- **ランタイム**: 高速（Static JSON読み込み）
- **フォールバック**: JSON → Markdownの二段階

## 🔧 開発・運用フロー

### 日常開発

```bash
# 1. 記事作成
vi posts/07-new-topic.md

# 2. ローカルテスト
npm run generate-json
npm run dev

# 3. 確認・デプロイ
npm run build
git add . && git commit -m "新記事追加"
git push origin main
```

### トラブルシューティング

```bash
# JSON生成エラー
npm run generate-json
cat public/data/metadata.json

# ビルドエラー
npm run type-check
npm run lint

# 記事表示エラー
ls -la public/data/
curl http://localhost:3000/api/posts
```

## 📞 サポート

問題が発生した場合：

1. **JSON生成確認**: `npm run generate-json`
2. **ビルド確認**: `npm run build`
3. **GitHub Actions確認**: Actions タブでログ確認
4. **ドキュメント参照**: README.md、DEPLOYMENT_GUIDE.md

Static JSONアーキテクチャにより、Tech-Masterはより軽量で保守しやすいプラットフォームになりました。