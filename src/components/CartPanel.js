'use client';

import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from 'next/link'; // <-- 1. Import Link
import { Trash2 } from "lucide-react";

const CartPanel = () => {
  // 2. Remove all the old checkout logic (useState for clientSecret, handleCheckout, etc.)
  const { isCartOpen, closeCart, cartItems, removeFromCart, updateQuantity, total } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Shopping Cart</SheetTitle>
        </SheetHeader>
        {cartItems.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto pr-4">
              {/* ... your cart items list (ul) remains the same */}
            </div>
            <SheetFooter className="mt-auto border-t pt-4">
                <div className="w-full space-y-2">
                    <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${total}</span>
                    </div>
                    {/* 3. Wrap the Button in a Link */}
                    <Link href="/checkout" passHref>
                      <Button className="w-full" size="lg" onClick={closeCart}>
                        Proceed to Checkout
                      </Button>
                    </Link>
                </div>
            </SheetFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <p className="text-muted-foreground">Your cart is empty.</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartPanel;