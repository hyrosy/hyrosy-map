'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';

export default function Header() {
  const { toggleCart, itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-700 bg-black/80 backdrop-blur-md text-white">
      <div className="container mx-auto h-20 flex items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Left side: Store Link */}
        <div className="flex items-center">
           <Link href="/store" className="text-sm font-medium text-gray-300 transition-colors hover:text-white">
             Store
           </Link>
        </div>

        {/* Center: Logo */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <Link href="/">
            <Image 
              src="/hyrosy.png"
              alt="Hyrosy Logo" 
              width={80} // Slightly adjusted for balance
              height={80}
              className="object-contain"
            />
          </Link>
        </div>

        {/* Right side: Cart icon */}
        <div className="flex items-center">
            <button onClick={toggleCart} className="relative p-2 rounded-full text-gray-300 hover:bg-white/10 hover:text-white transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
                      {itemCount}
                  </span>
              )}
               <span className="sr-only">Open cart</span>
            </button>
        </div>
      </div>
    </header>
  );
}