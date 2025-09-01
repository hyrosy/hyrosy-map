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
        
        {/* Left side: Logo and main navigation */}
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            {/* --- YOUR LOGO GOES HERE --- */}
            <Image 
              src="/hyrosy.png" // Assumes your logo is named logo.png in the /public folder
              alt="Hyrosy Logo" 
              width={150} // Set the desired width
              height={80} // Set the desired height
            />
          </Link>
          <nav className="hidden md:flex items-center gap-4">
              <Link href="/store" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
                Store
              </Link>
              {/* You can add more links here in the future */}
          </nav>
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