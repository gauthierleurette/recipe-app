import { withSentryConfig } from "@sentry/nextjs";

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  experimental: {
    instrumentationHook: true,
    outputFileTracingIncludes: {
      "/**": [
        "./node_modules/.prisma/client/**",
        "./node_modules/@sentry/**",
      ],
    },
  },
  async rewrites() {
    return [
      {
        source: "/uploads/:path*",
        destination: "/api/static/:path*",
      },
    ];
  },
};

export default withSentryConfig(nextConfig, {
  silent: true,
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  hideSourceMaps: true,
});
