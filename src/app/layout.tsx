import type { Metadata } from "next";
import { Nunito, DM_Sans, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SmoothScroll } from "@/components/SmoothScroll";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
});

const dmSans = DM_Sans({
  variable: "--font-dmsans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPRAT — Security & Privacy Requirements Analysis Tool",
  description: "Next-generation requirements engineering platform with real-time Flesch readability, goal modeling, and threat scenario analysis.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${dmSans.variable} ${geistMono.variable} antialiased`}
    >
      <body
        className="min-h-screen flex flex-col bg-[#F4F1FA] text-[#332F3A] selection:bg-[#7C3AED]/20 selection:text-[#7C3AED] antialiased"
        style={{ fontFamily: "var(--font-dmsans), -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}
      >
        <SmoothScroll>
          {children}
        </SmoothScroll>
        <Toaster
          position="top-right"
          theme="light"
          toastOptions={{
            style: {
              background: "#ffffff",
              border: "1px solid rgba(160, 150, 180, 0.2)",
              color: "#332F3A",
              borderRadius: "20px",
              boxShadow: "12px 12px 24px rgba(160, 150, 180, 0.2), -6px_-6px_12px #ffffff",
              fontFamily: "var(--font-dmsans), sans-serif",
            },
          }}
        />
      </body>
    </html>
  );
}
