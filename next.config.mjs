// next.config.mjs
/** @type {import('next').NextConfig} */
const nextConfig = {
    
    experimental: {
    turbo: false, // 👈 disable Turbopack and use Webpack (stable)
  },
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: 'data.hyrosy.com',
                port: '',
                pathname: '/wp-content/uploads/**',
            },
            // START: Added section
            {
                protocol: 'https',
                hostname: 'd2ucgc4rch4k6r.cloudfront.net',
            },
            // END: Added section
        ],
    },
};

export default nextConfig;