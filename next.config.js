/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  // No basePath needed for custom domain
  images: {
    unoptimized: true,
  },
};

module.exports = nextConfig;
