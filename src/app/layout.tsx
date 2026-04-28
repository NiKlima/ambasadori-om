import type { Metadata } from "next";
import localFont from "next/font/local";
import { CookieBanner } from "@/components/CookieBanner";
import "./globals.css";

const firs = localFont({
  src: [
    { path: "../../public/fonts/TTFirsNeue-Thin.ttf",            weight: "100", style: "normal" },
    { path: "../../public/fonts/TTFirsNeue-ThinItalic.ttf",      weight: "100", style: "italic" },
    { path: "../../public/fonts/TTFirsNeue-ExtraLight.ttf",      weight: "200", style: "normal" },
    { path: "../../public/fonts/TTFirsNeue-ExtraLightItalic.ttf",weight: "200", style: "italic" },
    { path: "../../public/fonts/TTFirsNeue-Light.ttf",           weight: "300", style: "normal" },
    { path: "../../public/fonts/TTFirsNeue-LightItalic.ttf",     weight: "300", style: "italic" },
    { path: "../../public/fonts/TTFirsNeue-Regular.ttf",         weight: "400", style: "normal" },
    { path: "../../public/fonts/TTFirsNeue-Italic.ttf",          weight: "400", style: "italic" },
    { path: "../../public/fonts/TTFirsNeue-Medium.ttf",          weight: "500", style: "normal" },
    { path: "../../public/fonts/TTFirsNeue-MediumItalic.ttf",    weight: "500", style: "italic" },
    { path: "../../public/fonts/TTFirsNeue-DemiBold.ttf",        weight: "600", style: "normal" },
    { path: "../../public/fonts/TTFirsNeue-DemiBoldItalic.ttf",  weight: "600", style: "italic" },
    { path: "../../public/fonts/TTFirsNeue-Bold.ttf",            weight: "700", style: "normal" },
    { path: "../../public/fonts/TTFirsNeue-BoldItalic.ttf",      weight: "700", style: "italic" },
    { path: "../../public/fonts/TTFirsNeue-ExtraBold.ttf",       weight: "800", style: "normal" },
    { path: "../../public/fonts/TTFirsNeue-ExtraBoldItalic.ttf", weight: "800", style: "italic" },
    { path: "../../public/fonts/TTFirsNeue-Black.ttf",           weight: "900", style: "normal" },
    { path: "../../public/fonts/TTFirsNeue-BlackItalic.ttf",     weight: "900", style: "italic" },
  ],
  variable: "--font-firs",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ambasadori om — программа для тренеров",
  description:
    "программа лояльности OM для тренеров Молдовы. ведёшь команду — получаешь баллы и призы за вклад в активный образ жизни.",
  openGraph: {
    title: "ambasadori om",
    description:
      "программа поддержки тренеров от бренда OM. твой вклад в развитие активного сообщества — в реальных наградах.",
    type: "website",
    locale: "ru_MD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ru" className={`${firs.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-om-white text-om-ink-900">
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}
