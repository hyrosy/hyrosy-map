'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from "@/components/ui/button"; // <-- Import Button
import { Card } from "@/components/ui/card";      // <-- Import Card

export default function ProductPage() {
    const [product, setProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { productId } = useParams();

    useEffect(() => {
        if (!productId) return;

        const fetchProduct = async () => {
            setIsLoading(true);
            const consumerKey = 'ck_a97513965f94aeeb193fcf57ba06ac615c52cd5e';
            const consumerSecret = 'cs_9b522ebc8221748dad57255f1dc9c8eec5ec1b1d';
            const authString = btoa(`${consumerKey}:${consumerSecret}`);
            const headers = { 'Authorization': `Basic ${authString}` };

            try {
                const response = await fetch(`https://www.hyrosy.com/wp-json/wc/v3/products/${productId}`, { headers });
                if (!response.ok) throw new Error('Failed to fetch product');
                const data = await response.json();
                setProduct(data);
            } catch (error) {
                console.error("Failed to fetch product:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProduct();
    }, [productId]);

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen text-lg">Loading Product...</div>;
    }

    if (!product) {
        return <div className="flex items-center justify-center h-screen text-lg">Product not found.</div>;
    }

    const imageUrl = product.images?.[0]?.src || '/placeholder.png';

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <header className="py-4 px-8 border-b">
                <Link href="/store" className="text-blue-600 hover:underline">
                    &larr; Back to Store
                </Link>
            </header>

            {/* Product Details */}
            <main className="p-4 sm:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">

                    {/* Image Column */}
                    <Card className="overflow-hidden border-none shadow-none">
                         <div className="relative w-full aspect-square">
                            <Image
                                src={imageUrl}
                                alt={product.name || 'Product Image'}
                                fill
                                className="object-cover rounded-lg"
                                sizes="(max-width: 768px) 100vw, 50vw"
                            />
                        </div>
                    </Card>

                    {/* Details Column */}
                    <div className="flex flex-col justify-center py-4">
                        <h1 className="text-3xl sm:text-4xl font-bold mb-4">{product.name}</h1>
                        <p className="text-2xl text-gray-800 mb-6">{product.price} €</p>
                        <div
                            className="prose max-w-none text-gray-600 mb-8"
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                        <Button size="lg" className="w-full sm:w-auto mt-auto">Add to Cart</Button>
                    </div>
                </div>
            </main>
        </div>
    );
}