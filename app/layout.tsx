import type { Metadata } from "next";
import { Providers } from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "PixelCount - Social Timer Gallery",
  description: "Create, share, and view pixel-filling timers and countdowns",
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
