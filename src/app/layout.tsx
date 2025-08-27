import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SML Tavern",
  description: "We have the information you need.",
  openGraph: {
    title: "SML Tavern",
    description: "We have the information you need.",
    url: "https://sml-nom-market.vercel.app/",
    siteName: "SML Tavern",
    images: [
      {
        url: "https://sml-nom-market.vercel.app/assets/logosml.png",
        width: 1200,
        height: 630,
        alt: "SML Tavern Logo",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SML Tavern",
    description: "We have the information you need.",
    images: ["https://sml-nom-market.vercel.app/assets/logosml.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Toaster />
        <ThemeProvider attribute="class" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
