import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Image from "next/image";
import Header from "@/components/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    template: "%s | Tech-Master",
    default: "Tech-Master - 技術学習プラットフォーム",
  },
  description:
    "AI、Python、データサイエンス、TensorFlow、Git、Docker、Linuxなど、現代の技術スキルを体系的に学習できるプラットフォーム。基礎から応用まで段階的に学習し、実際の開発現場で使えるスキルを身につけましょう。",
  keywords: [
    "AI学習",
    "Python",
    "データサイエンス",
    "TensorFlow",
    "Git",
    "Docker",
    "Linux",
    "技術学習",
    "プログラミング",
    "機械学習",
  ],
  authors: [{ name: "Tech-Master" }],
  creator: "Tech-Master",
  publisher: "Tech-Master",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://techmaster.dev"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "ja_JP",
    url: "https://techmaster.dev",
    title: "Tech-Master - 技術学習プラットフォーム",
    description:
      "AI、Python、データサイエンス、TensorFlow、Git、Docker、Linuxなど、現代の技術スキルを体系的に学習できるプラットフォーム",
    siteName: "Tech-Master",
    images: [
      {
        url: "/logo.svg",
        width: 40,
        height: 40,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tech-Master - 技術学習プラットフォーム",
    description:
      "AI、Python、データサイエンス、TensorFlow、Git、Docker、Linuxなど、現代の技術スキルを体系的に学習できるプラットフォーム",
    images: ["/logo.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      <head>
        <link rel="icon" type="image/svg+xml" href="/logo-purple.svg" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#3B82F6" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className={inter.className}>
        <div className="min-h-screen bg-gray-50 flex flex-col">
          <Header />

          <main className="container py-8 flex-grow mb-12">{children}</main>

          <footer className="bg-gray-800 text-white mt-auto">
            <div className="container py-8">
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div>
                  <a
                    href="/"
                    className="flex items-center gap-2 mb-3 hover:opacity-80 transition-opacity w-fit"
                  >
                    <Image
                      src="/logo-white.svg"
                      alt="Tech-Master Logo"
                      width={20}
                      height={20}
                    />
                    <h3 className="text-lg font-semibold">Tech-Master</h3>
                  </a>
                  <p className="text-gray-400 text-sm">
                    あらゆる技術分野を網羅した学習プラットフォーム。現代の技術スキルを体系的に学習できます。
                  </p>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">学習コース</h3>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>
                      <a
                        href="/"
                        className="hover:text-white transition-colors"
                      >
                        ホーム
                      </a>
                    </li>
                    <li>
                      <a
                        href="/ai"
                        className="hover:text-white transition-colors"
                      >
                        AI学習コース
                      </a>
                    </li>
                    <li>
                      <a
                        href="/python"
                        className="hover:text-white transition-colors"
                      >
                        Python学習コース
                      </a>
                    </li>
                    <li>
                      <a
                        href="/datascience"
                        className="hover:text-white transition-colors"
                      >
                        データサイエンス学習コース
                      </a>
                    </li>
                    <li>
                      <a
                        href="/tensorflow"
                        className="hover:text-white transition-colors"
                      >
                        TensorFlow学習コース
                      </a>
                    </li>
                    <li>
                      <a
                        href="/git"
                        className="hover:text-white transition-colors"
                      >
                        Git学習コース
                      </a>
                    </li>
                    <li>
                      <a
                        href="/docker"
                        className="hover:text-white transition-colors"
                      >
                        Docker学習コース
                      </a>
                    </li>
                    <li>
                      <a
                        href="/linux"
                        className="hover:text-white transition-colors"
                      >
                        Linux基礎コース
                      </a>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-3">
                    お問い合わせ・サポート
                  </h3>
                  <ul className="text-gray-400 text-sm space-y-1">
                    <li>
                      <a
                        href="/contact#contact"
                        className="hover:text-white transition-colors"
                      >
                        お問い合わせ
                      </a>
                    </li>
                    <li>
                      <a
                        href="/contact#faq"
                        className="hover:text-white transition-colors"
                      >
                        よくある質問
                      </a>
                    </li>
                    <li>
                      <a
                        href="/contact#privacy"
                        className="hover:text-white transition-colors"
                      >
                        プライバシーポリシー
                      </a>
                    </li>
                    <li>
                      <a
                        href="/contact#terms"
                        className="hover:text-white transition-colors"
                      >
                        利用規約
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
              <div className="border-t border-gray-700 pt-4">
                <p className="text-center text-gray-400 text-sm">
                  © 2024 Tech-Master. All rights reserved.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  );
}
