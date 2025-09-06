import type React from "react";
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Suspense } from "react";
import ThreadsBackground from "@/components/threads-background";

export const metadata: Metadata = {
  title: "WeatherNow",
  description:
    "Global weather with pinned cities, hometown, and drag & drop – stored locally",
  generator: "v0.app",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}
        style={{
          margin: 0,
          padding: 0,
          width: "100vw",
          height: "100vh",
          background: "rgb(5, 10, 25)",
          position: "relative",
          overflow: "hidden"
        }}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <div style={{
            position: "fixed",
            inset: 0,
            zIndex: 0,
            background: "rgb(5, 10, 25)",
            opacity: 0.8
          }} />
          <ThreadsBackground />
          <div style={{ 
            position: "relative", 
            zIndex: 1,
            minHeight: "100vh",
            pointerEvents: "auto"
          }}>
            <Suspense fallback={null}>
              {children}
              <Analytics />
            </Suspense>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
