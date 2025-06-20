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

  // カテゴリーごとの色を定義
  const getCategoryColor = (category: string) => {
    const colors = {
      'ai-course': 'bg-blue-500',
      'tech': 'bg-green-500',
      'design': 'bg-purple-500',
      'business': 'bg-orange-500',
      'lifestyle': 'bg-pink-500',
      'default': 'bg-gray-500'
    };
    return colors[category as keyof typeof colors] || colors.default;
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
        <div className={`h-1 ${getCategoryColor(post.category)}`} />
        
        <div className="p-6">
          {/* カテゴリタグ */}
          <div className="mb-3">
            <span className={`inline-block ${getCategoryColor(post.category)} text-white text-xs font-medium px-2 py-1 rounded`}>
              {getCategoryLabel(post.category)}
            </span>
          </div>
          
          {/* タイトル */}
          <h2 className="text-lg font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
            {post.title}
          </h2>
          
          {/* 日付 */}
          <time className="text-gray-400 text-sm">
            {formatDate(post.date)}
          </time>
        </div>
      </article>
    </Link>
  );
}