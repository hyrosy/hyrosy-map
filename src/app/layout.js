import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers"; 
import Header from "@/components/Header";
import CartPanel from "@/components/CartPanel";
import 'mapbox-gl/dist/mapbox-gl.css'; 

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "hyrosy World Map",
  description: "Discover Morocco with hyrosy",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="light h-full">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <div>
          <Header />
          <main>{children}</main> {/* Let the page component handle its own layout */}
          <CartPanel />
          </div>
        </Providers>
      </body>
    </html>
  );
}