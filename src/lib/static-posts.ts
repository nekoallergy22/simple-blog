import { Post } from '@/types';
import fs from 'fs';
import path from 'path';

/**
 * 静的JSONファイルからデータを取得するユーティリティ
 */

let postsCache: Post[] | null = null;
let sectionsCache: { [key: string]: Post[] } = {};
let metadataCache: any = null;

/**
 * 全記事データを取得（キャッシュ対応）
 */
export async function getPostsFromStatic(): Promise<Post[]> {
  if (postsCache) {
    return postsCache;
  }

  try {
    let posts: Post[];
    
    // サーバーサイドの場合はファイルシステムから直接読み込み
    if (typeof window === 'undefined') {
      const filePath = path.join(process.cwd(), 'public', 'data', 'posts.json');
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        posts = JSON.parse(fileContent);
      } else {
        throw new Error('posts.json not found');
      }
    } else {
      // クライアントサイドはfetchを使用
      const response = await fetch('/data/posts.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch posts.json: ${response.status}`);
      }
      posts = await response.json();
    }
    
    // Date オブジェクトに変換
    const processedPosts = posts.map(post => ({
      ...post,
      createdAt: new Date(post.createdAt),
      updatedAt: new Date(post.updatedAt)
    }));
    
    postsCache = processedPosts;
    return processedPosts;
  } catch (error) {
    console.error('Error fetching static posts:', error);
    throw error;
  }
}

/**
 * スラッグで記事を取得
 */
export async function getPostBySlugFromStatic(slug: string): Promise<Post | null> {
  try {
    const posts = await getPostsFromStatic();
    return posts.find(post => post.slug === slug) || null;
  } catch (error) {
    console.error('Error getting post by slug from static:', error);
    return null;
  }
}

/**
 * セクション別記事取得（キャッシュ対応）
 */
export async function getPostsBySectionFromStatic(section: string): Promise<Post[]> {
  if (sectionsCache[section]) {
    return sectionsCache[section];
  }

  try {
    let posts: Post[];
    
    // サーバーサイドの場合はファイルシステムから直接読み込み
    if (typeof window === 'undefined') {
      const filePath = path.join(process.cwd(), 'public', 'data', 'sections', `${section}.json`);
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        posts = JSON.parse(fileContent);
      } else {
        // セクションファイルが存在しない場合は全記事から絞り込み
        const allPosts = await getPostsFromStatic();
        const sectionPosts = allPosts.filter(post => post.section === section);
        sectionsCache[section] = sectionPosts;
        return sectionPosts;
      }
    } else {
      // クライアントサイドはfetchを使用
      const response = await fetch(`/data/sections/${section}.json`);
      if (!response.ok) {
        // セクションファイルが存在しない場合は全記事から絞り込み
        const allPosts = await getPostsFromStatic();
        const sectionPosts = allPosts.filter(post => post.section === section);
        sectionsCache[section] = sectionPosts;
        return sectionPosts;
      }
      posts = await response.json();
    }
    
    // Date オブジェクトに変換
    const processedPosts = posts.map(post => ({
      ...post,
      createdAt: new Date(post.createdAt),
      updatedAt: new Date(post.updatedAt)
    }));
    
    sectionsCache[section] = processedPosts;
    return processedPosts;
  } catch (error) {
    console.error(`Error fetching section ${section} from static:`, error);
    
    // フォールバック: 全記事から絞り込み
    try {
      const allPosts = await getPostsFromStatic();
      const sectionPosts = allPosts.filter(post => post.section === section);
      sectionsCache[section] = sectionPosts;
      return sectionPosts;
    } catch (fallbackError) {
      console.error('Fallback also failed:', fallbackError);
      return [];
    }
  }
}

/**
 * カテゴリ別記事取得
 */
export async function getPostsByCategoryFromStatic(category: string): Promise<Post[]> {
  try {
    const posts = await getPostsFromStatic();
    return posts.filter(post => post.category === category);
  } catch (error) {
    console.error('Error getting posts by category from static:', error);
    return [];
  }
}

/**
 * メタデータ取得
 */
export async function getMetadataFromStatic(): Promise<any> {
  if (metadataCache) {
    return metadataCache;
  }

  try {
    let metadata: any;
    
    // サーバーサイドの場合はファイルシステムから直接読み込み
    if (typeof window === 'undefined') {
      const filePath = path.join(process.cwd(), 'public', 'data', 'metadata.json');
      if (fs.existsSync(filePath)) {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        metadata = JSON.parse(fileContent);
      } else {
        throw new Error('metadata.json not found');
      }
    } else {
      // クライアントサイドはfetchを使用
      const response = await fetch('/data/metadata.json');
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata.json: ${response.status}`);
      }
      metadata = await response.json();
    }
    metadataCache = metadata;
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata from static:', error);
    return {
      totalPosts: 0,
      sections: {},
      categories: {},
      lastUpdated: new Date().toISOString(),
      stats: { totalPosts: 0, activeSections: 0, latestPost: null }
    };
  }
}

/**
 * キャッシュクリア（開発時用）
 */
export function clearStaticCache(): void {
  postsCache = null;
  sectionsCache = {};
  metadataCache = null;
}

/**
 * 開発環境でのキャッシュクリア
 */
if (process.env.NODE_ENV === 'development') {
  // 開発環境では一定時間でキャッシュをクリア
  setInterval(() => {
    clearStaticCache();
  }, 30000); // 30秒
}