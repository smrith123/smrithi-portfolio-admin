import { DM_Mono, DM_Sans } from "next/font/google";
import localFont from "next/font/local";

/** The portfolio's own faces, so the admin reads as part of the same product. */
export const display = localFont({
  src: [
    { path: "../../public/fonts/Starleague-Regular.woff2", weight: "400", style: "normal" },
    { path: "../../public/fonts/Starleague-Bold.woff2", weight: "700", style: "normal" },
    { path: "../../public/fonts/Starleague-Black.woff2", weight: "900", style: "normal" },
  ],
  variable: "--font-starleague",
  display: "swap",
});

export const sans = DM_Sans({ subsets: ["latin"], axes: ["opsz"], variable: "--font-dm-sans", display: "swap" });
export const mono = DM_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-dm-mono", display: "swap" });
