'use client';

import Link from 'next/link';
import Image from 'next/image'; // Import the Image component
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';

export default function Header() {
  const { toggleCart, itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-16 flex items-center justify-between">

        {/* Left side (empty, for spacing) */}
        <div className="w-10">
          {/* You could add a hamburger menu for mobile here later */}
        </div>

        {/* Center: Logo and Store Link */}
        <div className="w-1/3 flex justify-center">
          {/* Create a container for the two links */}
          <div className="flex items-center gap-6">
            {/* Link #1: The Logo */}
            <Link href="/">
              <Image 
                src="/hyrosy.png"
                alt="Hyrosy Logo" 
                width={90}
                height={120}
              />
            </Link>
            {/* Link #2: The "Store" text */}
            <Link href="/store" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Store
            </Link>
          </div>
        </div>

        {/* Right side: Cart icon */}
        <div className="flex items-center">
             <Button variant="ghost" size="icon" onClick={toggleCart} className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {itemCount}
                    </span>
                )}
            </Button>
        </div>
      </div>
    </header>
  );
}