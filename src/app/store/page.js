'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import CategorySidebar from '@/components/CategorySidebar';

export default function StorePage() {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            const consumerKey = 'ck_6083a60490a09aa1bcfe51c7c726b6688aa7ae31';
            const consumerSecret = 'cs_32aa0ca86999411c24a3aeb4b11c2cb0ce9f186b';
            const authString = btoa(`${consumerKey}:${consumerSecret}`);
            const headers = { 'Authorization': `Basic ${authString}` };

            try {
                // Fetch products and categories in parallel
                const [productsRes, categoriesRes] = await Promise.all([
                    fetch('https://data.hyrosy.com/wp-json/wc/v3/products', { headers }),
                    fetch('https://data.hyrosy.com/wp-json/wc/v3/products/categories', { headers })
                ]);

                if (!productsRes.ok || !categoriesRes.ok) {
                    throw new Error('Failed to fetch data');
                }

                const productsData = await productsRes.json();
                const categoriesData = await categoriesRes.json();

                setProducts(productsData);
                // Filter out the "Uncategorized" category
                const validCategories = Array.isArray(categoriesData) ? categoriesData : [];
                setCategories(categoriesData.filter(cat => cat.slug !== 'uncategorized'));
            } catch (error) {
                console.error("Failed to fetch store data:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const filteredProducts = selectedCategory
        ? products.filter(p => p.categories.some(c => c.id === selectedCategory))
        : products;

    if (isLoading) {
        return <div className="flex items-center justify-center h-screen text-lg">Loading Store...</div>;
    }

    return (
        <div className="bg-white min-h-screen">
            {/* Header */}
            <header className="py-8 px-8 border-b bg-gray-50">
                <h1 className="text-4xl font-bold text-gray-800">Store</h1>
            </header>

            <main className="flex flex-col md:flex-row max-w-7xl mx-auto p-4 sm:p-8 gap-8">
                {/* Sidebar */}
                <aside className="w-full md:w-1/4 lg:w-1/5">
                    <CategorySidebar
                        categories={categories}
                        selectedCategory={selectedCategory}
                        onSelectCategory={setSelectedCategory}
                    />
                </aside>

                {/* Product Grid */}
                <div className="flex-1">
                    {filteredProducts.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredProducts.map(product => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <h2 className="text-2xl font-semibold">No Products Found</h2>
                            <p className="text-gray-500 mt-2">Try selecting a different category.</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}