import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { syncMarkdownHandler, healthCheckHandler } from './handlers';

// 環境変数読み込み
dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

// ミドルウェア設定
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ログミドルウェア
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// ルート定義
app.post('/sync-markdown', syncMarkdownHandler);
app.get('/health', healthCheckHandler);

// ルート
app.get('/', (req, res) => {
  res.json({
    service: 'Tech Master API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: 'GET /health',
      syncMarkdown: 'POST /sync-markdown'
    }
  });
});

// エラーハンドリング
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ Unhandled error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
});

// 404ハンドリング
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// サーバー起動
app.listen(port, () => {
  console.log(`🚀 Tech Master API Server running on port ${port}`);
  console.log(`📋 Available endpoints:`);
  console.log(`   GET  /health - Health check`);
  console.log(`   POST /sync-markdown - Sync markdown files to Firestore`);
});

export default app;