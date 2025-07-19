import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // Handle pdfjs-dist worker in client-side builds
      config.resolve.alias = {
        ...config.resolve.alias,
      };
    }
    return config;
  },
  // Add headers for the PDF worker file
  async headers() {
    return [
      {
        source: '/pdf.worker.js',
        headers: [
          {
            key: 'Content-Type',
            value: 'application/javascript',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
