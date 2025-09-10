// In next.config.mjs
import withPWA from 'next-pwa';

// 1. Define the PWA wrapper with its options
const withPwaConfig = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'data.hyrosy.com',
        port: '',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'd2ucgc4rch4k6r.cloudfront.net',
      },
    ],
  },
};

// 3. Export the final result of wrapping your nextConfig with the PWA config
export default withPwaConfig(nextConfig);