/** @type {import('next').NextConfig} */
const backendUrl =
process.env.BACKEND_URL || "http://localhost:3001";

const nextConfig = {
  eslint: {
    dirs: ["src/app", "src/components", "src/lib"],
  },
  async rewrites() {
    return [
      {
        source: "/api/v1/:path*",
        destination: `${backendUrl}/api/v1/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
