'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import ProductDetail from './ProductDetail';
import { useCart } from "@/context/CartContext";
import { ArrowLeft, X, ShoppingBag, BookOpen, Calendar, Clock, User } from 'lucide-react';import clsx from 'clsx';

// --- Constants for API endpoints ---
const BOOKINGS_API_URL = 'https://data.hyrosy.com';
const PRODUCTS_API_URL = 'https://www.hyrosy.com';

// Helper function to fetch products from a given URL and auth credentials
const fetchProductsFromSource = async (baseUrl, key, secret, { productId, categoryId }) => {
    let url = '';
    if (productId) {
        url = `${baseUrl}/wp-json/wc/v3/products/${productId}`;
    } else if (categoryId) {
        url = `${baseUrl}/wp-json/wc/v3/products?category=${categoryId}`;
    } else {
        return []; // No ID provided, return empty array
    }

    const authString = btoa(`${key}:${secret}`);
    const response = await fetch(url, { headers: { 'Authorization': `Basic ${authString}` } });
    
    if (!response.ok) {
        // Throw an error to be caught by the calling function
        throw new Error(`Failed to fetch from ${baseUrl}. Status: ${response.status}`);
    }
    
    // Ensure single product responses are returned in an array for consistency
    const data = await response.json();
    return Array.isArray(data) ? data : [data];
};


