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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`dark ${fontSans.variable} ${fontHeading.variable}`}>
      <body className="min-h-screen bg-background font-sans text-foreground antialiased selection:bg-primary/20">
        {children}
      </body>
    </html>
  );
}
