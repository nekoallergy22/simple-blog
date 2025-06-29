import { Request, Response } from 'express';
import * as admin from 'firebase-admin';
import matter from 'gray-matter';
import { readFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

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
export const syncMarkdownHandler = async (req: Request, res: Response) => {
  try {
    console.log('📋 Markdownファイル同期開始');
    
    // postsディレクトリを探す（Cloud Runでは相対パスが変わる可能性がある）
    const possiblePaths = [
      join(process.cwd(), 'posts'),
      join(process.cwd(), '..', 'posts'),
      join(__dirname, '..', '..', 'posts'),
      '/app/posts'
    ];
    
    let postsDir = '';
    for (const path of possiblePaths) {
      if (existsSync(path)) {
        postsDir = path;
        break;
      }
    }
    
    if (!postsDir) {
      throw new Error('postsディレクトリが見つかりません');
    }
    
    console.log(`📁 使用するpostsディレクトリ: ${postsDir}`);
    
    // 再帰的にMarkdownファイルを探す
    const findMarkdownFiles = (dir: string): string[] => {
      const files: string[] = [];
      const items = readdirSync(dir, { withFileTypes: true });
      
      for (const item of items) {
        const fullPath = join(dir, item.name);
        if (item.isDirectory()) {
          files.push(...findMarkdownFiles(fullPath));
        } else if (item.name.endsWith('.md')) {
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
      const fileContent = readFileSync(filepath, 'utf8');
      const { data, content } = matter(fileContent);
      
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
    
  } catch (error) {
    console.error('❌ 同期エラー:', error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '不明なエラー',
      timestamp: new Date().toISOString()
    });
  }
};

// ヘルスチェックハンドラー
export const healthCheckHandler = (req: Request, res: Response) => {
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