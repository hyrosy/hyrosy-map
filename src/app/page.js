'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import ProductDetail from '@/components/ProductDetail';
import PinDetailsModal from '@/components/PinDetailsModal';
import Image from 'next/image';
import QuickLocator from '@/components/QuickLocator';
import StoryModal from '@/components/StoryModal';
import FilterPanel from '@/components/FilterPanel';
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { MapPin, Search } from 'lucide-react';


const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
      <p className="text-lg text-gray-600">Loading Map...</p>
    </div>
  )
});

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
    
    const [isFilterPanelOpen, setFilterPanelOpen] = useState(false);
    const [allPins, setAllPins] = useState([]);
    const [displayedPins, setDisplayedPins] = useState([]);
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
    const { addToCart } = useCart();

    useEffect(() => {
        const fetchCityPins = async () => {
            if (!selectedCity) {
                setAllPins([]);
                setDisplayedPins([]);
                return;
            }
            const apiUrl = `https://data.hyrosy.com/wp-json/wp/v2/locations?city=${selectedCity.name.toLowerCase()}&acf_format=standard&per_page=100`;
            try {
                const response = await fetch(apiUrl);
                if (!response.ok) throw new Error('API response was not ok.');
                const locations = await response.json();
                const cityPinsData = locations.map(loc => {
                    if (!loc.acf || !loc.acf.gps_coordinates) return null;
                    const [lat, lng] = loc.acf.gps_coordinates.split(',').map(s => parseFloat(s.trim()));
                    return { ...loc, id: loc.id, lng, lat };
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

    useEffect(() => {
        if (!selectedPin) {
            setViewedProduct(null);
            return;
        }
        if (selectedPin.acf.category_connector_id || selectedPin.acf.connector_id) {
            const fetchProducts = async () => {
                setModalProducts({ status: 'loading', data: [] });
                const wooApiUrl = selectedPin.acf.category_connector_id
                    ? `https://www.hyrosy.com/wp-json/wc/v3/products?category=${selectedPin.acf.category_connector_id}`
                    : `https://www.hyrosy.com/wp-json/wc/v3/products/${selectedPin.acf.connector_id}`;
                const authString = btoa(`${process.env.NEXT_PUBLIC_WOOCOMMERCE_KEY}:${process.env.NEXT_PUBLIC_WOOCOMMERCE_SECRET}`);
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

    const handleFilter = (selectedSubs) => {
        setDisplayedPins(selectedSubs.length === 0 ? allPins : allPins.filter(pin => selectedSubs.includes(pin.acf.map_sub_category)));
    };

    const handleReset = () => {
        setDisplayedPins(allPins);
    };

    return (
      <main className="absolute inset-0">
        <Map 
            mapRef={mapRef}
            displayedPins={displayedPins}
            onPinClick={setSelectedPin}
            selectedCity={selectedCity}
        />
        
        {/* This is a dedicated container for ALL UI elements that sits ON TOP of the map */}
        <div className="absolute top-0 left-0 w-full h-full z-10 pointer-events-none">
            {/* Loading Overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white pointer-events-auto">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
                    <p className="mt-4">Entering City...</p>
                </div>
            )}

            {/* Bottom-center controls */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-full max-w-sm px-4 pointer-events-auto flex items-center gap-2">
                <Button 
                    size="icon"
                    variant="secondary"
                    className="h-14 w-14 rounded-full shadow-lg bg-black text-white hover:bg-gray-800 flex-shrink-0"
                    onClick={() => setLocatorOpen(true)}
                    title="Quick Locator"
                >
                    <MapPin className="h-6 w-6" />
                </Button>
                <Button 
                    size="lg"
                    className="w-full shadow-lg rounded-full h-14 text-base font-semibold bg-[#d3bc8e] text-black hover:bg-[#c8b185]" 
                    onClick={() => setFilterPanelOpen(true)}
                >
                    <Search className="h-5 w-5 mr-2" />
                    Filter Experiences
                </Button>
                
            </div>
        </div>

        {isStoryModalOpen && <StoryModal videoUrl={storyContentUrl} onClose={() => setStoryModalOpen(false)} />}
    
        {isLocatorOpen && (
            <>
                <div 
                    className="fixed inset-0 bg-black/30 z-40" 
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

        

        <FilterPanel
            isOpen={isFilterPanelOpen}
            onClose={() => setFilterPanelOpen(false)}
            filterData={filterData}
            onFilter={handleFilter}
            onReset={handleReset}
        />
        {/* --- Use the new, refactored modal here --- */}
        <PinDetailsModal 
            pin={selectedPin}
            onClose={() => setSelectedPin(null)}
            onAddToCart={addToCart}
        />
    
      </main>
    );
}