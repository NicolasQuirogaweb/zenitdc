import type { NextConfig } from "next";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  `default-src 'self'`,
  // 'unsafe-eval' solo en desarrollo: React/Turbopack lo necesitan para el hot reload
  // y las herramientas de debugging. En producción React nunca usa eval().
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  `style-src 'self' 'unsafe-inline'`,
  `img-src 'self' data: blob: ${supabaseUrl}`,
  `connect-src 'self' ${supabaseUrl}`,
  `worker-src 'self'`,
  `manifest-src 'self'`,
  `frame-ancestors 'none'`,
].join('; ')

const nextConfig: NextConfig = {
  // PWA: permite que la app se instale desde el navegador
  headers: async () => [
    {
      source: "/(.*)",
      headers: [
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "X-Frame-Options",
          value: "DENY",
        },
        {
          key: "Referrer-Policy",
          value: "strict-origin-when-cross-origin",
        },
        {
          key: "Content-Security-Policy",
          value: csp,
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=31536000; includeSubDomains",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=()",
        },
      ],
    },
  ],
};

export default nextConfig;