import Link from 'next/link';

export default function NotFound() {
  return (
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
            d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
          />
        </svg>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">404</h1>
        <h2 className="mt-2 text-xl font-medium text-gray-900">ページが見つかりません</h2>
        <p className="mt-2 text-gray-500">
          お探しのページは存在しないか、移動された可能性があります。
        </p>
        <div className="mt-6">
          <Link href="/" className="btn-primary">
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}