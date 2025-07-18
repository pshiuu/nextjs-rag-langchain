/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@langchain/core", "@langchain/community", "langchain"],
  },
  webpack: (config) => {
    // Ignore canvas module for PDF parsing
    config.resolve.alias.canvas = false;
    
    // Handle node modules for Edge Runtime
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };
    
    return config;
  },
};

export default nextConfig;
