import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Haka Workspace",
  description: "Professional workspace application for Haka - Manage your tasks and stay productive",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Sidebar />
        <main className="lg:ml-64 min-h-screen overflow-x-hidden">
          {/* Mobile: pt-18 (navbar h-14 + py-4), Desktop: pt-8 */}
          <div className="w-full max-w-full px-4 py-4 lg:px-8 pt-18 lg:pt-8">
            {children}
          </div>
        </main>
      </body>
    </html>
  );
}
