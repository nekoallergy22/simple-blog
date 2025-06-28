'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';

const getSectionInfo = (pathname: string): { title: string; link: string } => {
  if (pathname.startsWith('/ai')) return { title: 'AI学習コース', link: '/ai' };
  if (pathname.startsWith('/python')) return { title: 'Python学習コース', link: '/python' };
  if (pathname.startsWith('/datascience')) return { title: 'データサイエンス学習コース', link: '/datascience' };
  if (pathname.startsWith('/tensorflow')) return { title: 'TensorFlow学習コース', link: '/tensorflow' };
  if (pathname.startsWith('/git')) return { title: 'Git学習コース', link: '/git' };
  if (pathname.startsWith('/docker')) return { title: 'Docker学習コース', link: '/docker' };
  if (pathname.startsWith('/linux')) return { title: 'Linux基礎コース', link: '/linux' };
  if (pathname.startsWith('/contact')) return { title: 'Tech-Master', link: '/' };
  return { title: 'Tech-Master', link: '/' };
};

export default function Header() {
  const pathname = usePathname();
  const sectionInfo = getSectionInfo(pathname);

  return (
    <header className="bg-white shadow-sm">
      <div className="container py-4">
        <h1 className="text-2xl font-bold text-gray-900">
          <a href={sectionInfo.link} className="hover:text-blue-600 transition-colors flex items-center gap-3">
            <Image
              src="/logo-purple.svg"
              alt="Tech-Master Logo"
              width={28}
              height={28}
              priority
            />
            {sectionInfo.title}
          </a>
        </h1>
      </div>
    </header>
  );
}