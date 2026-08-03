import type { NextConfig } from "next";

// Baseline security headers. No Content-Security-Policy yet: the app uses an
// inline theme script and inline styles, so a CSP would need nonces threaded
// through the layout — worth doing before launch, but it is not a one-liner.
const securityHeaders = [
  // Don't let other origins frame the site (clickjacking).
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  // Trust declared content types instead of sniffing.
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send the origin but not the path/query cross-origin. This also stops the
  // order confirmation URL (which carries ?e=<email>) leaking to third parties.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  // Nothing here needs these device APIs.
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  // Only takes effect over HTTPS; harmless over plain HTTP.
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
];

const nextConfig: NextConfig = {
  // Product photography currently lives on the supplier's CDN. Routing it
  // through next/image means the browser requests /_next/image on our own
  // origin — the source host never appears in a customer-facing URL, and the
  // optimiser caches each asset so repeat views don't hit their servers.
  // Replace these hosts once the images are mirrored or licensed directly.
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "uk.rs-online.com" },
      { protocol: "https", hostname: "*.rs-online.com" },
    ],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
