import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SettingsProvider } from "@/components/SettingsProvider";
import GlobalLogger from "@/components/GlobalLogger";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Relevant articles",
  description: "News Aggregator",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="theme-dark min-h-full flex flex-col" suppressHydrationWarning>
        <GlobalLogger />
        <SettingsProvider>
          {children}
        </SettingsProvider>
      </body>
    </html>
  );
}
