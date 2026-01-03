import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelCount - Social Timer Gallery",
  description: "Create, share, and view beautiful pixel-filling timers and countdowns. Watch as pixels fill the screen to visualize time passing.",
  keywords: ["timer", "countdown", "pixel art", "visual timer", "productivity", "time tracking"],
  authors: [{ name: "PixelCount" }],
  openGraph: {
    title: "PixelCount - Social Timer Gallery",
    description: "Create, share, and view beautiful pixel-filling timers and countdowns",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PixelCount - Social Timer Gallery",
    description: "Create, share, and view beautiful pixel-filling timers and countdowns",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-slate-950 text-white">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
