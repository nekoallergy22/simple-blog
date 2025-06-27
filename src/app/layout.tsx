import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Simple Blog',
  description: 'A simple blog built with Next.js and Firebase',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <header className="bg-white shadow-sm">
            <div className="container py-4">
              <h1 className="text-2xl font-bold text-gray-900">
                <a href="/" className="hover:text-blue-600 transition-colors">
                  AI学習コース
                </a>
              </h1>
            </div>
          </header>
          
          <main className="container py-8 flex-grow mb-12">
            {children}
          </main>
          
          <footer className="bg-gray-800 text-white mt-auto">
            <div className="container py-8">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div>
                  <h3 className="text-lg font-semibold mb-3">AI学習コース</h3>
                  <p className="text-gray-400 text-sm">
                    人工知能について基礎から応用まで、3段階のレベルで体系的に学習できるコースです。
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">コース内容</h3>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li><a href="/#level-1" className="hover:text-white transition-colors">Level 1: 基礎編（10記事）</a></li>
                    <li><a href="/#level-2" className="hover:text-white transition-colors">Level 2: 中級編（10記事）</a></li>
                    <li><span className="text-gray-500">Level 3: 上級編（準備中）</span></li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">関連コース</h3>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li><a href="#" className="hover:text-white transition-colors cursor-not-allowed">Python入門（準備中）</a></li>
                    <li><a href="#" className="hover:text-white transition-colors cursor-not-allowed">TensorFlow入門（準備中）</a></li>
                    <li><a href="#" className="hover:text-white transition-colors cursor-not-allowed">データサイエンス基礎（準備中）</a></li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-4">
                <p className="text-center text-gray-400 text-sm">
                  © 2024 AI学習コース - Simple Blog. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}