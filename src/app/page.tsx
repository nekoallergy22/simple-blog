import Link from 'next/link';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tech-Master - 技術学習プラットフォーム',
  description: 'AI、Python、データサイエンス、TensorFlow、Git、Docker、Linuxなど、現代の技術スキルを体系的に学習できるプラットフォーム。基礎から応用まで段階的に学習し、実際の開発現場で使えるスキルを身につけましょう。',
  openGraph: {
    title: 'Tech-Master - 技術学習プラットフォーム',
    description: 'AI、Python、データサイエンス、TensorFlow、Git、Docker、Linuxなど、現代の技術スキルを体系的に学習できるプラットフォーム',
    url: 'https://tech-master.com',
    type: 'website',
  },
};

const techSections = [
  {
    id: 'ai',
    title: 'AI学習コース',
    description: 'AIの基礎から応用まで、3段階のレベルで体系的に学習',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-blue-500',
    textColor: 'text-blue-600',
    bgColor: 'bg-blue-50',
    path: '/ai',
    status: '24記事公開中'
  },
  {
    id: 'python',
    title: 'Python学習コース',
    description: 'プログラミング言語Pythonを基礎から応用まで学習',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
    color: 'bg-green-500',
    textColor: 'text-green-600',
    bgColor: 'bg-green-50',
    path: '/python',
    status: '準備中'
  },
  {
    id: 'datascience',
    title: 'データサイエンス学習コース',
    description: 'データの収集・分析・可視化から機械学習まで包括的に学習',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    color: 'bg-purple-500',
    textColor: 'text-purple-600',
    bgColor: 'bg-purple-50',
    path: '/datascience',
    status: '準備中'
  },
  {
    id: 'tensorflow',
    title: 'TensorFlow学習コース',
    description: 'Googleの機械学習ライブラリを使った深層学習の実装',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
    color: 'bg-orange-500',
    textColor: 'text-orange-600',
    bgColor: 'bg-orange-50',
    path: '/tensorflow',
    status: '準備中'
  },
  {
    id: 'git',
    title: 'Git学習コース',
    description: 'バージョン管理システムGitを基礎から応用まで学習',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    ),
    color: 'bg-red-500',
    textColor: 'text-red-600',
    bgColor: 'bg-red-50',
    path: '/git',
    status: '準備中'
  },
  {
    id: 'docker',
    title: 'Docker学習コース',
    description: 'コンテナ技術Dockerを使った開発・デプロイメント手法を学習',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    color: 'bg-cyan-500',
    textColor: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    path: '/docker',
    status: '準備中'
  },
  {
    id: 'linux',
    title: 'Linux基礎コース',
    description: 'Linux操作の基本からシステム管理まで実践的に学習',
    icon: (
      <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
      </svg>
    ),
    color: 'bg-yellow-500',
    textColor: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    path: '/linux',
    status: '準備中'
  },
];

export default function HomePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: 'Tech-Master',
    description: 'AI、Python、データサイエンス、TensorFlow、Git、Docker、Linuxなど、現代の技術スキルを体系的に学習できるプラットフォーム',
    url: 'https://tech-master.com',
    logo: 'https://tech-master.com/logo.svg',
    hasEducationalUse: [
      'AI学習',
      'Python学習',
      'データサイエンス学習',
      'TensorFlow学習',
      'Git学習',
      'Docker学習',
      'Linux学習'
    ],
    educationalLevel: 'beginner to advanced',
    inLanguage: 'ja',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-extrabold text-gray-900 mb-8 leading-tight">
            学びの質を、<br className="sm:hidden" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              最高峰に
            </span>
          </h1>
          <p className="text-2xl text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
            現代のテクノロジーを体系的に習得する、<br />
            プロフェッショナルのための学習プラットフォーム
          </p>
          <p className="text-lg text-gray-500 max-w-xl mx-auto">
            基礎から実践まで。段階的なカリキュラムで確実にスキルアップ。
          </p>
        </div>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {techSections.map((section) => (
          <Link
            key={section.id}
            href={section.path}
            className="group block p-8 bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-200"
          >
            <div className="flex items-start space-x-4">
              <div className={`p-3 rounded-lg ${section.bgColor} ${section.textColor} group-hover:scale-105 transition-transform duration-200`}>
                {section.icon}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 mb-2">
                  {section.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed mb-3">
                  {section.description}
                </p>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  section.status === '準備中' 
                    ? 'bg-gray-100 text-gray-600' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {section.status}
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      </div>
    </>
  );
}