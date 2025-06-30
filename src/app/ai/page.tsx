import { getPostsBySection } from '@/lib/posts';
import PostCard from '@/components/PostCard';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI学習コース',
  description: 'AIの基礎から応用まで、3段階のレベルで体系的に学習できるコースです。機械学習、深層学習、自然言語処理、コンピュータビジョンなど、AI技術を幅広くカバーしています。',
  openGraph: {
    title: 'AI学習コース | Tech-Master',
    description: 'AIの基礎から応用まで、3段階のレベルで体系的に学習できるコースです。',
  },
};

export default async function AICourse() {
  const posts = await getPostsBySection('ai');

  // Group posts by category
  const postsByCategory = posts.reduce((acc, post) => {
    const category = post.category || '基礎編';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(post);
    return acc;
  }, {} as Record<string, typeof posts>);

  const getCategoryInfo = (category: string) => {
    const info = {
      '目次': { title: '目次', description: 'AI学習コース完全ガイド - 全コースの体系的な学習ロードマップ', color: 'bg-amber-100 text-amber-800', barColor: 'bg-amber-500' },
      '基礎編': { title: '基礎編', description: 'AIの基本概念と機械学習の基礎を学ぶ', color: 'bg-green-100 text-green-800', barColor: 'bg-green-500' },
      '強化学習・評価編': { title: '強化学習・評価編', description: '強化学習、モデル評価、ニューラルネットワークの基礎', color: 'bg-blue-100 text-blue-800', barColor: 'bg-blue-500' },
      '学習アルゴリズム編': { title: '学習アルゴリズム編', description: '誤差逆伝播法、最適化、各種層の詳細', color: 'bg-purple-100 text-purple-800', barColor: 'bg-purple-500' },
      'RNN・Attention編': { title: 'RNN・Attention編', description: '時系列処理、Attention、Transformer、オートエンコーダ', color: 'bg-orange-100 text-orange-800', barColor: 'bg-orange-500' },
      '画像・NLP編': { title: '画像・NLP編', description: 'CNN、物体検出、自然言語処理、大規模言語モデル', color: 'bg-teal-100 text-teal-800', barColor: 'bg-teal-500' },
      '生成・応用技術編': { title: '生成・応用技術編', description: 'GAN、拡散モデル、転移学習、マルチモーダル', color: 'bg-indigo-100 text-indigo-800', barColor: 'bg-indigo-500' },
      '実装・運用編': { title: '実装・運用編', description: 'モデル解釈性、軽量化、MLOps、データ管理', color: 'bg-pink-100 text-pink-800', barColor: 'bg-pink-500' },
      '数理・統計基礎編': { title: '数理・統計基礎編', description: '確率・統計、距離・類似度の数学的基礎', color: 'bg-yellow-100 text-yellow-800', barColor: 'bg-yellow-500' },
      '法律・契約編': { title: '法律・契約編', description: '個人情報保護法、知的財産権、AI開発契約', color: 'bg-red-100 text-red-800', barColor: 'bg-red-500' },
      '社会実装・倫理編': { title: '社会実装・倫理編', description: 'AI倫理、ガバナンス、社会への影響', color: 'bg-slate-100 text-slate-800', barColor: 'bg-slate-500' }
    };
    return info[category] || { title: category, description: '', color: 'bg-gray-100 text-gray-800', barColor: 'bg-gray-500' };
  };

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          AI学習コース
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          10のカテゴリに分けて、AIについて基礎から応用まで体系的に学習できるコースです。
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
          {['目次', '基礎編', '強化学習・評価編', '学習アルゴリズム編', 'RNN・Attention編', '画像・NLP編', '生成・応用技術編', '実装・運用編', '数理・統計基礎編', '法律・契約編', '社会実装・倫理編'].map((category) => {
            const categoryPosts = postsByCategory[category] || [];
            const categoryInfo = getCategoryInfo(category);
            
            return (
              <section key={category} id={`category-${category}`} className="space-y-4">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900">{categoryInfo.title}</h2>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${categoryInfo.color}`}>
                      {categoryPosts.length}記事
                    </span>
                  </div>
                  <p className="text-gray-600 mt-2">{categoryInfo.description}</p>
                </div>
                
                {categoryPosts.length > 0 ? (
                  <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {categoryPosts.map((post) => (
                      <PostCard key={post.id} post={post} />
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">{categoryInfo.title}は準備中です</h3>
                    <p className="text-gray-600">記事を準備中です。しばらくお待ちください。</p>
                  </div>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}