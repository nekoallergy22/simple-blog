# Tech Master API - Cloud Run Dockerfile
FROM node:18-alpine AS builder

# 作業ディレクトリ設定
WORKDIR /app

# package.json と package-lock.json をコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm ci --only=production

# ソースコードをコピー
COPY . .

# TypeScriptビルド
RUN npm run build

# 本番用イメージ
FROM node:18-alpine AS runner

# 必要なパッケージをインストール
RUN apk add --no-cache curl

# セキュリティ: 非rootユーザーを作成
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

WORKDIR /app

# 本番用依存関係のみをコピー
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package*.json ./

# postsディレクトリをコピー（Markdownファイル用）
COPY ../posts ./posts

# 権限設定
RUN chown -R nextjs:nodejs /app
USER nextjs

# ヘルスチェック
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1

# ポート公開
EXPOSE 8080

# 環境変数
ENV NODE_ENV=production
ENV PORT=8080

# アプリケーション起動
CMD ["npm", "start"]