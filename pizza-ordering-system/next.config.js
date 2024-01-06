/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:11609/api/:path*",
      },
    ];
  },
};

module.exports = nextConfig;
