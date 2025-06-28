import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getPostBySlug, getPostsBySection } from '@/lib/posts';
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

    const description = post.content
      .replace(/#{1,6}\s+/g, '')
      .replace(/\n/g, ' ')
      .substring(0, 160);

    return {
      title: `${post.title}`,
      description: description,
      keywords: ['AI学習', post.title, 'Tech-Master', '機械学習', '深層学習'],
      openGraph: {
        title: `${post.title} | Tech-Master`,
        description: description,
        type: 'article',
        publishedTime: post.date,
        authors: ['Tech-Master'],
        section: 'AI学習',
        tags: ['AI', '機械学習', '深層学習'],
      },
      twitter: {
        card: 'summary_large_image',
        title: `${post.title} | Tech-Master`,
        description: description,
      },
      alternates: {
        canonical: `/ai/posts/${post.slug}`,
      },
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


    // Get AI section posts to find previous and next posts
    const sectionPosts = await getPostsBySection('ai');
    const currentIndex = sectionPosts.findIndex(p => p.slug === post.slug);
    const previousPost = currentIndex > 0 ? sectionPosts[currentIndex - 1] : null;
    const nextPost = currentIndex < sectionPosts.length - 1 ? sectionPosts[currentIndex + 1] : null;

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

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: post.title,
      description: post.content.replace(/#{1,6}\s+/g, '').replace(/\n/g, ' ').substring(0, 160),
      author: {
        '@type': 'Organization',
        name: 'Tech-Master',
      },
      publisher: {
        '@type': 'Organization',
        name: 'Tech-Master',
        logo: {
          '@type': 'ImageObject',
          url: 'https://tech-master.com/logo.svg',
        },
      },
      datePublished: post.date,
      dateModified: post.updatedAt?.toISOString() || post.date,
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': `https://tech-master.com/ai/posts/${post.slug}`,
      },
      articleSection: 'AI学習',
      keywords: ['AI学習', '機械学習', '深層学習', post.title],
      inLanguage: 'ja',
    };

    return (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <article className="max-w-5xl mx-auto">
          <div style={{ marginBottom: '32px', textAlign: 'center' }}>
            <div style={{ marginBottom: '24px' }}>
              <div 
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '64px',
                  height: '64px',
                  background: 'linear-gradient(135deg, #eff6ff 0%, #faf5ff 100%)',
                  border: '2px solid #93c5fd',
                  borderRadius: '50%',
                  color: '#2563eb',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                }}
              >
                {post.number ? post.number.toString().padStart(2, '0') : '00'}
              </div>
            </div>
            
            <h1 style={{ 
              fontSize: '36px', 
              fontWeight: 'bold', 
              color: '#111827', 
              lineHeight: '1.2', 
              marginBottom: '24px',
              margin: '0 auto',
              maxWidth: '800px'
            }}>
              {post.title}
            </h1>

            <div className="flex flex-wrap items-center justify-center gap-4 mb-6">
              <span className={`inline-block ${getLevelColor(post.level)} text-white text-sm font-medium px-3 py-1 rounded-full`}>
                {post.category === 'ai-course' ? 'AIコース' : post.category}
              </span>
              <time className="text-gray-500 text-sm">
                {formatDate(post.date)}
              </time>
            </div>
          </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <MarkdownRenderer content={post.content} />
        </div>

        {/* Navigation buttons */}
        <div className="mt-8 flex items-center justify-between">
          <div className="flex-1">
            {previousPost && (
              <Link 
                href={`/ai/posts/${previousPost.slug}`}
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
              href="/ai" 
              className="inline-flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              コース一覧に戻る
            </Link>
          </div>
          
          <div className="flex-1 flex justify-end">
            {nextPost && (
              <Link 
                href={`/ai/posts/${nextPost.slug}`}
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
      </>
    );
  } catch (error) {
    console.error('Error rendering post page:', error);
    notFound();
  }
}