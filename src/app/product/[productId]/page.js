// src/app/product/[productId]/page.js
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link'; // <-- Import Link
import styles from './product-page.module.css';

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
        return <div className={styles.loading}>Loading Product...</div>;
    }

    if (!product) {
        return <div className={styles.loading}>Product not found.</div>;
    }

    const imageUrl = product.images?.[0]?.src || '/placeholder.png';

    // Wrap your page in a React Fragment <> ... </>
    return (
        <>
            {/* Add this header section */}
            <header className={styles.header}>
                <Link href="/store" className={styles.backLink}>
                    &larr; Back to Store
                </Link>
            </header>

            <div className={styles.pageContainer}>
                <div className={styles.imageColumn}>
                     <Image
                        src={imageUrl}
                        alt={product.name || 'Product Image'}
                        fill
                        className={styles.productImage}
                        sizes="50vw"
                    />
                </div>
                <div className={styles.detailsColumn}>
                    <h1 className={styles.productName}>{product.name}</h1>
                    <div 
                        className={styles.productDescription} 
                        dangerouslySetInnerHTML={{ __html: product.description }} 
                    />
                    <p className={styles.productPrice}>{product.price} €</p>
                    <div className={styles.actions}>
                        <button className={styles.addToCartButton}>Add to Cart</button>
                    </div>
                </div>
            </div>
        </>
    );
}