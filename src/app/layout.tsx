import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ConditionalLayout } from "@/components/layout/ConditionalLayout";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Jaffna Medical Centre | Modern Healthcare in Jaffna",
  description: "Experience world-class healthcare at Jaffna Medical Centre. Book appointments, find doctors, and manage your health online.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-inter">
        <ConditionalLayout>
          {children}
        </ConditionalLayout>
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
