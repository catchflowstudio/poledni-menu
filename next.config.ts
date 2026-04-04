import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
  async headers() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://*.supabase.co";
    let supabaseHost = "*.supabase.co";
    try {
      supabaseHost = new URL(supabaseUrl).host;
    } catch { /* fallback */ }

    const baseCsp = `default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' https://${supabaseHost}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://${supabaseHost}; frame-ancestors 'none'; base-uri 'self'; form-action 'self';`;
    const menuCsp = `default-src 'self'; script-src 'self' 'unsafe-inline'; img-src 'self' https://${supabaseHost}; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; connect-src 'self' https://${supabaseHost}; base-uri 'self';`;

    return [
      {
        // Security headers pro admin routy
        source: "/:slug/admin/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "Content-Security-Policy", value: baseCsp },
        ],
      },
      {
        // Security headers pro API endpointy
        source: "/api/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        // Veřejná menu stránka — povolíme iframe (embed na webu restaurace)
        source: "/:slug/menu",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: menuCsp },
          // Žádný X-Frame-Options — musí fungovat v iframe
        ],
      },
      {
        // HSTS + základní headers pro vše
        source: "/(.*)",
        headers: [
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
