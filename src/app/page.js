'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import styles from './page.module.css';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from '@/components/CheckoutForm';

// ========================================================================
// SECTION: DYNAMIC IMPORT & STRIPE INITIALIZATION
// ========================================================================
const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false 
});

// Using your LIVE Publishable Key. For testing, you can swap this with your test key.
const stripePromise = loadStripe('pk_live_51PWc0EP8TGcYvcnxRvYWWqJj4CU7dDENqzmk5zVfn2uSfF7At1RW7KuNjQCogPQRnBMCy1wEcQPxDRGj3rMk6Kgo00HZs2tuve');


// ========================================================================
// SECTION: HOMEPAGE COMPONENT
// ========================================================================
export default function Home() {
    // ========================================================================
    // SUB-SECTION: STATE MANAGEMENT (No Duplicates)
    // ========================================================================
    const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
    const [isCartPanelOpen, setCartPanelOpen] = useState(false);
    const [isCheckoutModalOpen, setCheckoutModalOpen] = useState(false);
    const [allPins, setAllPins] = useState([]);
    const [displayedPins, setDisplayedPins] = useState([]);
    const [activeMainCategory, setActiveMainCategory] = useState("Adventures");
    const [selectedSubCategories, setSelectedSubCategories] = useState(new Set());
    const [cart, setCart] = useState([]);
    const [clientSecret, setClientSecret] = useState('');
    const [selectedPin, setSelectedPin] = useState(null);
    const [modalProducts, setModalProducts] = useState({ status: 'idle', data: [] });
    const [viewedProduct, setViewedProduct] = useState(null); // To track the product detail view


    const filterData = {
      "Artisan": ["Leather"],
      "Adventures": ["Quad Biking", "Camel Rides", "Buggy Tours"],
      "Workshops": ["Cooking Class", "Pottery", "Artisan Crafts"],
      "Food": ["Traditional Food", "Moroccan Sweets", "Cafes"],
      "Monuments": ["Historic Sites", "Gardens", "Museums"]
    };

    // ========================================================================
    // SUB-SECTION: HELPER FUNCTIONS
    // ========================================================================
    const handleFilter = () => {
        const selectedArray = Array.from(selectedSubCategories);
        if (selectedArray.length === 0) {
            setDisplayedPins(allPins);
        } else {
            const filtered = allPins.filter(pin => selectedArray.includes(pin.subCategory));
            setDisplayedPins(filtered);
        }
        setFilterPanelOpen(false);
    };

    const handleReset = () => {
        setSelectedSubCategories(new Set());
        setDisplayedPins(allPins);
    };

    const handleAddToCart = (pinToAdd) => {
      setCart(prevCart => {
          if (prevCart.find(item => item.id === pinToAdd.id)) {
              alert('Item is already in your cart.');
              return prevCart;
          }
          return [...prevCart, pinToAdd];
      });
    };
    
    const handleCheckout = async () => {
        if (cart.length === 0) {
            alert('Your cart is empty.');
            return;
        }
        setCartPanelOpen(false);
        const totalAmountInCents = 1999; // Placeholder price

        try {
            const res = await fetch('/api/create-payment-intent', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: totalAmountInCents }),
            });
            const data = await res.json();
            
            if (data.clientSecret) {
                setClientSecret(data.clientSecret);
                setCheckoutModalOpen(true);
            } else {
                alert('Could not start checkout. Please try again.');
            }
        } catch (error) {
            console.error("Failed to create payment intent:", error);
            alert('Could not connect to the payment server.');
        }
    };
    
    const onPaymentSuccess = () => {
        setTimeout(() => {
            alert('Payment confirmed! Thank you.');
            setCheckoutModalOpen(false);
            setClientSecret('');
            setCart([]);
        }, 1000);
    };
    // ========================================================================
    // This hook fetches products when a pin's modal is opened
    // ========================================================================
    useEffect(() => {
        // When the modal closes, reset the viewed product
        if (!selectedPin) {
            setViewedProduct(null);
            return;
        }

        if (selectedPin.category_connector_id || selectedPin.connector_id) {
            const fetchProducts = async () => {
                setModalProducts({ status: 'loading', data: [] });

                const wooApiUrl = selectedPin.category_connector_id
                    ? `https://hyrosy.com/wp-json/wc/v3/products?category=${selectedPin.category_connector_id}`
                    : `https://hyrosy.com/wp-json/wc/v3/products/${selectedPin.connector_id}`;

                const consumerKey = 'ck_a97513965f94aeeb193fcf57ba06ac615c52cd5e';
                const consumerSecret = 'cs_9b522ebc8221748dad57255f1dc9c8eec5ec1b1d';
                const authString = btoa(`${consumerKey}:${consumerSecret}`);

                try {
                    const response = await fetch(wooApiUrl, {
                        headers: { 'Authorization': `Basic ${authString}` }
                    });
                    if (!response.ok) throw new Error('WooCommerce API response not ok');
                    
                    // Use 'let' instead of 'const' to allow reassignment
                    let products = await response.json();
                    
                    // Normalize the result into an array if it's a single object
                    if (!Array.isArray(products)) {
                        products = [products];
                    }

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
    }, [selectedPin]); // This hook runs every time `selectedPin` changes


    // ========================================================================
    // SUB-SECTION: RENDER
    // ========================================================================
    return (
      <main className={styles.mainContainer}>
        <Map 
          allPins={allPins}
          setAllPins={setAllPins}
          displayedPins={displayedPins}
          setDisplayedPins={setDisplayedPins}
          onAddToCart={handleAddToCart}
          onPinClick={setSelectedPin}
        />

        {/* --- UI Elements --- */}
        <button onClick={() => setFilterPanelOpen(true)} className={styles.openFilterBtn}>🔍 Filter Pins</button>
        <button onClick={() => setCartPanelOpen(true)} className={styles.cartIcon}>
            🛒
            {cart.length > 0 && <span className={styles.cartCount}>{cart.length}</span>}
        </button>
        
        {/* --- Filter Panel --- */}
        <div className={`${styles.panel} ${styles.filterPanel} ${isFilterPanelOpen ? styles.open : ''}`}>
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

        {/* --- Cart Panel --- */}
        <div className={`${styles.panel} ${styles.cartPanel} ${isCartPanelOpen ? styles.open : ''}`}>
            <div className={styles.panelHeader}>
                <h2>Your Itinerary</h2>
                <button onClick={() => setCartPanelOpen(false)} className={styles.closeBtn}>&times;</button>
            </div>
            <div id="cart-items" style={{flexGrow: 1, overflowY: 'auto'}}>
                {cart.length === 0 ? <p>Your cart is empty.</p> :
                    cart.map(item => <div key={item.id} style={{padding: '5px 0'}}>- {item.title}</div>)
                }
            </div>
            {cart.length > 0 && (
              <div className={styles.panelFooter}>
                  <button onClick={handleCheckout} className={styles.panelBtn} style={{width: '100%', background: '#28a745'}}>
                      Proceed to Checkout
                  </button>
              </div>
            )}
        </div>

        {/* --- Checkout Modal --- */}
        {isCheckoutModalOpen && clientSecret && (
            <div className={styles.checkoutModal}>
                <div className={styles.checkoutFormContainer}>
                    <div className={styles.panelHeader}>
                        <h2>Complete Payment</h2>
                        <button onClick={() => setCheckoutModalOpen(false)} className={styles.closeBtn}>&times;</button>
                    </div>
                    <Elements options={{ clientSecret }} stripe={stripePromise}>
                        <CheckoutForm onPaymentSuccess={onPaymentSuccess} />
                    </Elements>
                </div>
            </div>
        )}

        {/* --- Full-Screen Pin Detail Modal --- */}
        {selectedPin && (
          <div className={styles.fullScreenModal} onClick={() => setSelectedPin(null)}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
              <button className={styles.modalCloseBtn} onClick={() => setSelectedPin(null)}>&times;</button>
              
              {/* This now conditionally renders the Product Detail or the Location Info */}
              {viewedProduct ? (
                <ProductDetail 
                    product={viewedProduct}
                    onAddToCart={handleAddToCart}
                    onBack={() => setViewedProduct(null)}
                />
              ) : (
                <>
                  {selectedPin.featured_image && <img src={selectedPin.featured_image} alt={selectedPin.title} className={styles.modalImage} />}
                  <div className={styles.modalTextContent}>
                    <h2 className={styles.popupTitle}>{selectedPin.title}</h2>
                    <p className={styles.popupCategory}>{selectedPin.description}</p>
                    
                    {/* Product Carousel Logic */}
                    <div className="product-carousel-container" style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                        {modalProducts.status === 'loading' && <p>Loading products...</p>}
                        {modalProducts.status === 'error' && <p>Could not load products.</p>}
                        {modalProducts.status === 'success' && modalProducts.data.length === 0 && <p>No products found.</p>}
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