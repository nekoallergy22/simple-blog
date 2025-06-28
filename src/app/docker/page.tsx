import { getPostsBySection } from '@/lib/posts';
import PostCard from '@/components/PostCard';

export default async function DockerCourse() {
  const posts = await getPostsBySection('docker');

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Docker学習コース
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          コンテナ技術Dockerを使った開発・デプロイメント手法を体系的に学習できるコースです。
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
            <h3 className="mt-2 text-sm font-medium text-gray-900">準備中です</h3>
            <p className="mt-1 text-sm text-gray-500">
              Docker学習コースのコンテンツを準備中です。しばらくお待ちください。
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}
    </div>
  );
}