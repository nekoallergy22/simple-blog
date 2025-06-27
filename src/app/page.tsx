import { getAllPosts } from '@/lib/posts';
import PostCard from '@/components/PostCard';

export default async function HomePage() {
  const posts = await getAllPosts();

  // Group posts by level
  const postsByLevel = posts.reduce((acc, post) => {
    const level = post.level || 1;
    if (!acc[level]) {
      acc[level] = [];
    }
    acc[level].push(post);
    return acc;
  }, {} as Record<number, typeof posts>);

  const getLevelInfo = (level: number) => {
    const info = {
      1: { title: 'Level 1: 基礎編', description: 'AIの基本概念を学ぶ', color: 'bg-green-100 text-green-800', barColor: 'bg-green-500' },
      2: { title: 'Level 2: 中級編', description: 'より深い技術的理解を身につける', color: 'bg-blue-100 text-blue-800', barColor: 'bg-blue-500' },
      3: { title: 'Level 3: 上級編', description: '実践的な応用スキルを習得する', color: 'bg-purple-100 text-purple-800', barColor: 'bg-purple-500' }
    };
    return info[level as keyof typeof info] || { title: `Level ${level}`, description: '', color: 'bg-gray-100 text-gray-800', barColor: 'bg-gray-500' };
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI学習コース
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          3段階のレベルに分けて、AIについて基礎から応用まで体系的に学習できるコースです。
        </p>
      </div>

      {posts.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg 
              className="mx-auto h-12 w-12 text-gray-400" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">記事がありません</h3>
            <p className="mt-1 text-sm text-gray-500">
              まだ記事が投稿されていません。最初の記事を作成しましょう。
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {[1, 2, 3].map((level) => {
            const levelPosts = postsByLevel[level] || [];
            const levelInfo = getLevelInfo(level);
            
            return (
              <section key={level} className="space-y-4">
                <div className={`rounded-lg border-l-4 ${levelInfo.barColor} bg-white p-4 shadow-sm`}>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">{levelInfo.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${levelInfo.color}`}>
                      {levelPosts.length}記事
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">{levelInfo.description}</p>
                </div>
                
                {levelPosts.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {levelPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : level === 3 ? (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">上級編は準備中です</h3>
                    <p className="text-gray-600">より高度なAI技術の内容を準備中です。しばらくお待ちください。</p>
                  </div>
                ) : null}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}