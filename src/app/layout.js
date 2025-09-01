import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers"; 
import Header from "@/components/Header";
import CartPanel from "@/components/CartPanel";

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
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
        <Providers>
          <div className="flex flex-col h-full">
          <Header />
          <main className="flex-1 relative">{children}</main> {/* Let the page component handle its own layout */}
          <CartPanel />
          </div>
        </Providers>
      </body>
    </html>
  );
}