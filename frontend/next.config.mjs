/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        remotePatterns: [
          {
            protocol: 'https',
            hostname: '0qqxuledrhazw1ce.public.blob.vercel-storage.com',
            port: '',
          },
        ],
      },
};

export default nextConfig;
