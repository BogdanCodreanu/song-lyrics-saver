import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "🥁 Capoeira Songs",
  description: "Learn traditional Capoeira lyrics and songs. Practice call-and-response with audio and video references.",
  openGraph: {
    title: "🥁 Capoeira Songs",
    description: "Learn traditional Capoeira lyrics and songs. Practice call-and-response with audio and video references.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "🥁 Capoeira Songs",
    description: "Learn traditional Capoeira lyrics and songs. Practice call-and-response with audio and video references.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
            {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