const PinDetailsModal = ({ pin, isOpen, onClose, onReadStory  }) => { // Removed unused props
    const { addToCart } = useCart();
    
    // State for managing the modal's multi-window view
    const [currentView, setCurrentView] = useState('details'); // 'details', 'hub', 'product'
    const [activeTab, setActiveTab] = useState('bookings');   // 'bookings', 'products'
    
    // State for the specific product being viewed
    const [selectedProduct, setSelectedProduct] = useState(null);

    // State for fetched items, now with error handling status
    const [bookings, setBookings] = useState({ status: 'idle', data: [] });
    const [physicalProducts, setPhysicalProducts] = useState({ status: 'idle', data: [] });

    // --- Derived State ---
    // Calculate once and reuse. Prevents re-calculation on every render.
    const hasBookings = !!(pin?.acf.bookable_product_id || pin?.acf.bookable_experiences_category_id);
    const hasProducts = !!(pin?.acf.connector_id || pin?.acf.category_connector_id);

    // Check if a story is linked
    const hasStory = !!pin?.acf.story_id;

    // This effect resets the modal's state when a new pin is selected or it's opened
    useEffect(() => {
        if (isOpen) {
            setCurrentView('details');
            setSelectedProduct(null);
            setBookings({ status: 'idle', data: [] });
            setPhysicalProducts({ status: 'idle', data: [] });

            // Set the default active tab based on available data
            if (hasBookings) {
                setActiveTab('bookings');
            } else if (hasProducts) {
                setActiveTab('products');
            }
        }
    }, [isOpen, pin, hasBookings, hasProducts]); // Added hasBookings/hasProducts to dependency array
    
    // This effect fetches data for the tabs when the user navigates to the "hub" view
    useEffect(() => {
        if (currentView !== 'hub' || !pin) return;

        const fetchAllData = async () => {
            // Fetch Bookings
            if (hasBookings && bookings.status === 'idle') {
                setBookings({ status: 'loading', data: [] });
                try {
                    const bookingData = await fetchProductsFromSource(
                        BOOKINGS_API_URL,
                        process.env.NEXT_PUBLIC_DATA_WOOCOMMERCE_KEY,
                        process.env.NEXT_PUBLIC_DATA_WOOCOMMERCE_SECRET,
                        { 
                            productId: pin.acf.bookable_product_id, 
                            categoryId: pin.acf.bookable_experiences_category_id 
                        }
                    );
                    setBookings({ status: 'success', data: bookingData });
                } catch (error) {
                    console.error("Error fetching bookings:", error);
                    setBookings({ status: 'error', data: [] });
                }
            }

            // Fetch Physical Products
            if (hasProducts && physicalProducts.status === 'idle') {
                setPhysicalProducts({ status: 'loading', data: [] });
                try {
                    const productData = await fetchProductsFromSource(
                        PRODUCTS_API_URL,
                        process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY,
                        process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET,
                        { 
                            productId: pin.acf.connector_id, 
                            categoryId: pin.acf.category_connector_id 
                        }
                    );
                    setPhysicalProducts({ status: 'success', data: productData });
                } catch (error) {
                    console.error("Error fetching physical products:", error);
                    setPhysicalProducts({ status: 'error', data: [] });
                }
            }
        };
        
        fetchAllData();

    }, [currentView, pin, hasBookings, hasProducts, bookings.status, physicalProducts.status]);

    const handleSelectProduct = (product) => {
        setSelectedProduct(product);
        setCurrentView('product');
    };

    if (!pin) return null;
    
    // --- CRITICAL FIX: Determine which list to display based on the active tab ---
    const listToDisplay = activeTab === 'bookings' ? bookings : physicalProducts;
    const pinImageUrl = pin.acf.featured_image?.url;

    const renderContent = () => {
        
        // --- WINDOW 3: PRODUCT DETAIL VIEW ---
        if (currentView === 'product' && selectedProduct) {
            return (
                <ProductDetail 
                    product={selectedProduct}
                    onAddToCart={addToCart}
                    onBack={() => setCurrentView('hub')}
                />
            );
        }

        // --- WINDOW 2: HUB VIEW WITH TABS ---
        if (currentView === 'hub') {
            return (
                <div className="flex flex-col h-full">
                    {/* Only show tabs if both types of content are available */}
                    {hasBookings && hasProducts && (
                        <div className="flex border-b border-gray-700 flex-shrink-0">
                            <button onClick={() => setActiveTab('bookings')} className={clsx("flex-1 p-3 text-sm font-semibold flex items-center justify-center gap-2", activeTab === 'bookings' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400')}>
                                <BookOpen className="w-4 h-4" /> Book an Experience
                            </button>
                            <button onClick={() => setActiveTab('products')} className={clsx("flex-1 p-3 text-sm font-semibold flex items-center justify-center gap-2", activeTab === 'products' ? 'text-cyan-400 border-b-2 border-cyan-400' : 'text-gray-400')}>
                                <ShoppingBag className="w-4 h-4" /> Shop Products
                            </button>
                        </div>
                    )}
                    <div className="flex-1 overflow-y-auto p-4">
                        {listToDisplay.status === 'loading' && <div className="flex items-center justify-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-400"></div></div>}
                        {listToDisplay.status === 'error' && <div className="text-center text-red-400 pt-10">Could not load items. Please try again later.</div>}
                        
                        {listToDisplay.status === 'success' && listToDisplay.data.length > 0 ? (
                            listToDisplay.data.map(product => (
                                <div key={product.id} onClick={() => handleSelectProduct(product)} className="flex items-center gap-4 p-2 rounded-lg hover:bg-gray-800 cursor-pointer">
                                    <div className="relative w-16 h-16 flex-shrink-0">
                                       <Image src={product.images?.[0]?.src || '/placeholder.png'} alt={product.name} fill className="object-cover rounded-md border border-gray-600"/>
                                    </div>
                                    <div>
                                       <p className="font-semibold text-sm text-white">{product.name}</p>
                                       <p className="text-cyan-400 font-bold text-sm" dangerouslySetInnerHTML={{ __html: product.price_html }} />
                                    </div>
                                </div>
                            ))
                        ) : listToDisplay.status === 'success' && <div className="text-center text-gray-400 pt-10">No items found.</div>}
                    </div>
                </div>
            );
        }

        // --- WINDOW 1: INITIAL DETAILS VIEW ---
        return (
            <div className="p-6">
                {pinImageUrl && <div className="relative w-full h-48 rounded-md mb-4 overflow-hidden"><Image src={pinImageUrl} alt={pin.title.rendered} fill className="object-cover" /></div>}
                <div className="prose prose-invert max-w-none text-gray-300" dangerouslySetInnerHTML={{ __html: pin.content.rendered }} />
                
                {(hasBookings || hasProducts || hasStory) && (
                    <div className="mt-6 pt-4 border-t border-gray-700">              
                        <button onClick={() => setCurrentView('hub')} className="w-full h-12 bg-golden-600 hover:bg-golden-500 text-white font-bold rounded-lg flex items-center justify-center transition-colors">
                            View Offers
                        </button>
                    </div>
                )}
                {hasStory && (
                             <button onClick={() => onReadStory(pin.acf.story_id)} className="w-full h-12 bg-golden hover:bg-golden/90 text-white font-bold rounded-lg flex items-center justify-center transition-colors">
                                <BookOpen className="w-4 h-4 mr-2"/>
                                Read Story
                            </button>
                )}
            </div>
        );
    };

    // Update back button logic
    const handleBack = () => {
        if (currentView === 'product') {
            setCurrentView('hub');
        } else {
            setCurrentView('details');
        }
    }

    // --- MAIN MODAL STRUCTURE ---
    return (
        <div className={clsx("fixed inset-0 z-40 flex items-center justify-center p-4 transition-opacity duration-300", isOpen ? "opacity-100" : "opacity-0 pointer-events-none")} onClick={onClose}>
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm"></div>
            <div className={clsx("relative bg-gray-900 border border-gray-700 rounded-lg shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col text-white transition-all duration-300", isOpen ? "opacity-100 scale-100" : "opacity-0 scale-95")} onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-gray-700 flex justify-between items-center flex-shrink-0">
                    {currentView !== 'details' && (
                        <button onClick={() => setCurrentView(currentView === 'hub' ? 'details' : 'hub')} className="text-gray-300 hover:text-white transition-colors flex items-center text-sm">
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back
                        </button>
                    )}
                    <h2 className={`text-lg font-semibold ${currentView !== 'details' ? 'text-center flex-grow' : ''}`}>
                        {currentView === 'product' && selectedProduct ? selectedProduct.name : pin.title.rendered }
                    </h2>
                    <button className="text-2xl text-gray-400 hover:text-white transition-colors" onClick={onClose}><X className="w-5 h-5"/></button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {renderContent()}
                </div>
            </div>
        </div>
    );
};

export default PinDetailsModal;