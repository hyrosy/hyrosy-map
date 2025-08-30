'use client';

import { useState } from 'react'; // <-- Import useState
import { useCart } from "@/context/CartContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Trash2 } from "lucide-react"; // A popular icon library
import { loadStripe } from '@stripe/stripe-js'; 
// Load Stripe outside of the component to avoid re-creating on every render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);


const CartPanel = () => {
  const { isCartOpen, closeCart, cartItems, removeFromCart, updateQuantity, total, clearCart } = useCart();
  const [clientSecret, setClientSecret] = useState(''); // <-- Add state for client secret
  // ... inside the CartPanel component, after the state declarations

  const handleCheckout = async () => {
    // Don't proceed if the cart is empty
    if (cartItems.length === 0) return;

    try {
        const res = await fetch('/api/create-payment-intent', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            // Send the actual cart items to the server
            body: JSON.stringify({ items: cartItems }), 
        });

        const data = await res.json();

        if (data.clientSecret) {
            setClientSecret(data.clientSecret);
        } else {
            alert('Could not start checkout.');
        }
    } catch (error) {
        console.error("Payment intent error:", error);
        alert('Could not connect to payment server.');
    }
  };

// ... the rest of the component
  return (
    <Sheet open={isCartOpen} onOpenChange={closeCart}>
      <SheetContent className="flex flex-col">
        <SheetHeader>
          {/* If clientSecret exists, show "Complete Payment", otherwise "Shopping Cart" */}
          <SheetTitle>{clientSecret ? 'Complete Payment' : 'Shopping Cart'}</SheetTitle>
        </SheetHeader>
        
        <SheetHeader className="flex flex-row justify-between items-center">
          <SheetTitle>Shopping Cart</SheetTitle>
          {cartItems.length > 0 && (
          <Button variant="ghost" size="sm" onClick={clearCart}>Clear All</Button>
          )}
        </SheetHeader>

        
        {/* If clientSecret exists, show the Stripe form */}
        {clientSecret ? (
          <div className="flex-1 overflow-y-auto pr-4">
            <Elements options={{ clientSecret }} stripe={stripePromise}>
              <CheckoutForm onPaymentSuccess={() => {
                // Handle successful payment: clear cart, show success message etc.
                alert("Payment Successful!");
                setClientSecret('');
                // You'll need a function in your context to clear the cart
              }} />
            </Elements>
          </div>
        ) : (
          <>
            {/* This is the existing cart items view */}
            {cartItems.length > 0 ? (
              <>
                <div className="flex-1 overflow-y-auto pr-4">
                  {/* ... your ul with cart items */}
                </div>
                <SheetFooter className="mt-auto border-t pt-4">
                    <div className="w-full space-y-2">
                        <div className="flex justify-between font-semibold">
                            <span>Total</span>
                            <span>${total}</span>
                        </div>
                        {/* Make the button call handleCheckout */}
                        <Button className="w-full" size="lg" onClick={handleCheckout}>
                          Checkout
                        </Button>
                    </div>
                </SheetFooter>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <p className="text-muted-foreground">Your cart is empty.</p>
              </div>
            )}
          </>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartPanel;