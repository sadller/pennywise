import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pennywise - Expense Tracker",
  description: "A modern, collaborative expense tracking app for individuals and groups",
  keywords: ["expense tracker", "budget", "finance", "money management"],
  authors: [{ name: "Pennywise Team" }],
  creator: "Pennywise Team",
  publisher: "Pennywise",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://pennywise.app"),
  openGraph: {
    title: "Pennywise - Expense Tracker",
    description: "A modern, collaborative expense tracking app for individuals and groups",
    url: "https://pennywise.app",
    siteName: "Pennywise",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Pennywise - Expense Tracker",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pennywise - Expense Tracker",
    description: "A modern, collaborative expense tracking app for individuals and groups",
    images: ["/og-image.png"],
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1976d2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Pennywise" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        {children}
      </body>
    </html>
  );
}
