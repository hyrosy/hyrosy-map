'use client';

import { PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { useState } from 'react';
import styles from '@/app/page.module.css';

export default function CheckoutForm({ onPaymentSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;
    setIsLoading(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', // Do not redirect
    });
    
    if (error) {
        if (error.type === "card_error" || error.type === "validation_error") {
            setMessage(error.message);
        } else {
            setMessage("An unexpected error occurred.");
        }
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        setMessage("Payment succeeded!");
        onPaymentSuccess();
    }

    setIsLoading(false);
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit} className={styles.checkoutForm}>
      <PaymentElement id="payment-element" />
      <button disabled={isLoading || !stripe || !elements} id="submit" className={styles.payButton}>
        <span id="button-text">
          {isLoading ? <div className={styles.spinner} id="spinner"></div> : "Pay now"}
        </span>
      </button>
      {message && <div id="payment-message" className={styles.paymentMessage}>{message}</div>}
    </form>
  );
}