/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [],
  },
  output: 'standalone',
  
  // Functions ディレクトリを除外
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
  
  // Font optimization を無効化（GitHub Actions での問題回避）
  optimizeFonts: false,
};

module.exports = nextConfig;