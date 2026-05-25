/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES module scope
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  async rewrites() {
    return [
      { source: '/api/:path*', destination: 'http://localhost:8080/api/:path*' },
    ]
  },
};

export default nextConfig;
