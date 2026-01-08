import { Geist, Geist_Mono } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- AQUÍ ESTÁ TU NUEVA METADATA ---
export const metadata = {
  title: "Patriots Command Center",
  description: "WELCOME TO THE PATRIOTS WAR ROOM",
  openGraph: {
    title: "Patriots Command Center",
    description: "WELCOME TO THE PATRIOTS WAR ROOM",
    url: 'https://www.patriotscommandcenter.com',
    siteName: 'Patriots Command Center',
    locale: 'en_US',
    type: 'website',
  },
};

// --- ESTA ES LA FUNCIÓN QUE FALTABA O ESTABA ROTA ---
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}