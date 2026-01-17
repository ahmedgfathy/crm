import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { I18nProvider } from "../components/I18nProvider";
import { getTranslations } from "../lib/translations";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Contaboo Real Estate CRM",
  description: "Unlimited-user real estate CRM and operations platform with one flat monthly price.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const translations = await getTranslations();

  return (
    <html lang="en">
      <body
        data-sidebar="collapsed"
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <I18nProvider initialTranslations={translations as any}>{children}</I18nProvider>
      </body>
    </html>
  );
}
