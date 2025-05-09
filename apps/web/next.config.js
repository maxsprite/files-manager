/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["ui", "shared"],
  experimental: {
    // This ensures Next.js processes CSS imports from external packages
    externalDir: true,
  },
};

module.exports = nextConfig;
