import Link from 'next/link';
import { Post } from '@/types';

interface PostCardProps {
  post: Post;
}

export default function PostCard({ post }: PostCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
    });
  };

  // Levelごとの色を定義
  const getLevelColor = (level?: number) => {
    const colors = {
      1: 'bg-green-500',
      2: 'bg-blue-500', 
      3: 'bg-purple-500',
      'default': 'bg-gray-500'
    };
    return colors[level as keyof typeof colors] || colors.default;
  };

  const getCategoryLabel = (category: string) => {
    const labels = {
      'ai-course': 'AIコース',
      'tech': 'テクノロジー',
      'design': 'デザイン',
      'business': 'ビジネス',
      'lifestyle': 'ライフスタイル'
    };
    return labels[category as keyof typeof labels] || category;
  };

  return (
    <Link href={`/posts/${post.slug}`}>
      <article className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow duration-200 overflow-hidden cursor-pointer group">
        {/* カラーバー */}
        <div className={`h-1 ${getLevelColor(post.level)}`} />
        
        <div className="p-6">
          {/* 記事番号 */}
          <div className="mb-3 flex justify-end">
            {post.number && (
              <span className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded">
                No.{post.number.toString().padStart(2, '0')}
              </span>
            )}
          </div>
          
          {/* タイトル */}
          <h2 className="text-lg font-semibold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
          
          {/* 日付とカテゴリタグ */}
          <div className="flex items-center justify-between">
            <time className="text-gray-400 text-sm">
              {formatDate(post.date)}
            </time>
            <span className={`inline-block ${getLevelColor(post.level)} text-white text-xs font-medium px-2 py-1 rounded`}>
              {getCategoryLabel(post.category)}
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}