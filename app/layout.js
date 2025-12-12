import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL("https://www.mkanalyticshub.com"),
  icons: {
    icon: "/data-analytics.ico",
    apple: "/data-analytics.png"
  },
  openGraph: {
    title: "Mahy Khoory Analytics",
    description: "Powered by the MAHY Khoory ERP Team",
    url: "/",
    siteName: "Mahy Khoory Analytics",
    images: [
      {
        url: "/data-analytics.png", 
        width: 600,
        height: 600,
        alt: "Mahy Khoory Analytics",
      },
    ],
    type: "website",
  },
  title: "Mahy Khoory Analytics",
  description: "Powered by the MAHY Khoory ERP Team",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
