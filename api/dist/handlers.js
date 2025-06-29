"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.healthCheckHandler = exports.syncMarkdownHandler = void 0;
const admin = __importStar(require("firebase-admin"));
const gray_matter_1 = __importDefault(require("gray-matter"));
const fs_1 = require("fs");
const path_1 = require("path");
// Firebase Admin初期化
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
    });
}
const db = admin.firestore();
// Markdownファイル同期ハンドラー
const syncMarkdownHandler = async (req, res) => {
    try {
        console.log('📋 Markdownファイル同期開始');
        // postsディレクトリを探す（Cloud Runでは相対パスが変わる可能性がある）
        const possiblePaths = [
            (0, path_1.join)(process.cwd(), 'posts'),
            (0, path_1.join)(process.cwd(), '..', 'posts'),
            (0, path_1.join)(__dirname, '..', '..', 'posts'),
            '/app/posts'
        ];
        let postsDir = '';
        for (const path of possiblePaths) {
            if ((0, fs_1.existsSync)(path)) {
                postsDir = path;
                break;
            }
        }
        if (!postsDir) {
            throw new Error('postsディレクトリが見つかりません');
        }
        console.log(`📁 使用するpostsディレクトリ: ${postsDir}`);
        // 再帰的にMarkdownファイルを探す
        const findMarkdownFiles = (dir) => {
            const files = [];
            const items = (0, fs_1.readdirSync)(dir, { withFileTypes: true });
            for (const item of items) {
                const fullPath = (0, path_1.join)(dir, item.name);
                if (item.isDirectory()) {
                    files.push(...findMarkdownFiles(fullPath));
                }
                else if (item.name.endsWith('.md')) {
                    files.push(fullPath);
                }
            }
            return files;
        };
        const markdownFiles = findMarkdownFiles(postsDir);
        console.log(`📊 見つかったファイル数: ${markdownFiles.length}`);
        const batch = db.batch();
        const updatedPosts = [];
        for (const filepath of markdownFiles) {
            const fileContent = (0, fs_1.readFileSync)(filepath, 'utf8');
            const { data, content } = (0, gray_matter_1.default)(fileContent);
            // ファイルパスからセクション情報を取得
            const relativePath = filepath.replace(postsDir, '').replace(/^\//, '');
            const pathParts = relativePath.split('/');
            const section = pathParts.length > 1 ? pathParts[0] : 'general';
            const filename = pathParts[pathParts.length - 1];
            // スラッグをファイル名から生成（.mdを除去）
            const slug = data.slug || filename.replace('.md', '');
            const postData = {
                title: data.title || filename.replace('.md', ''),
                content: content,
                slug: slug,
                category: data.category || 'uncategorized',
                section: data.section || section, // セクション情報を追加
                date: data.date || new Date().toISOString().split('T')[0],
                difficulty: data.difficulty || 'beginner',
                number: data.number || 0,
                createdAt: admin.firestore.Timestamp.now(),
                updatedAt: admin.firestore.Timestamp.now()
            };
            const docRef = db.collection('posts').doc(slug);
            batch.set(docRef, postData, { merge: true });
            updatedPosts.push({
                title: postData.title,
                section: postData.section,
                slug: postData.slug
            });
            console.log(`✅ 処理完了: [${postData.section}] ${postData.title}`);
        }
        // バッチ処理実行
        await batch.commit();
        console.log('✅ 全てのファイルをFirestoreに同期完了');
        res.status(200).json({
            success: true,
            message: `${updatedPosts.length}件の記事を同期しました`,
            posts: updatedPosts,
            timestamp: new Date().toISOString()
        });
    }
    catch (error) {
        console.error('❌ 同期エラー:', error);
        res.status(500).json({
            success: false,
            error: error instanceof Error ? error.message : '不明なエラー',
            timestamp: new Date().toISOString()
        });
    }
};
exports.syncMarkdownHandler = syncMarkdownHandler;
// ヘルスチェックハンドラー
const healthCheckHandler = (req, res) => {
    const healthInfo = {
        status: 'ok',
        service: 'Tech Master API',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        firebase: {
            connected: !!admin.apps.length,
            projectId: process.env.FIREBASE_PROJECT_ID || 'not-configured'
        }
    };
    console.log('💓 Health check requested');
    res.status(200).json(healthInfo);
};
exports.healthCheckHandler = healthCheckHandler;
//# sourceMappingURL=handlers.js.map