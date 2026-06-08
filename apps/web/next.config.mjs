/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Lint is run separately; don't block builds on it during early development.
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }],
  },
};

export default nextConfig;
