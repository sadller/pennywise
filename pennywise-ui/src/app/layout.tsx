import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/stores/StoreProvider";
import ThemeRegistry from "@/components/providers/ThemeRegistry";
import ServiceWorkerRegistration from "@/components/common/ServiceWorkerRegistration";
import NavigationLoader from "../components/common/NavigationLoader";
import PWAProvider from "@/components/providers/PWAProvider";
import AppInitializer from "@/components/providers/AppInitializer";

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
  keywords: ["expense tracker", "budget", "finance", "money management", "pwa"],
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
  other: {
    "application-name": "Pennywise",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "apple-mobile-web-app-title": "Pennywise",
    "format-detection": "telephone=no",
    "mobile-web-app-capable": "yes",
    "msapplication-config": "/browserconfig.xml",
    "msapplication-TileColor": "#1976d2",
    "msapplication-tap-highlight": "no",
    "theme-color": "#1976d2",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#1976d2",
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.png" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icon-192x192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icon-72x72.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icon-72x72.png" />
        <link rel="mask-icon" href="/icon-192x192.png" color="#1976d2" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-status-bar-style" content="default" />
        <meta name="mobile-web-app-title" content="Pennywise" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Pennywise" />
        <meta name="msapplication-TileColor" content="#1976d2" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#1976d2" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <ThemeRegistry>
          <StoreProvider>
            <AppInitializer>
              <NavigationLoader />
              <PWAProvider />
              {children}
              <ServiceWorkerRegistration />
            </AppInitializer>
          </StoreProvider>
        </ThemeRegistry>
      </body>
    </html>
  );
}
