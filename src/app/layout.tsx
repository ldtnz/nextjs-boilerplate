import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { SerwistProvider } from "@serwist/next/react";
import ZoomLock from "@/components/ZoomLock";
import OfflineNotice from "@/components/OfflineNotice";
import { APP_DESCRIPTION, APP_NAME, THEME_COLOR } from "@/lib/app";
import "./globals.css";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: APP_NAME,
  description: APP_DESCRIPTION,
  icons: {
    icon: [{ url: "/icon-512.png", sizes: "512x512", type: "image/png" }],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
  appleWebApp: {
    title: APP_NAME,
    // The page draws under the status bar; every top edge pads by
    // env(safe-area-inset-top) to stay clear of it.
    statusBarStyle: "black-translucent",
  },
  other: {
    // Next only emits the standard "mobile-web-app-capable". iOS still wants
    // the legacy tag before it honours the home-screen launch settings.
    "apple-mobile-web-app-capable": "yes",
  },
};

export const viewport: Viewport = {
  themeColor: THEME_COLOR,
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
  // Required for env(safe-area-inset-*) to return real values on notched
  // phones, given the translucent status bar above.
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      // The background is set on <html> as well as <body>: the root's
      // background is what paints the whole canvas, and a body taken out of
      // flow (the dialog scroll lock pins it) no longer hands its own up.
      className={`${geistSans.variable} ${geistMono.variable} h-full bg-background antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <SerwistProvider swUrl="/sw.js" disable={process.env.NODE_ENV === "development"}>
          <ZoomLock />
          {children}
          <OfflineNotice />
        </SerwistProvider>
      </body>
    </html>
  );
}
