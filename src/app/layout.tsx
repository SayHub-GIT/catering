import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "Catering-In - Katering Lezat untuk Setiap Momen",
  description: "Catering berkualitas premium dengan pelayanan terbaik. Menyediakan hidangan lezat untuk pernikahan, acara, rapat, dan berbagai momen spesial Anda.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className={`${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
