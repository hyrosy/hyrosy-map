'use client';

import React, { useState } from 'react'; // 1. Import useState
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from "@/lib/utils"; // shadcn utility for conditional classes

const ProductDetail = ({ product, onBack, onAddToCart }) => {
  // 2. Add state to track if the product has been added
  const [isAdded, setIsAdded] = useState(false);

  if (!product) return null;

  const imageUrl = product.images?.[0]?.src || '/placeholder.png';

  // 3. Create a handler to manage the button's state
  const handleAddToCartClick = () => {
    onAddToCart(product); // Add the product to the cart
    setIsAdded(true);     // Set the button to its "Added" state

    // After 2 seconds, revert the button back to normal
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="relative w-full h-48 bg-gray-100 rounded-md overflow-hidden mb-4">
        <Image
          src={imageUrl}
          alt={product.name}
          fill
          className="object-cover"
        />
      </div>

      <div className="flex-grow">
        <h3 className="text-xl font-bold">{product.name}</h3>
        <div 
          className="prose prose-sm max-w-none text-gray-600 mt-2" 
          dangerouslySetInnerHTML={{ __html: product.short_description }} 
        />
      </div>
      
      <div className="text-2xl font-bold text-right my-4">{product.price} €</div>

      <div className="mt-auto flex gap-4 border-t pt-4">
        <Button variant="outline" onClick={onBack} className="w-full">
          ⬅️ Back
        </Button>
        
        {/* 4. Update the button to use the new handler and conditional styles */}
        <Button 
          onClick={handleAddToCartClick} 
          disabled={isAdded} // Disable the button when it's in the "Added" state
          className={cn(
            "w-full transition-colors",
            { "bg-green-600 hover:bg-green-700": isAdded } // Apply green background if added
          )}
        >
          {isAdded ? '✓ Added!' : '🛒 Add to Cart'}
        </Button>
      </div>
    </div>
  );
};

export default ProductDetail;