import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Drilling Platform MVP",
  description: "Analytics Dashboard for drilling operations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0B0F19] text-white min-h-screen`}>
        <main className="p-8">
          {children}
        </main>
      </body>
    </html>
  );
}
