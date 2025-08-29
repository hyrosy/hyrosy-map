// src/app/store/page.js
'use client';

import { useState, useEffect } from 'react';
import styles from './store.module.css';
import ProductCard from '@/components/ProductCard';
import CategorySidebar from '@/components/CategorySidebar'; // <-- 1. IMPORT the new component

export default function StorePage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]); // <-- 2. ADD state for categories
    const [selectedCategory, setSelectedCategory] = useState(null); // <-- 3. ADD state for the filter
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchStoreData = async () => {
            setIsLoading(true);
            const consumerKey = 'ck_a97513965f94aeeb193fcf57ba06ac615c52cd5e';
            const consumerSecret = 'cs_9b522ebc8221748dad57255f1dc9c8eec5ec1b1d';
            const authString = btoa(`${consumerKey}:${consumerSecret}`);
            const headers = { 'Authorization': `Basic ${authString}` };
            
            try {
                // Fetch both categories and products at the same time
                const [catResponse, prodResponse] = await Promise.all([
                    fetch('https://www.hyrosy.com/wp-json/wc/v3/products/categories', { headers }),
                    fetch('https://www.hyrosy.com/wp-json/wc/v3/products', { headers })
                ]);

                if (!catResponse.ok || !prodResponse.ok) throw new Error('Failed to fetch store data');

                const catData = await catResponse.json();
                const prodData = await prodResponse.json();
                
                // Set both states
                setCategories(catData);
                setProducts(prodData);
            } catch (error) {
                console.error("Failed to fetch store data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStoreData();
    }, []);
    
    // <-- 4. ADD logic to filter products based on the selected category
    const filteredProducts = selectedCategory
        ? products.filter(p => p.categories.some(c => c.id === selectedCategory))
        : products;

    if (isLoading) {
        return <div className={styles.loading}>Loading Marketplace...</div>;
    }

    return (
        <div className={styles.storeContainer}>
            {/* 5. REPLACE the <aside> placeholder with the new component */}
            <CategorySidebar 
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
            />
            <main className={styles.productGrid}>
                {/* 6. RENDER the filtered products */}
                {filteredProducts.map(product => (
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