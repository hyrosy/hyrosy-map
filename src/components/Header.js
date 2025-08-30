'use client';

import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';

function Header() {
  const { toggleCart, itemCount } = useCart();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container h-14 flex items-center justify-between">
        <Link href="/" className="font-bold">Hyrosy Map</Link>
        <nav className="flex items-center gap-4">
            <Link href="/store" className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary">Store</Link>
             <Button variant="ghost" size="icon" onClick={toggleCart} className="relative">
                <ShoppingCart className="h-5 w-5" />
                {itemCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {itemCount}
                    </span>
                )}
            </Button>
        </nav>
      </div>
    </header>
  );
}

export default Header;