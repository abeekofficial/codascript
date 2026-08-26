import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import QueryProvider from "@/providers/QueryProvider";
import AuthProvider from "@/providers/AuthProvider";
import { QuizProvider } from "@/contexts/QuizContext";

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://codascript.vercel.app",
  ),
  title: {
    default: "CodaScript | Dasturlashni o'rganish platformasi",
    template: "%s | CodaScript",
  },
  description:
    "O'zbek tilida dasturlashni interaktiv tarzda o'rganing. HTML, CSS, JavaScript, React va TypeScript bo'yicha amaliy mashg'ulotlar va quizlar.",
  keywords: [
    "dasturlash",
    "o'rganish",
    "javascript",
    "react",
    "o'zbek tilida",
    "dasturlash kurslari",
    "codascript",
  ],
  authors: [{ name: "CodaScript Team" }],
  openGraph: {
    title: "CodaScript | Dasturlashni o'rganish platformasi",
    description:
      "O'zbek tilida dasturlashni interaktiv tarzda o'rganing. Dasturlash bo'yicha eng yaxshi platforma.",
    url: "/",
    siteName: "CodaScript",
    locale: "uz_UZ",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "CodaScript",
    description: "O'zbek tilida dasturlashni interaktiv tarzda o'rganing.",
  },
  verification: {
    google: "6s9u9QP6NWU4BBAyLnl66NdiZ4khra3jgkk1u4QKaFc",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="uz"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <QueryProvider>
          <AuthProvider>
            <QuizProvider>
              {children}
            </QuizProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
