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
                  Simple Blog
                </a>
              </h1>
            </div>
          </header>
          
          <main className="container py-8 flex-grow">
            {children}
          </main>
          
          <footer className="bg-gray-800 text-white mt-auto">
            <div className="container py-6">
              <p className="text-center text-gray-400">
                © 2024 Simple Blog. All rights reserved.
              </p>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}