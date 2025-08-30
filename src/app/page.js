'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/CheckoutForm';
import ProductDetail from '@/components/ProductDetail';
import Image from 'next/image';
import QuickLocator from '@/components/QuickLocator';
import StoryModal from '@/components/StoryModal';
import { useCart } from "@/context/CartContext";

const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false 
});

const stripePromise = loadStripe('pk_live_51PWc0EP8TGcYvcnxRvYWWqJj4CU7dDENqzmk5zVfn2uSfF7At1RW7KuNjQCogPQRnBMCy1wEcQPxDRGj3rMk6Kgo00HZs2tuve');

export default function Home() {
    const filterData = {
      "Adventures": ["Quad Biking", "Camel Rides", "Buggy Tours"],
      "Workshops": ["Cooking Class", "Pottery", "Artisan Crafts"],
      "Food": ["Traditional Food", "Moroccan Sweets", "Cafes"],
      "Monuments": ["Historic Sites", "Gardens", "Museums"]
    };

    const cityData = {
      'marrakech': { name: 'Marrakech', center: [-7.98, 31.63], storyUrl: '/videos/marrakech_story.mp4' },
      'casablanca': { name: 'Casablanca', center: [-7.59, 33.57], storyUrl: '/videos/casablanca_story.mp4' },
      'rabat': { name: 'Rabat', center: [-6.84, 34.02], storyUrl: '/videos/rabat_story.mp4' },
    };
    
    // --- (1) REMOVED OLD CART STATE ---
    // const [isCartPanelOpen, setCartPanelOpen] = useState(false);
    // const [cart, setCart] = useState([]);
    
    const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
    const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
    const [allPins, setAllPins] = useState([]);
    const [displayedPins, setDisplayedPins] = useState([]);
    const [activeMainCategory, setActiveMainCategory] = useState("Adventures");
    const [selectedSubCategories, setSelectedSubCategories] = useState(new Set());
    const [clientSecret, setClientSecret] = useState('');
    const [selectedPin, setSelectedPin] = useState(null);
    const [modalProducts, setModalProducts] = useState({ status: 'idle', data: [] });
    const [viewedProduct, setViewedProduct] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isLocatorOpen, setLocatorOpen] = useState(false);
    const [selectedCity, setSelectedCity] = useState(cityData['marrakech']);
    const [isStoryModalOpen, setStoryModalOpen] = useState(false);
    const [storyContentUrl, setStoryContentUrl] = useState('');
    const [viewedCities, setViewedCities] = useState(new Set());
    const mapRef = useRef(null);

    // --- (2) USE THE GLOBAL CART CONTEXT ---
    const { addToCart } = useCart();

    // All your useEffect and handler functions for filters, cities, etc., remain the same...
    // ... (useEffect for fetching pins) ...
    // ... (handleCitySelect, handleFilter, etc.) ...
    
    useEffect(() => {
        const fetchCityPins = async () => {
            if (!selectedCity) {
                setAllPins([]);
                setDisplayedPins([]);
                return;
            }
            const apiUrl = `https://data.hyrosy.com/wp-json/wp/v2/locations?city=${selectedCity.name.toLowerCase()}&acf_format=standard`;
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error('API response was not ok.');
                const locations = await response.json();
                const cityPinsData = locations.map(loc => {
                    if (!loc.acf || !loc.acf.gps_coordinates) return null;
                    const [lat, lng] = loc.acf.gps_coordinates.split(',').map(s => parseFloat(s.trim()));
                    return { id: loc.id, lng, lat, title: loc.title.rendered, description: loc.acf.description || '', featured_image: loc.acf.featured_image?.url || null, subCategory: loc.acf.map_sub_category, category_connector_id: loc.acf.category_connector_id, map_category: loc.acf.map_category?.[0] || null, color: '#007bff' };
                }).filter(Boolean);
                setAllPins(cityPinsData);
                setDisplayedPins(cityPinsData);
            } catch (error) {
                console.error(`API fetch failed for ${selectedCity.name}:`, error);
            }
        };
        fetchCityPins();
        if (selectedCity && !viewedCities.has(selectedCity.name.toLowerCase())) {
            setStoryContentUrl(selectedCity.storyUrl);
            setStoryModalOpen(true);
            setViewedCities(prev => new Set(prev).add(selectedCity.name.toLowerCase()));
        }
    }, [selectedCity, viewedCities]);

    const handleCitySelect = (cityKey) => {
        setIsLoading(true);
        setSelectedCity(cityData[cityKey]);
        setTimeout(() => setIsLoading(false), 2000); 
    };
    
    const handleResetView = () => {
        setIsLoading(true); 
        setSelectedCity(null);
        setTimeout(() => setIsLoading(false), 2000);
    };

    const handleFilter = () => {
        const selectedArray = Array.from(selectedSubCategories);
        setDisplayedPins(selectedArray.length === 0 ? allPins : allPins.filter(pin => selectedArray.includes(pin.subCategory)));
        setFilterPanelOpen(false);
    };

    const handleReset = () => {
        setSelectedSubCategories(new Set());
        setDisplayedPins(allPins);
    };
    
    // --- (3) REMOVED OLD LOCAL CHECKOUT LOGIC ---
    // The checkout logic is now handled inside the global CartPanel component.
    // We can remove handleCheckout and onPaymentSuccess from this page.

    useEffect(() => {
        if (!selectedPin) {
            setViewedProduct(null);
            return;
        }
        if (selectedPin.category_connector_id || selectedPin.connector_id) {
            const fetchProducts = async () => {
                setModalProducts({ status: 'loading', data: [] });
                const wooApiUrl = selectedPin.category_connector_id
                    ? `https://www.hyrosy.com/wp-json/wc/v3/products?category=${selectedPin.category_connector_id}`
                    : `https://www.hyrosy.com/wp-json/wc/v3/products/${selectedPin.connector_id}`;
                const authString = btoa(`ck_6083a60490a09aa1bcfe51c7c726b6688aa7ae31`);
                try {
                    const response = await fetch(wooApiUrl, { headers: { 'Authorization': `Basic ${authString}` } });
                    if (!response.ok) throw new Error('WooCommerce API response not ok');
                    let products = await response.json();
                    if (!Array.isArray(products)) products = [products];
                    setModalProducts({ status: 'success', data: products });
                } catch (error) {
                    console.error("Failed to fetch WooCommerce products:", error);
                    setModalProducts({ status: 'error', data: [] });
                }
            };
            fetchProducts();
        } else {
            setModalProducts({ status: 'idle', data: [] });
        }
    }, [selectedPin]);

    return (
      <main className={styles.mainContainer}>
        {isLoading && (
            <div className={styles.loadingOverlay}>
                <div className={styles.spinner}></div>
                <p>Entering City...</p>
            </div>
        )}
        <Map 
            mapRef={mapRef}
            displayedPins={displayedPins}
            onPinClick={setSelectedPin}
            selectedCity={selectedCity}
        />
        
        {isStoryModalOpen && <StoryModal videoUrl={storyContentUrl} onClose={() => setStoryModalOpen(false)} />}

        <button 
            className={styles.locatorIcon} 
            onClick={() => setLocatorOpen(true)}
        >
            📍
        </button>

        {isLocatorOpen && (
            <>
                <div 
                    className={styles.locatorBackdrop} 
                    onClick={() => setLocatorOpen(false)}
                />
                <QuickLocator 
                    cities={cityData} 
                    onCitySelect={(cityKey) => {
                        handleCitySelect(cityKey);
                        setLocatorOpen(false);
                    }} 
                    onResetView={() => {
                        handleResetView();
                        setLocatorOpen(false);
                    }} 
                />
            </>
        )}
        <button onClick={() => setFilterPanelOpen(true)} className={styles.openFilterBtn}>🔍 Filter Pins</button>
        
        {/* --- (4) REMOVED OLD CART BUTTON ---
            The cart button is now in the global Header component.
            We can delete the old button here.
        --- */}

        <div className={`${styles.panel} ${styles.filterPanel} ${isFilterPanelOpen ? styles.open : ''}`}>
            {/* The entire filter panel JSX remains unchanged... */}
            <div className={styles.panelHeader}>
              <h2>Filter Pins</h2>
              <button onClick={() => setFilterPanelOpen(false)} className={styles.closeBtn}>&times;</button>
            </div>
            <div className={styles.filterContent}>
              <div className={styles.mainCategories}>
                  {Object.keys(filterData).map(category => (
                      <div key={category} className={activeMainCategory === category ? styles.active : ''} onClick={() => setActiveMainCategory(category)}>
                          { { "Adventures": "🛍️", "Workshops": "✨", "Food": "🍽️", "Monuments": "🏛️" }[category] || '📍' } {category}
                      </div>
                  ))}
              </div>
              <div className={styles.subCategories}>
                  {(filterData[activeMainCategory] || []).map(subCategory => (
                      <div key={subCategory} className={selectedSubCategories.has(subCategory) ? styles.selected : ''} onClick={() => {
                          const newSet = new Set(selectedSubCategories);
                          if (newSet.has(subCategory)) newSet.delete(subCategory);
                          else newSet.add(subCategory);
                          setSelectedSubCategories(newSet);
                      }}>
                          {subCategory}
                      </div>
                  ))}
              </div>
            </div>
            <div className={styles.panelFooter}>
                <button onClick={handleReset} className={styles.panelBtn}>Reset</button>
                <button onClick={handleFilter} className={styles.panelBtn} style={{background: '#007bff'}}>View Pins</button>
            </div>
        </div>

        {/* --- (5) REMOVED OLD CART PANEL ---
            This is now handled by the global CartPanel component in layout.js.
        --- */}

        {/* The Checkout Modal can stay for now, but will eventually move to the CartPanel */}
        {isCheckoutModalOpen && clientSecret && (
            <div className={styles.checkoutModal}>
                <div className={styles.checkoutFormContainer}>
                    <div className={styles.panelHeader}>
                        <h2>Complete Payment</h2>
                        <button onClick={() => setCheckoutModalOpen(false)} className={styles.closeBtn}>&times;</button>
                    </div>
                    <Elements options={{ clientSecret }} stripe={stripePromise}>
                        <CheckoutForm onPaymentSuccess={() => {}} />
                    </Elements>
                </div>
            </div>
        )}
        
        {selectedPin && (
          <div className={styles.fullScreenModal} onClick={() => setSelectedPin(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.modalCloseBtn} onClick={() => setSelectedPin(null)}>&times;</button>
              {viewedProduct ? (
                <ProductDetail 
                    product={viewedProduct}
                    onAddToCart={addToCart} // <-- (6) USE GLOBAL addToCart
                    onBack={() => setViewedProduct(null)}
                />
              ) : (
                <>
                  {selectedPin.featured_image && <Image src={selectedPin.featured_image} alt={selectedPin.title} width={450} height={200} className={styles.modalImage} />}
                  <div className={styles.modalTextContent}>
                    <h2 className={styles.popupTitle}>{selectedPin.title}</h2>
                    <p className={styles.popupCategory}>{selectedPin.description}</p>
                    <div className="product-carousel-container" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        {modalProducts.status === 'loading' && <p>Loading products...</p>}
                        {modalProducts.status === 'error' && <p>Could not load products.</p>}
                        {modalProducts.status === 'success' && modalProducts.data.length > 0 && (
                            <>
                                <h4>Products Available:</h4>
                                {modalProducts.data.map(product => (
                                    <div key={product.id} onClick={() => setViewedProduct(product)} style={{padding: '8px 5px', borderBottom: '1px solid #333', cursor: 'pointer', color: '#fff'}}>
                                        {product.name}
                                    </div>
                                ))}
                            </>
                        )}
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </main>
    );
}