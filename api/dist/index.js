"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const handlers_1 = require("./handlers");
// 環境変数読み込み
dotenv_1.default.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
// ミドルウェア設定
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// ログミドルウェア
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
    next();
});
// ルート定義
app.post('/sync-markdown', handlers_1.syncMarkdownHandler);
app.get('/health', handlers_1.healthCheckHandler);
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
app.use((err, req, res, next) => {
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
exports.default = app;
//# sourceMappingURL=index.js.map