'use client';

import { CartProvider } from '@/context/CartContext';
import { usePathname } from 'next/navigation';

export function Providers({ children }) {
  const pathname = usePathname();

  // Conditionally render based on the path
  const isMapPage = pathname === '/';
  
  return (
    <CartProvider>
      {/* You can add logic here to show/hide components based on the page */}
      {children}
    </CartProvider>
  );
}