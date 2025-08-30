'use client';

import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import { useCart } from '@/context/CartContext';
import CheckoutForm from '@/components/CheckoutForm';
import Image from 'next/image';
import Link from 'next/link';

// Initialize Stripe outside of the component
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutPage() {
  const { cartItems, total, clearCart } = useCart();
  const [clientSecret, setClientSecret] = useState('');

  // Create a Payment Intent when the component mounts with items in the cart
  useEffect(() => {
    if (cartItems.length > 0) {
      fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems }),
      })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret));
    }
  }, [cartItems]);

  const onPaymentSuccess = () => {
    alert("Payment Successful! Your order has been placed.");
    clearCart();
    // Redirect to a success page or homepage after a delay
    setTimeout(() => {
        window.location.href = '/';
    }, 2000);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <header className="py-4 px-8 border-b bg-white">
        <Link href="/" className="text-2xl font-bold">Hyrosy Map</Link>
      </header>

      <main className="max-w-4xl mx-auto p-4 sm:p-8 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Order Summary Column */}
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          <div className="space-y-4 bg-white p-6 rounded-lg border">
            {cartItems.map(item => (
              <div key={item.id} className="flex items-center gap-4">
                <div className="relative h-16 w-16 rounded-md overflow-hidden border">
                  <Image src={item.images?.[0]?.src || '/placeholder.png'} alt={item.name} fill className="object-cover" />
                </div>
                <div>
                  <h3 className="text-sm font-medium">{item.name}</h3>
                  <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                </div>
                <p className="ml-auto text-sm font-medium">${(item.price * item.quantity).toFixed(2)}</p>
              </div>
            ))}
            <div className="border-t pt-4 mt-4 flex justify-between font-semibold">
              <span>Total</span>
              <span>${total}</span>
            </div>
          </div>
        </div>

        {/* Payment Column */}
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
          <div className="bg-white p-6 rounded-lg border">
            {clientSecret ? (
              <Elements options={{ clientSecret }} stripe={stripePromise}>
                <CheckoutForm onPaymentSuccess={onPaymentSuccess} />
              </Elements>
            ) : (
              <p>Loading payment form...</p>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}