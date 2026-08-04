/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fully static build. Everything runs in the browser, so Cloudflare Pages
  // only has to serve the contents of ./out (plus the /functions proxy).
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  serverExternalPackages: ['pdfjs-dist', 'tesseract.js'],
  webpack: (config) => {
    // pdf.js and friends probe for optional Node-only packages during the
    // server compile. They are never used in the browser build.
    config.resolve.alias = {
      ...config.resolve.alias,
      canvas: false,
      encoding: false,
    };
    return config;
  },
};

export default nextConfig;
