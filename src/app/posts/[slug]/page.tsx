import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getAllPosts } from '@/lib/posts';
import MarkdownRenderer from '@/components/MarkdownRenderer';
import { Metadata } from 'next';

interface PostPageProps {
  params: {
    slug: string;
  };
}

// Remove generateStaticParams for development mode
// export async function generateStaticParams() {
//   try {
//     const posts = await getAllPosts();
//     return posts.map((post) => ({
//       slug: post.slug,
//     }));
//   } catch (error) {
//     console.log('Error generating static params:', error);
//     return [];
//   }
// }

export async function generateMetadata({ params }: PostPageProps): Promise<Metadata> {
  try {
    const post = await getPostBySlug(params.slug);
    
    if (!post) {
      return {
        title: '記事が見つかりません',
      };
    }

    return {
      title: `${post.title} - Simple Blog`,
      description: post.content.replace(/#{1,6}\s+/g, '').substring(0, 160),
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: '記事が見つかりません',
    };
  }
}

export default async function PostPage({ params }: PostPageProps) {
  try {
    const post = await getPostBySlug(params.slug);

    if (!post) {
      notFound();
    }

    // Get all posts to find previous and next posts
    const allPosts = await getAllPosts();
    const currentIndex = allPosts.findIndex(p => p.slug === post.slug);
    const previousPost = currentIndex > 0 ? allPosts[currentIndex - 1] : null;
    const nextPost = currentIndex < allPosts.length - 1 ? allPosts[currentIndex + 1] : null;

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
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

    return (
      <article className="max-w-5xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium mb-6 transition-colors"
          >
            <svg 
              className="mr-2 w-4 h-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            記事一覧に戻る
          </Link>
          
          <div className="flex flex-wrap items-center gap-4 mb-6">
            <span className={`inline-block ${getLevelColor(post.level)} text-white text-sm font-medium px-3 py-1 rounded-full`}>
              {post.category === 'ai-course' ? 'AIコース' : post.category}
            </span>
            {post.number && (
              <span className="inline-block bg-gray-100 text-gray-700 text-sm font-bold px-3 py-1 rounded-full">
                No.{post.number.toString().padStart(2, '0')}
              </span>
            )}
            <time className="text-gray-500 text-sm">
              {formatDate(post.date)}
            </time>
          </div>
          
          <h1 className="text-4xl font-bold text-gray-900 leading-tight">
            {post.title}
          </h1>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex-1">
            {previousPost && (
              <Link 
                href={`/posts/${previousPost.slug}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors group"
              >
                <svg className="mr-2 w-5 h-5 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </Link>
            )}
          </div>
          
          <div className="mx-4">
            <Link 
              href="/" 
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              記事一覧に戻る
            </Link>
          </div>
          
          <div className="flex-1 flex justify-end">
            {nextPost && (
              <Link 
                href={`/posts/${nextPost.slug}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors group"
              >
                Next
                <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            )}
          </div>
        </div>
      </article>
    );
  } catch (error) {
    console.error('Error rendering post page:', error);
    notFound();
  }
}