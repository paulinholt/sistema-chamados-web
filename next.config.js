// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    middleware: {
      // Desabilitar o Edge Runtime para o middleware
      skipMiddlewareUrlNormalize: true,
      skipTrailingSlashRedirect: true,
    },
  },
}

module.exports = nextConfig
