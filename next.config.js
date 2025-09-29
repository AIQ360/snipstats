/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  webpack: (config, { isServer }) => {
    // Add a resolver to redirect imports of @radix-ui/react-use-effect-event to our patch
    config.resolve.alias = {
      ...config.resolve.alias,
      "@radix-ui/react-use-effect-event": require.resolve("./lib/radix-ui-patches.ts"),
    }

    return config
  },
}

module.exports = nextConfig
