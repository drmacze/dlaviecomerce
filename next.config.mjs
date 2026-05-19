/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  eslint: { dirs: ['pages', 'components', 'lib', 'stores'] },
  typescript: { ignoreBuildErrors: false }
};

export default nextConfig;
