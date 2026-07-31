import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const projectDirectory = path.dirname(fileURLToPath(import.meta.url));
const monorepoRoot = path.resolve(projectDirectory, '../..');

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: monorepoRoot,
  outputFileTracingIncludes: {
    '/*': ['../../dist/**/*', '../../lib/db/drizzle/*.sql'],
  },
  serverExternalPackages: ['drizzle-orm', 'pg'],
  turbopack: {
    root: monorepoRoot,
  },
  experimental: {
    optimizePackageImports: ['lucide-react', '@react-three/drei'],
  },
};

export default nextConfig;
