import type { Metadata, Viewport } from "next";
import { Geist_Mono, Kanit } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";
import { cn } from "@/lib/utils";
import { IosStatusBarScrollToTop } from "@/components/ios-status-bar-scroll-to-top";
import { Toaster } from "@/components/ui/sonner";
import { QueryProvider } from "@/components/providers/query-provider";

const koreanAirSans = localFont({
  src: [
    {
      path: "../public/fonts/KoreanAirSansKR_W_Rg.woff2",
      weight: "400 600",
      style: "normal",
    },
    {
      path: "../public/fonts/KoreanAirSansKR_W_Bd.woff2",
      weight: "700 900",
      style: "normal",
    },
  ],
  variable: "--font-korean-air-local",
  display: "swap",
});

const kanit = Kanit({
  weight: ["400", "600", "700", "800", "900"],
  subsets: ["thai", "latin"],
  variable: "--font-kanit",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "가현쨩과 미누쿤의 모노가타리 🇹🇭",
  description: "두 사람이 함께 준비하는 방콕 여행 메이트 웹 앱",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
    apple: "/apple-icon.ico",
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "현쨩❤️미누쿤",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  interactiveWidget: "overlays-content",
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={cn("h-[100svh] w-full overflow-hidden overscroll-none", "antialiased", koreanAirSans.variable, geistMono.variable, kanit.variable, "font-sans")}
    >
      <body className="min-h-full w-full bg-white">
        <div
          aria-hidden
          className="pointer-events-none fixed inset-x-0 top-0 z-[500] bg-white"
          style={{ height: "env(safe-area-inset-top, 0px)" }}
        />
        <div className="fixed inset-0 isolate flex flex-col overflow-hidden overscroll-none bg-white">
          <QueryProvider>
            {children}
            <IosStatusBarScrollToTop />
            <Toaster position="top-center" />
          </QueryProvider>
        </div>
      </body>
    </html>
  );
}
