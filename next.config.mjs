// In next.config.mjs
import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your regular Next.js config goes here
  experimental: {},
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'data.hyrosy.com',
        pathname: '/wp-content/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'd2ucgc4rch4k6r.cloudfront.net',
      },
    ],
  },
};

// PWA configuration is now separate and wraps the main config
const configWithPWA = withPWA({
  dest: 'public', // This is the correct destination for App Router
  register: true,
  skipWaiting: true,
  // The 'disable' flag is not needed here, as Vercel's NODE_ENV will be 'production'
})(nextConfig);

export default configWithPWA;