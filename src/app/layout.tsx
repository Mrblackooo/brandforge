import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
});

export const metadata: Metadata = {
  title: "BrandForge — AI Brand Identity Generator",
  description:
    "Turn a single sentence into a complete brand system in under 2 minutes. No designers, no strategists, no guesswork.",
  openGraph: {
    title: "BrandForge — AI Brand Identity Generator",
    description:
      "Turn a single sentence into a complete brand system in under 2 minutes.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BrandForge — AI Brand Identity Generator",
    description:
      "Turn a single sentence into a complete brand system in under 2 minutes.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jakarta.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}