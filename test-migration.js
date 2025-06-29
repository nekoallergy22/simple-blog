#!/usr/bin/env node

/**
 * Static JSON移行テストスクリプト
 */

const fs = require('fs');
const path = require('path');

console.log('🚀 Static JSON移行テストを開始');

// JSONファイルの存在確認
const requiredFiles = [
  'public/data/posts.json',
  'public/data/metadata.json',
  'public/data/sections/ai.json'
];

console.log('\n📂 ファイル存在確認:');
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`✅ ${file} (${Math.round(stats.size / 1024)}KB)`);
  } else {
    console.log(`❌ ${file} - 見つかりません`);
    process.exit(1);
  }
});

// JSONデータの整合性確認
console.log('\n🔍 データ整合性確認:');

try {
  // posts.json確認
  const postsData = JSON.parse(fs.readFileSync('public/data/posts.json', 'utf8'));
  console.log(`✅ posts.json: ${postsData.length}記事`);
  
  // ai.json確認
  const aiData = JSON.parse(fs.readFileSync('public/data/sections/ai.json', 'utf8'));
  console.log(`✅ ai.json: ${aiData.length}記事`);
  
  // metadata.json確認
  const metaData = JSON.parse(fs.readFileSync('public/data/metadata.json', 'utf8'));
  console.log(`✅ metadata.json: ${metaData.totalPosts}記事、${metaData.stats.activeSections}セクション`);
  
  // データ一貫性確認
  if (postsData.length === aiData.length && postsData.length === metaData.totalPosts) {
    console.log('✅ データ一貫性: 正常');
  } else {
    console.log('⚠️ データ一貫性: 不一致の可能性');
  }
  
} catch (error) {
  console.log('❌ JSON解析エラー:', error.message);
  process.exit(1);
}

// パフォーマンス比較
console.log('\n📊 パフォーマンス比較:');

const markdownDir = 'posts';
const markdownFiles = fs.readdirSync(markdownDir).filter(f => f.endsWith('.md'));
console.log(`📝 Markdownファイル: ${markdownFiles.length}個`);

const jsonFileSize = fs.statSync('public/data/posts.json').size;
const markdownTotalSize = markdownFiles.reduce((total, file) => {
  return total + fs.statSync(path.join(markdownDir, file)).size;
}, 0);

console.log(`📦 JSON総サイズ: ${Math.round(jsonFileSize / 1024)}KB`);
console.log(`📦 Markdown総サイズ: ${Math.round(markdownTotalSize / 1024)}KB`);
console.log(`📈 圧縮率: ${Math.round((markdownTotalSize - jsonFileSize) / markdownTotalSize * 100)}%削減`);

console.log('\n✨ Static JSON移行テスト完了 - すべて正常');