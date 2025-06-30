import Link from "next/link";
import { Metadata } from "next";
import { getPostsBySection } from "@/lib/posts";

export const metadata: Metadata = {
  title: "Tech-Master - 技術学習プラットフォーム",
  description:
    "AI、Python、データサイエンス、TensorFlow、Git、Docker、Linuxなど、現代の技術スキルを体系的に学習できるプラットフォーム。基礎から応用まで段階的に学習し、実際の開発現場で使えるスキルを身につけましょう。",
  openGraph: {
    title: "Tech-Master - 技術学習プラットフォーム",
    description:
      "AI、Python、データサイエンス、TensorFlow、Git、Docker、Linuxなど、現代の技術スキルを体系的に学習できるプラットフォーム",
    url: "https://techmaster.dev",
    type: "website",
  },
};

const getTechSections = (aiPostsCount: number) => [
  {
    id: "ai",
    title: "AI学習コース",
    description: "AIの基礎から最新技術まで、10のカテゴリで体系的に学習できる包括的なコース",
    icon: "psychology", // Material Icons
    color: "bg-blue-500",
    textColor: "text-blue-600",
    bgColor: "bg-blue-50",
    path: "/ai",
    status: `${aiPostsCount}記事公開中`,
  },
  {
    id: "python",
    title: "Python学習コース",
    description: "プログラミング言語Pythonを基礎から応用まで学習",
    icon: "code", // Material Icons
    color: "bg-green-500",
    textColor: "text-green-600",
    bgColor: "bg-green-50",
    path: "/python",
    status: "準備中",
  },
  {
    id: "datascience",
    title: "データサイエンス学習コース",
    description: "データの収集・分析・可視化から機械学習まで包括的に学習",
    icon: "analytics", // Material Icons
    color: "bg-purple-500",
    textColor: "text-purple-600",
    bgColor: "bg-purple-50",
    path: "/datascience",
    status: "準備中",
  },
  {
    id: "tensorflow",
    title: "TensorFlow学習コース",
    description: "Googleの機械学習ライブラリを使った深層学習の実装",
    icon: "memory", // Material Icons
    color: "bg-orange-500",
    textColor: "text-orange-600",
    bgColor: "bg-orange-50",
    path: "/tensorflow",
    status: "準備中",
  },
  {
    id: "git",
    title: "Git学習コース",
    description: "バージョン管理システムGitを基礎から応用まで学習",
    icon: "account_tree", // Material Icons
    color: "bg-red-500",
    textColor: "text-red-600",
    bgColor: "bg-red-50",
    path: "/git",
    status: "準備中",
  },
  {
    id: "docker",
    title: "Docker学習コース",
    description: "コンテナ技術Dockerを使った開発・デプロイメント手法を学習",
    icon: "developer_board", // Material Icons
    color: "bg-cyan-500",
    textColor: "text-cyan-600",
    bgColor: "bg-cyan-50",
    path: "/docker",
    status: "準備中",
  },
  {
    id: "linux",
    title: "Linux基礎コース",
    description: "Linux操作の基本からシステム管理まで実践的に学習",
    icon: "terminal", // Material Icons
    color: "bg-yellow-500",
    textColor: "text-yellow-600",
    bgColor: "bg-yellow-50",
    path: "/linux",
    status: "準備中",
  },
];

export default async function HomePage() {
  // Get actual AI course posts count
  const aiPosts = await getPostsBySection('ai');
  const aiPostsCount = aiPosts.length;
  
  // Get tech sections with dynamic data
  const techSections = getTechSections(aiPostsCount);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Tech-Master",
    description:
      "AI、Python、データサイエンス、TensorFlow、Git、Docker、Linuxなど、現代の技術スキルを体系的に学習できるプラットフォーム",
    url: "https://techmaster.dev",
    logo: "https://techmaster.dev/logo.svg",
    hasEducationalUse: [
      "AI学習",
      "Python学習",
      "データサイエンス学習",
      "TensorFlow学習",
      "Git学習",
      "Docker学習",
      "Linux学習",
    ],
    educationalLevel: "beginner to advanced",
    inLanguage: "ja",
  };

  return (
    <>
      <link
        href="https://fonts.googleapis.com/icon?family=Material+Icons"
        rel="stylesheet"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="space-y-12">
        <div className="text-center mb-16">
          <h1 className="text-6xl font-extrabold text-gray-900 mb-8 leading-tight">
            学びの質を、
            <br className="sm:hidden" />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              最高峰に
            </span>
          </h1>
          <p className="text-2xl text-gray-600 max-w-2xl mx-auto mb-6 leading-relaxed">
            現代のテクノロジーを体系的に習得する、
            <br />
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
                <div
                  className={`p-3 rounded-lg ${section.bgColor} ${section.textColor} group-hover:scale-105 transition-transform duration-200`}
                >
                  <span className="material-icons text-5xl">
                    {section.icon}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-xl font-semibold text-gray-900 group-hover:text-gray-700 mb-2">
                    {section.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    {section.description}
                  </p>
                  <span
                    className={`px-3 py-1 text-xs font-medium rounded-full ${
                      section.status === "準備中"
                        ? "bg-gray-100 text-gray-600"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >
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
