'use client';

import { useState, useEffect } from 'react';
import styles from './store.module.css';
import ProductCard from '@/components/ProductCard';
// We will add the sidebar later
// import CategorySidebar from '@/components/CategorySidebar';

export default function StorePage() {
    const [products, setProducts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            setIsLoading(true);
            const consumerKey = 'ck_a97513965f94aeeb193fcf57ba06ac615c52cd5e';
            const consumerSecret = 'cs_9b522ebc8221748dad57255f1dc9c8eec5ec1b1d';
            const authString = btoa(`${consumerKey}:${consumerSecret}`);
            const headers = { 'Authorization': `Basic ${authString}` };
            
            try {
                const response = await fetch('https://www.hyrosy.com/wp-json/wc/v3/products', { headers });
                if (!response.ok) throw new Error('Failed to fetch products');
                const data = await response.json();
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch products:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (isLoading) {
        return <div className={styles.loading}>Loading Marketplace...</div>;
    }

    return (
        <div className={styles.storeContainer}>
            <aside className={styles.sidebar}>
                <h2>Categories</h2>
                <p>Category filters will go here.</p>
            </aside>
            <main className={styles.productGrid}>
                {products.map(product => (
                    <ProductCard 
                        key={product.id} 
                        product={product} 
                        onAddToCart={() => console.log('Add to cart:', product.name)}
                    />
                ))}
            </main>
        </div>
    );
}