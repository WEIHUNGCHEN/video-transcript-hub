import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Video Speed Reader",
  description: "Turn any video into an accurate transcript in minutes.",
  openGraph: {
    title: "Video Speed Reader",
    description: "Turn any video into an accurate transcript in minutes.",
    type: "website",
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/favicon.ico" },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#0f1a2e",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
