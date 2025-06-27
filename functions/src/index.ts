import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import matter from 'gray-matter';
import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';

// Firebase Admin初期化
if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

// Markdownファイル同期関数
export const syncMarkdownFiles = functions
  .region('asia-northeast1')
  .https.onRequest(async (req, res) => {
    try {
      console.log('📋 Markdownファイル同期開始');
      
      // postsディレクトリからマークダウンファイルを取得
      const postsDir = join(process.cwd(), 'posts');
      const filenames = readdirSync(postsDir).filter(name => name.endsWith('.md'));
      
      console.log(`📊 見つかったファイル数: ${filenames.length}`);
      
      const batch = db.batch();
      const updatedPosts = [];
      
      for (const filename of filenames) {
        const filepath = join(postsDir, filename);
        const fileContent = readFileSync(filepath, 'utf8');
        const { data, content } = matter(fileContent);
        
        // スラッグをファイル名から生成（.mdを除去）
        const slug = data.slug || filename.replace('.md', '');
        
        const postData = {
          title: data.title || filename.replace('.md', ''),
          content: content,
          slug: slug,
          category: data.category || 'uncategorized',
          date: data.date ? admin.firestore.Timestamp.fromDate(new Date(data.date)) : admin.firestore.Timestamp.now(),
          createdAt: admin.firestore.Timestamp.now(),
          updatedAt: admin.firestore.Timestamp.now()
        };
        
        const docRef = db.collection('posts').doc(slug);
        batch.set(docRef, postData, { merge: true });
        updatedPosts.push(postData.title);
        
        console.log(`✅ 処理完了: ${postData.title}`);
      }
      
      // バッチ処理実行
      await batch.commit();
      
      console.log('✅ 全てのファイルをFirestoreに同期完了');
      
      res.status(200).json({
        success: true,
        message: `${updatedPosts.length}件の記事を同期しました`,
        posts: updatedPosts
      });
      
    } catch (error) {
      console.error('❌ 同期エラー:', error);
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : '不明なエラー'
      });
    }
  });

// ヘルスチェック関数
export const healthCheck = functions
  .region('asia-northeast1')
  .https.onRequest((req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      message: 'Simple Blog Functions is running'
    });
  });
