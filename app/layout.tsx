import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./brand.css";
import "./futbolhoy.css";
import "./destacados.css";
import { AppProviders } from "./components/AppProviders";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "queveohoy.es — Qué ver hoy en TV",
  description:
    "Partidos hoy en la tele: fútbol, e-sports, F1 y más. Escudos, horarios y canales.",
  themeColor: "#000000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" style={{ margin: 0 }}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
