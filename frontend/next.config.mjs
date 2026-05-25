/** @type {import('next').NextConfig} */
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve __dirname in ES module scope
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const nextConfig = {
  // Set turbopack root to the monorepo root directory
  turbopack: {
    root: path.resolve(__dirname, '..'),
  },
  // Add additional Next.js config options here if needed
};

export default nextConfig;
