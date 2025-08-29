'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const ProductCard = ({ product }) => {
  const imageUrl = product.images && product.images.length > 0 ? product.images[0].src : '/placeholder.png';

  return (
    <Link href={`/product/${product.id}`} className="group">
        <Card className="h-full flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
            <CardHeader className="p-0">
                <div className="relative w-full aspect-square bg-gray-100">
                    <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            </CardHeader>
            <CardContent className="p-4 flex-grow">
                <CardTitle className="text-lg font-semibold leading-snug">{product.name}</CardTitle>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <p className="text-md font-medium text-gray-700">${product.price}</p>
            </CardFooter>
        </Card>
    </Link>
  );
};

export default ProductCard;