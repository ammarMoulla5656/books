import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import DarkModeHandler from "@/components/DarkModeHandler";
import ContextMenuProvider from "@/components/ContextMenuProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Islamic Library - Islamic Books",
  description: "Comprehensive Islamic library with AI-powered features for Islamic jurisprudence books",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Islamic Library"
  },
  formatDetection: {
    telephone: false
  },
  openGraph: {
    type: "website",
    siteName: "Islamic Library",
    title: "Islamic Library - Islamic Books",
    description: "Comprehensive Islamic library with AI-powered features"
  },
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }]
  }
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#0d7377'
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ContextMenuProvider>
          <DarkModeHandler />
          <Navigation />
          {children}
        </ContextMenuProvider>
      </body>
    </html>
  );
}
