const https = require('https');
const http = require('http');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

// API URL の決定
function getApiUrl() {
  console.log('🔍 Environment check:');
  console.log(`  NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`  API_URL: ${process.env.API_URL}`);
  
  // 本番環境での API URL (Cloud Run)
  if (process.env.NODE_ENV === 'production' || process.env.API_URL) {
    const apiUrl = process.env.API_URL || `https://tech-master-api-[hash]-an.a.run.app`;
    console.log(`🌐 Using production API URL: ${apiUrl}`);
    return apiUrl;
  }
  
  // ローカル開発環境
  console.log('🏠 Using local development URL');
  return 'http://localhost:8080';
}

// HTTP リクエスト関数
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    
    const req = client.request(url, {
      method: options.method || 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Tech-Master-Sync-Script/1.0',
        ...options.headers
      },
      timeout: 30000, // 30秒タイムアウト
    }, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          resolve({ status: res.statusCode, data: response });
        } catch (error) {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
    
    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    
    req.end();
  });
}

// Markdown同期実行
async function syncMarkdown() {
  const apiUrl = getApiUrl();
  const syncEndpoint = `${apiUrl}/sync-markdown`;
  
  console.log('📋 Cloud Run API経由でMarkdown同期開始');
  console.log(`🌐 API URL: ${syncEndpoint}`);
  
  try {
    // まずヘルスチェック
    console.log('💓 API ヘルスチェック...');
    const healthResponse = await makeRequest(`${apiUrl}/health`, { method: 'GET' });
    
    if (healthResponse.status === 200) {
      console.log('✅ API サービス稼働中');
      if (healthResponse.data.firebase) {
        console.log(`🔥 Firebase接続: ${healthResponse.data.firebase.connected ? '✅' : '❌'}`);
      }
    } else {
      throw new Error(`Health check failed: ${healthResponse.status}`);
    }
    
    // Markdown同期実行
    console.log('📄 Markdown同期実行中...');
    const syncResponse = await makeRequest(syncEndpoint, {
      headers: {
        'User-Agent': 'Tech-Master-Sync-Script/1.0'
      }
    });
    
    if (syncResponse.status === 200) {
      const result = syncResponse.data;
      console.log('✅ Markdown同期完了!');
      console.log(`📊 同期した記事数: ${result.posts ? result.posts.length : 'N/A'}`);
      
      if (result.posts && result.posts.length > 0) {
        console.log('📝 同期された記事:');
        result.posts.forEach((post, index) => {
          console.log(`  ${index + 1}. [${post.section || 'general'}] ${post.title}`);
        });
      }
      
      console.log(`⏰ 同期時刻: ${result.timestamp || new Date().toISOString()}`);
    } else {
      throw new Error(`Sync failed: ${syncResponse.status} - ${JSON.stringify(syncResponse.data)}`);
    }
    
  } catch (error) {
    console.error('❌ 同期エラー:', error.message);
    
    // フォールバック: 元のスクリプトを実行
    console.log('🔄 フォールバック: ローカル同期スクリプト実行');
    try {
      require('./sync-md');
    } catch (fallbackError) {
      console.error('❌ フォールバック同期もエラー:', fallbackError.message);
      process.exit(1);
    }
  }
}

// 実行
if (require.main === module) {
  syncMarkdown().catch((error) => {
    console.error('❌ 予期しないエラー:', error);
    process.exit(1);
  });
}

module.exports = { syncMarkdown };