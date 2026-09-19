import type { NextConfig } from "next";
import { PHASE_PRODUCTION_BUILD } from "next/constants";

/*
 * NEXT_PUBLIC_* values are baked into the bundle at build time. A production
 * build without them would silently point the live admin at localhost, so it
 * fails here instead. On Vercel, localhost values are refused as well.
 */
function assertPublicUrls(phase: string) {
  if (phase !== PHASE_PRODUCTION_BUILD) return;
  for (const name of ["NEXT_PUBLIC_BACKEND_URL", "NEXT_PUBLIC_STOREFRONT_URL"]) {
    const value = process.env[name];
    if (!value) throw new Error(`${name} must be set for a production build (see .env.example).`);
    if (process.env.VERCEL && /localhost|127\.0\.0\.1/.test(value)) throw new Error(`${name} points at localhost on Vercel.`);
  }
}

export default function config(phase: string): NextConfig {
  assertPublicUrls(phase);
  return {
    // The admin must never appear in search results or inside another site's frame.
    // (Not a robots.txt block: crawlers have to be able to fetch a page to see its noindex.)
    async headers() {
      return [
        {
          source: "/:path*",
          headers: [
            { key: "X-Robots-Tag", value: "noindex, nofollow" },
            { key: "X-Frame-Options", value: "DENY" },
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "same-origin" },
          ],
        },
      ];
    },
  };
}
