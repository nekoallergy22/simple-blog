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

    const formatDate = (dateString: string) => {
      return new Date(dateString).toLocaleDateString('ja-JP', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    };

    return (
      <article className="max-w-4xl mx-auto">
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
            <span className="inline-block bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
              {post.category}
            </span>
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

        <div className="mt-8 flex justify-center">
          <Link 
            href="/" 
            className="btn-primary"
          >
            記事一覧に戻る
          </Link>
        </div>
      </article>
    );
  } catch (error) {
    console.error('Error rendering post page:', error);
    notFound();
  }
}