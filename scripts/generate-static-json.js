#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');

// 設定
const POSTS_DIR = path.join(__dirname, '../posts');
const OUTPUT_DIR = path.join(__dirname, '../public/data');
const SECTIONS = ['ai', 'python', 'datascience', 'tensorflow', 'docker', 'git', 'linux'];

/**
 * Markdownファイルを読み込んでJSONデータに変換
 */
function parseMarkdownFile(filePath, section) {
  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data: frontMatter, content } = matter(fileContent);
    
    // ファイル名からスラッグを生成（番号プレフィックスを除去）
    const fileName = path.basename(filePath, '.md');
    const slug = fileName.replace(/^\d+-/, '');
    
    // 記事データ構造
    const post = {
      id: slug,
      slug: slug,
      title: frontMatter.title || 'Untitled',
      content: content.trim(),
      section: frontMatter.section || section,
      category: frontMatter.category || `${section}-course`,
      date: frontMatter.date || new Date().toISOString().split('T')[0],
      difficulty: frontMatter.difficulty || 'beginner',
      number: frontMatter.number || parseInt(fileName.match(/^\d+/)?.[0]) || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return post;
  } catch (error) {
    console.error(`Error parsing ${filePath}:`, error.message);
    return null;
  }
}

/**
 * 指定セクションの記事を取得
 */
function getPostsFromSection(section) {
  const sectionDir = path.join(POSTS_DIR, section);
  
  if (!fs.existsSync(sectionDir)) {
    console.warn(`Section directory not found: ${sectionDir}`);
    return [];
  }

  const files = fs.readdirSync(sectionDir)
    .filter(file => file.endsWith('.md'))
    .sort();

  const posts = [];
  
  for (const file of files) {
    const filePath = path.join(sectionDir, file);
    const post = parseMarkdownFile(filePath, section);
    
    if (post) {
      posts.push(post);
    }
  }

  return posts;
}

/**
 * メタデータ生成
 */
function generateMetadata(allPosts) {
  const metadata = {
    totalPosts: allPosts.length,
    sections: {},
    categories: {},
    lastUpdated: new Date().toISOString(),
    stats: {
      totalPosts: allPosts.length,
      activeSections: 0,
      latestPost: null
    }
  };

  // セクション別統計
  for (const section of SECTIONS) {
    const sectionPosts = allPosts.filter(post => post.section === section);
    if (sectionPosts.length > 0) {
      metadata.sections[section] = {
        count: sectionPosts.length,
        latestDate: Math.max(...sectionPosts.map(p => new Date(p.date).getTime())),
        posts: sectionPosts.map(p => ({ slug: p.slug, title: p.title, date: p.date }))
      };
      metadata.stats.activeSections++;
    }
  }

  // カテゴリ別統計
  const categories = [...new Set(allPosts.map(p => p.category))];
  for (const category of categories) {
    const categoryPosts = allPosts.filter(post => post.category === category);
    metadata.categories[category] = {
      count: categoryPosts.length,
      section: categoryPosts[0]?.section || 'unknown'
    };
  }

  // 最新記事
  if (allPosts.length > 0) {
    const sortedPosts = allPosts.sort((a, b) => new Date(b.date) - new Date(a.date));
    metadata.stats.latestPost = {
      slug: sortedPosts[0].slug,
      title: sortedPosts[0].title,
      date: sortedPosts[0].date,
      section: sortedPosts[0].section
    };
  }

  return metadata;
}

/**
 * JSONファイルを安全に書き込み
 */
function writeJsonFile(filePath, data) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(`✅ Generated: ${filePath} (${Array.isArray(data) ? data.length : 'metadata'} ${Array.isArray(data) ? 'posts' : 'file'})`);
  } catch (error) {
    console.error(`❌ Failed to write ${filePath}:`, error.message);
    process.exit(1);
  }
}

/**
 * メイン処理
 */
async function main() {
  console.log('🚀 Starting Static JSON Generation...\n');

  // 出力ディレクトリ作成
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  const sectionsDir = path.join(OUTPUT_DIR, 'sections');
  if (!fs.existsSync(sectionsDir)) {
    fs.mkdirSync(sectionsDir, { recursive: true });
  }

  let allPosts = [];

  // セクション別データ生成
  for (const section of SECTIONS) {
    console.log(`📝 Processing section: ${section}`);
    const posts = getPostsFromSection(section);
    
    if (posts.length > 0) {
      // セクション別JSONファイル
      const sectionFilePath = path.join(sectionsDir, `${section}.json`);
      writeJsonFile(sectionFilePath, posts);
      
      allPosts = allPosts.concat(posts);
    } else {
      console.log(`⚠️  No posts found for section: ${section}`);
    }
  }

  // 日付順ソート
  allPosts.sort((a, b) => {
    // number優先、次にdate降順
    if (a.number !== b.number) {
      return a.number - b.number;
    }
    return new Date(b.date) - new Date(a.date);
  });

  // 全記事JSONファイル
  const postsFilePath = path.join(OUTPUT_DIR, 'posts.json');
  writeJsonFile(postsFilePath, allPosts);

  // メタデータファイル
  const metadata = generateMetadata(allPosts);
  const metadataFilePath = path.join(OUTPUT_DIR, 'metadata.json');
  writeJsonFile(metadataFilePath, metadata);

  console.log('\n✨ JSON Generation Complete!');
  console.log(`📊 Total Posts: ${allPosts.length}`);
  console.log(`📁 Active Sections: ${metadata.stats.activeSections}`);
  console.log(`🕒 Generated at: ${new Date().toLocaleString()}`);
}

// エラーハンドリング
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// 実行
if (require.main === module) {
  main().catch(error => {
    console.error('❌ JSON generation failed:', error.message);
    process.exit(1);
  });
}

module.exports = { main, generateMetadata, parseMarkdownFile };