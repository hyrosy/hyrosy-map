import "./globals.css";
import { Inter } from "next/font/google";
import { Geist, Geist_Mono } from "next/font/google";
import { Providers } from "./providers"; // <-- We will use this
import Header from "@/components/Header";
import CartPanel from "@/components/CartPanel";

const inter = Inter({ subsets: ["latin"] });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "hyrosy Map",
  description: "A rich world to explore",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} ${inter.className}`}>
        {/* Use the Providers component here */}
        <Providers>
          <Header />
          <CartPanel />
          {children}
        </Providers>
      </body>
    </html>
  );
}