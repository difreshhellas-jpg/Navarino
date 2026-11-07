import type { NextConfig } from "next";

/**
 * Static export only. The site is uploaded by FTP to ip.gr shared hosting,
 * which has no Node runtime, so every route is prerendered into /out.
 *
 * trailingSlash: Apache serves /en/ as /en/index.html with no rewrite rules.
 * images.unoptimized: there is no image server; src/components/Photo.tsx
 * reads the AVIF/WebP sets that scripts/images.mjs writes ahead of time.
 */
const config: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Two root layouts (el, en) need a 404 that brings its own <html>.
    globalNotFound: true,
  },
};

export default config;
