'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import ProductDetail from '@/components/ProductDetail';
import PinDetailsModal from '@/components/PinDetailsModal';
import Image from 'next/image';
import QuickLocator from '@/components/QuickLocator';
import StoryModal from '@/components/StoryModal';
import FilterPanel from '@/components/FilterPanel';
import QuestPanel from '@/components/QuestPanel';
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { MapPin, Search, Route, BookOpen  } from 'lucide-react'; // Add Route here
import StoryArchivePanel from '@/components/StoryArchivePanel';
// import QuestPanel from '@/components/QuestPanel';




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

    const [isQuestPanelOpen, setQuestPanelOpen] = useState(false);
    const [quests, setQuests] = useState([]);
    const [activeQuest, setActiveQuest] = useState(null);
    const [questStepIndex, setQuestStepIndex] = useState(0);

    // --- ADDITION: State for the Story Archive Panel ---
    const [isStoryArchiveOpen, setStoryArchiveOpen] = useState(false); 

    // --- ADDITION: New state to hold the story ID from a pin click ---
    const [initialStoryId, setInitialStoryId] = useState(null);

    // --- ADDITION: Function to open the story panel from the pin modal ---
    const handleReadStory = (storyId) => {
        setInitialStoryId(storyId); // Set the specific story to show
        setStoryArchiveOpen(true);  // Open the main panel
        setSelectedPin(null);       // Close the pin modal
    };

    // --- ADDITION: Function to handle closing the story panel ---
    const handleCloseStoryArchive = () => {
        setStoryArchiveOpen(false);
        setInitialStoryId(null); // Reset the specific story ID
    };

    // --- ADDITION: State for tracking explored quest steps ---
    const [exploredSteps, setExploredSteps] = useState(() => {
    // This function only runs once on the initial load
    if (typeof window !== 'undefined') {
        const saved = window.localStorage.getItem('exploredSteps');
        if (saved) {
            // If we found saved data, parse it and create a new Set from it
            const initialValue = JSON.parse(saved);
            return new Set(initialValue);
        }
    }
    // If no saved data, start with an empty Set
    return new Set();
});

    // In src/app/page.js

    const handleToggleStepExplored = (stepId) => {
        setExploredSteps(prevExplored => {
            const newExplored = new Set(prevExplored);
            if (newExplored.has(stepId)) {
                newExplored.delete(stepId); // If it's already there, remove it
            } else {
                newExplored.add(stepId); // Otherwise, add it
            }
            return newExplored;
        });
    };

    // This effect saves the explored steps to localStorage whenever they change
    useEffect(() => {
        if (typeof window !== 'undefined') {
            // Convert the Set to an Array to be able to store it as a JSON string
            const stepsArray = Array.from(exploredSteps);
            window.localStorage.setItem('exploredSteps', JSON.stringify(stepsArray));
        }
    }, [exploredSteps]);


    useEffect(() => {
    const fetchQuests = async () => {
        const apiUrl = 'https://data.hyrosy.com/wp-json/wp/v2/quests?acf_format=standard';
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('API response was not ok.');
            const questsData = await response.json();
            setQuests(questsData);
        } catch (error) {
            console.error('Failed to fetch quests:', error);
        }
    };
    fetchQuests();
}, []);


    useEffect(() => {
        const fetchCityPins = async () => {
            if (!selectedCity) {
                setAllPins([]);
                setDisplayedPins([]);
                return;
            }
            setIsLoading(true); // <-- Start loading here
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

            } finally {
            setIsLoading(false); // <-- Stop loading here, after the fetch is done

            }
        };
        fetchCityPins();
        if (selectedCity && !viewedCities.has(selectedCity.name.toLowerCase())) {
            setStoryContentUrl(selectedCity.storyUrl);
            setStoryModalOpen(true);
            setViewedCities(prev => new Set(prev).add(selectedCity.name.toLowerCase()));        }
    }, [selectedCity]);

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
    setSelectedCity(cityData[cityKey]);
    };
    
    const handleResetView = () => {
    setSelectedCity(null);
    setDisplayedPins([]);
    };

    const handleFilter = (selectedSubs) => {
        setDisplayedPins(selectedSubs.length === 0 ? allPins : allPins.filter(pin => selectedSubs.includes(pin.acf.map_sub_category)));
    };

    const handleReset = () => {
        setDisplayedPins(allPins);
    };

    const handleQuestSelect = (quest) => {
        setActiveQuest(quest);
        setQuestStepIndex(0); // Always reset to the first step when a NEW quest is selected
    };

    const handleQuestStepSelect = (step, index) => {
        setQuestStepIndex(index); // Update the index
        setSelectedPin(step); // <-- THIS IS THE FIX

        if (step && mapRef.current) {
            const [lat, lng] = step.acf.gps_coordinates.split(',').map(s => parseFloat(s.trim()));
            mapRef.current.flyTo({
                center: [lng, lat],
                zoom: 16,
                pitch: 60,
                speed: 1.0,
                essential: true,
            });
    }
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
                    Filter Pins
                </Button>
                <Button
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg bg-black text-white hover:bg-gray-800 flex-shrink-0"
                onClick={() => setQuestPanelOpen(true)}
                >
                <Route className="h-5 w-5 mr-2" />
                </Button> 
                {/* --- ADDITION: New Story Archive Button --- */}
                <Button
                size="icon"
                className="h-14 w-14 rounded-full shadow-lg bg-black text-white hover:bg-gray-800 flex-shrink-0"
                onClick={() => setStoryArchiveOpen(true)}
                title="Story Archive"
               >   
                <BookOpen className="h-6 w-6" />
                </Button>       
            </div>
        </div>

        {isStoryModalOpen && <StoryModal videoUrl={storyContentUrl} onClose={() => setStoryModalOpen(false)} />}
    
        {isLocatorOpen && (
    <>
        <div 
            className="fixed inset-0 z-40" // Simplified backdrop
            onClick={() => setLocatorOpen(false)}
            
        />
        <QuickLocator 
            isOpen={isLocatorOpen} // <-- PASS THE PROP HERE
            onClose={() => setLocatorOpen(false)}
            cities={cityData} 
            onCitySelect={(cityKey) => {
                handleCitySelect(cityKey);
                setLocatorOpen(false);
                setTimeout(() => setLocatorOpen(false), 100); 

            }} 
            onResetView={() => {
                handleResetView();
                setLocatorOpen(false);
                setTimeout(() => setLocatorOpen(false), 100); 

            }} 
        />
        </>
        )}

        <QuestPanel
            onToggleStepExplored={handleToggleStepExplored} // Pass the new handler down
            exploredSteps={exploredSteps} // Pass the explored steps set down       
            isOpen={isQuestPanelOpen}
            onClose={() => setQuestPanelOpen(false)}
            quests={quests}
            activeQuest={activeQuest}
            onQuestSelect={handleQuestSelect} // Use the new handler
            currentStepIndex={questStepIndex} // Pass the state down
            onStepSelect={handleQuestStepSelect} // Pass the handler down
            selectedCity={selectedCity}
            
        />

        {/* --- ADDITION: Render the StoryArchivePanel --- */}
        <StoryArchivePanel 
            isOpen={isStoryArchiveOpen}
            onClose={() => setStoryArchiveOpen(false)}
            initialStoryId={initialStoryId} // Pass the specific story ID to open
        />


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
            isOpen={!!selectedPin} // <-- ADD THIS LINE
            onClose={() => setSelectedPin(null)}
            onAddToCart={addToCart}
            onReadStory={handleReadStory}
        />
    
      </main>
    );
}