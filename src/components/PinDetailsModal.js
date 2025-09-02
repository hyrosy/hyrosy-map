'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ProductDetail from './ProductDetail';
import { useCart } from "@/context/CartContext"; // Import useCart to pass addToCart down
import { ArrowLeft } from 'lucide-react';


const PinDetailsModal = ({ pin, onClose }) => {
    const { addToCart } = useCart(); // Get addToCart from context
    const [viewedProduct, setViewedProduct] = useState(null);
    const [modalProducts, setModalProducts] = useState({ status: 'idle', data: [] });

    useEffect(() => {
        // Reset view when the pin changes
        setViewedProduct(null);

        if (pin && (pin.acf.category_connector_id || pin.acf.connector_id)) {
            const fetchProducts = async () => {
                setModalProducts({ status: 'loading', data: [] });
                const wooApiUrl = pin.acf.category_connector_id
                    ? `https://www.hyrosy.com/wp-json/wc/v3/products?category=${pin.acf.category_connector_id}`
                    : `https://www.hyrosy.com/wp-json/wc/v3/products/${pin.acf.connector_id}`;
                
                const authString = btoa(`${process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY}:${process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET}`);
                
                try {
                    const response = await fetch(wooApiUrl, { headers: { 'Authorization': `Basic ${authString}` } });
                    if (!response.ok) throw new Error('Failed to fetch products');
                    let products = await response.json();
                    setModalProducts({ status: 'success', data: Array.isArray(products) ? products : [products] });
                } catch (error) {
                    console.error("Failed to fetch WooCommerce products:", error);
                    setModalProducts({ status: 'error', data: [] });
                }
            };
            fetchProducts();
        } else {
            setModalProducts({ status: 'idle', data: [] });
        }
    }, [pin]);

    if (!pin) return null;

    return (
        <div className="fixed inset-0 bg-black/70 z-40 flex items-center justify-center p-4 backdrop-blur-sm" onClick={onClose}>
            <div 
                className="bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col text-white" 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                    {viewedProduct && (
                        <button onClick={() => setViewedProduct(null)} className="text-gray-300 hover:text-white transition-colors flex items-center text-sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Details
                        </button>
                    )}
                    <h2 className={`text-lg font-semibold ${viewedProduct ? 'text-center flex-grow' : ''}`}>{viewedProduct ? viewedProduct.name : pin.title.rendered}</h2>
                    <button className="text-2xl text-gray-400 hover:text-white transition-colors" onClick={onClose}>&times;</button>
                </div>

                {/* Modal Content */}
                <div className="p-6 flex-1 overflow-y-auto">
                    {viewedProduct ? (
                        <ProductDetail 
                            product={viewedProduct}
                            onAddToCart={addToCart} // Pass the addToCart function
                            onBack={() => setViewedProduct(null)}
                        />
                    ) : (
                        <div>
                            {pin.acf.featured_image?.url && (
                                <div className="relative w-full h-48 rounded-md mb-4 overflow-hidden">
                                    <Image 
                                      src={pin.acf.featured_image.url} 
                                      alt={pin.title.rendered} 
                                      fill 
                                      className="object-cover" 
                                    />
                                </div>
                            )}
                            <div 
                                className="prose prose-invert max-w-none text-gray-300" 
                                dangerouslySetInnerHTML={{ __html: pin.content.rendered }} 
                            />
                            
                            {/* Product List Section */}
                            <div className="mt-6 pt-4 border-t border-gray-700">
                                {modalProducts.status === 'loading' && (
                                    <div className="flex items-center justify-center h-20">
                                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-cyan-400"></div>
                                    </div>
                                )}
                                {modalProducts.status === 'error' && <p className="text-center text-red-400">Could not load experiences.</p>}
                                {modalProducts.status === 'success' && modalProducts.data.length > 0 && (
                                    <div className="space-y-2">
                                        <h3 className="font-semibold text-white mb-2">Available Experiences:</h3>
                                        {modalProducts.data.map(product => (
                                            <div 
                                                key={product.id} 
                                                onClick={() => setViewedProduct(product)} 
                                                className="p-3 border border-gray-700 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors flex justify-between items-center"
                                            >
                                                <span className="font-medium text-sm">{product.name}</span>
                                                <span className="text-cyan-400 font-bold text-sm">${product.price}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PinDetailsModal;