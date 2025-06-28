export default function TensorFlowCourse() {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          TensorFlow学習コース
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Googleが開発した機械学習ライブラリTensorFlowを使った深層学習の実装方法を学習できるコースです。
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        <h3 className="text-xl font-medium text-gray-900 mb-2">コンテンツ準備中</h3>
        <p className="text-gray-600">TensorFlow学習コースの内容を準備中です。しばらくお待ちください。</p>
      </div>
    </div>
  );
}