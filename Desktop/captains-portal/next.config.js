/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['www.captainsfc.com'],
  },
  experimental: {
    serverComponentsExternalPackages: ['googleapis'],
  },
}

module.exports = nextConfig
