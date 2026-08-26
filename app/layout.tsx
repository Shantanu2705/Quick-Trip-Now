import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
const fontSans = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const fontHeading = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Quick Trip Now | Premium Travel & Bookings",
  description: "Experience the world's most luxurious and breathtaking destinations with Quick Trip Now.",
};

import NextTopLoader from 'nextjs-toploader';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${fontSans.variable} ${fontHeading.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/20">
        <NextTopLoader
          color="#0ea5e9"
          initialPosition={0.08}
          crawlSpeed={200}
          height={3}
          crawl={true}
          showSpinner={false}
          easing="ease"
          speed={200}
          shadow="0 0 10px #0ea5e9,0 0 5px #0ea5e9"
        />
        {children}
      </body>
    </html>
  );
}
