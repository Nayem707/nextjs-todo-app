/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
};

export default nextConfig;
