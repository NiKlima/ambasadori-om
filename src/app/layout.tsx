import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { CookieBanner } from "@/components/CookieBanner";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Амбассадоры ОМ — программа для тренеров",
  description:
    "Экосистема достижений OM для тренеров Молдовы. Веди свою команду, получай баллы и призы за вклад в активный образ жизни.",
  openGraph: {
    title: "Амбассадоры ОМ",
    description:
      "Программа поддержки тренеров от бренда OM. Твой вклад в развитие активного сообщества — в реальных наградах.",
    type: "website",
    locale: "ru_MD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-om-cream text-om-ink">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
