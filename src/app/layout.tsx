import type { Metadata, Viewport } from "next";
import { Quicksand } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingOrbs from "@/components/FloatingOrbs";
import FloatingHearts from "@/components/FloatingHearts";
import { CoupleProvider } from "@/context/CoupleContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { NotificationProvider } from "@/context/NotificationContext";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Comfort App 💕 | Your Love & Care Companion",
  description: "A warm, supportive app for those difficult days. Made with love by Shaker for Keerthi.",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🌸</text></svg>",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#fef7f7",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${quicksand.variable} font-sans antialiased`}>
        <ThemeProvider>
          <CoupleProvider>
            <NotificationProvider>
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
            </NotificationProvider>
          </CoupleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

