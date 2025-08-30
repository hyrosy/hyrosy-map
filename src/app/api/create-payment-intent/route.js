import { NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// This function securely fetches the real price of a product from your WooCommerce store
const getProductPrice = async (productId) => {
    const wooApiUrl = `https://www.hyrosy.com/wp-json/wc/v3/products/${productId}`;
    const authString = btoa(`${process.env.WOOCOMMERCE_KEY}:${process.env.WOOCOMMERCE_SECRET}`);
    
    try {
        const response = await fetch(wooApiUrl, { 
            headers: { 'Authorization': `Basic ${authString}` } 
        });
        if (!response.ok) {
            console.error(`Failed to fetch product ${productId}`);
            return null;
        }
        const product = await response.json();
        return parseFloat(product.price);
    } catch (error) {
        console.error(`Error fetching product ${productId}:`, error);
        return null;
    }
};

export async function POST(request) {
  // 1. Get the cart 'items' sent from the CartPanel
  const { items } = await request.json();

  if (!items || !Array.isArray(items)) {
    return new NextResponse("Invalid cart data", { status: 400 });
  }

  let calculatedTotal = 0;

  // 2. Loop through items to calculate the total securely on the server
  for (const item of items) {
    const price = await getProductPrice(item.id);
    
    if (price === null) {
      return new NextResponse(`Could not find price for product ID ${item.id}`, { status: 400 });
    }
    
    calculatedTotal += price * item.quantity;
  }

  // 3. Convert the final total to cents for Stripe
  const amountInCents = Math.round(calculatedTotal * 100);

  if (amountInCents <= 0) {
    return new NextResponse("Invalid amount", { status: 400 });
  }

  try {
    // 4. Create the Payment Intent with the securely calculated amount
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amountInCents,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("Stripe Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}