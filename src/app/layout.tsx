import type { Metadata, Viewport } from "next";
import { DM_Serif_Display, Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingOrbs from "@/components/FloatingOrbs";
import FloatingHearts from "@/components/FloatingHearts";
import { SessionProviderWrapper } from "@/components/SessionProvider";
import { AuthProvider } from "@/context/AuthContext";
import { CoupleProvider } from "@/context/CoupleContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext";
import NotificationManager from "@/components/NotificationManager";
import CallManager from "@/components/CallManager";

import ErrorBoundary from "@/components/ErrorBoundary";

const serif = DM_Serif_Display({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
});

const sans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Comfort App 💕 | Your Love & Care Companion",
  description: "A warm, supportive app for couples. Connect, share moments, and care for each other.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌸</text></svg>",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#FBF8F2",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${serif.variable} ${sans.variable} font-sans antialiased`}>
        <SessionProviderWrapper>
          <ThemeProvider>
            <AuthProvider>
              <CoupleProvider>
                <NotificationProvider>
                  <ErrorBoundary>
                    <NotificationManager />
                    <CallManager />
                    {/* Soft background orbs */}
                    <FloatingOrbs />

                    {/* Ambient floating hearts */}
                    <FloatingHearts />

                    {/* Navigation */}
                    <Navbar />

                    {/* Main content */}
                    <div className="relative z-10 min-h-screen flex flex-col pt-24">
                      {children}
                      <Footer />
                    </div>
                  </ErrorBoundary>
                </NotificationProvider>
              </CoupleProvider>
            </AuthProvider>
          </ThemeProvider>
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
