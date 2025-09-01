'use client';

import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from 'next/link';
import { Trash2 } from "lucide-react"; // A popular icon library

const CartPanel = () => {
  const { isCartOpen, closeCart, cartItems, removeFromCart, updateQuantity, total } = useCart();

  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          <SheetTitle>Your Itinerary</SheetTitle>
        </SheetHeader>
        
        {cartItems.length > 0 ? (
          <>
            <div className="flex-1 overflow-y-auto -mx-6 px-6 divide-y">
              {cartItems.map((item) => (
                <div key={item.id} className="flex items-center gap-4 py-4">
                  <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                     <Image
                      src={item.images?.[0]?.src || '/placeholder.png'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-medium">{item.name}</h3>
                    <p className="text-sm text-muted-foreground">${item.price}</p>
                    <div className="flex items-center gap-2 mt-2 border rounded-md w-fit">
                      <Button variant="ghost" size="sm" onClick={() => updateQuantity(item.id, item.quantity - 1)} className="h-7 w-7">-</Button>
                      <span className="text-sm w-4 text-center">{item.quantity}</span>
                      <Button variant="ghost" size="sm" onClick={() => updateQuantity(item.id, item.quantity + 1)} className="h-7 w-7">+</Button>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => removeFromCart(item.id)}>
                    <Trash2 className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </div>
              ))}
            </div>

            <SheetFooter className="mt-auto border-t pt-6">
                <div className="w-full space-y-4">
                    <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>${total}</span>
                    </div>
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
            <Button variant="outline" className="mt-4" onClick={closeCart}>Keep Exploring</Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartPanel;