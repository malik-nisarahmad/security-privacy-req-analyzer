import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SPRAT — Security & Privacy Requirements Analysis Tool",
  description: "Minimalist, high-assurance Requirements Engineering platform adhering to SRS v2.00 (R1–R10)",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#09090b] text-zinc-100 selection:bg-zinc-800 selection:text-white font-sans">
        {children}
        <Toaster
          position="top-right"
          theme="dark"
          toastOptions={{
            style: {
              background: "#18181b",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              color: "#f4f4f5",
            },
          }}
          richColors
        />
      </body>
    </html>
  );
}
