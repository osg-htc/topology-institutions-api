/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: process.env.NODE_ENV === 'production' ? '/ui' : '',
  trailingSlash: true,
};

export default nextConfig;
