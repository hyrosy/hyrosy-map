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
import { MapPin, Search, Route, BookOpen, Crosshair } from 'lucide-react'; // Add Route here
import StoryArchivePanel from '@/components/StoryArchivePanel';
import mbxDirections from '@mapbox/mapbox-sdk/services/directions'; // Add this import at the top
import mapboxgl from 'mapbox-gl'; 






const Map = dynamic(() => import('@/components/Map'), { 
  ssr: false,
  loading: () => (
    <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
      <p className="text-lg text-gray-600">Loading Map...</p>
    </div>
  )
});

export default function Home() {

    const [installPromptEvent, setInstallPromptEvent] = useState(null);
    
    useEffect(() => {
        const handler = (e) => {
            e.preventDefault(); // Prevents the default mini-infobar from appearing
            setInstallPromptEvent(e); // Save the event for later
        };

        window.addEventListener('beforeinstallprompt', handler);

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    // We'll also need state for an iOS instruction modal
    const [showIosInstallPopup, setShowIosInstallPopup] = useState(false);

    const handleInstallClick = () => {
        // If we have a saved prompt event (on Android), show it.
        if (installPromptEvent) {
            installPromptEvent.prompt();
        } else {
            // Otherwise, check if the user is on iOS
            const isIos = /iPad|iPhone|iPod/.test(navigator.userAgent);
            if (isIos) {
                // If they are on iOS, show our custom instruction popup
                setShowIosInstallPopup(true);
            } else {
                // For other browsers, you can show a generic alert
                alert("To install, please use the 'Add to Home Screen' option in your browser's menu.");
            }
        }
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

    const [allCategories, setAllCategories] = useState([]); 

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

    const [filterData, setFilterData] = useState({});
    const [isStoryArchiveOpen, setStoryArchiveOpen] = useState(false); 
    const [initialStoryId, setInitialStoryId] = useState(null);


    const directionsClient = mbxDirections({ accessToken: process.env.NEXT_PUBLIC_MAPBOX_TOKEN });

    const [userMarker, setUserMarker] = useState(null); // State to hold the user's location marker

    const handleGoToUserLocation = () => {
        console.log('Function called. Current userMarker state is:', userMarker);

        if (!mapRef.current) return; // Make sure the map is available

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { longitude, latitude } = position.coords;
                const userCoords = [longitude, latitude];
                const map = mapRef.current;

                // 1. Smoothly move the map to the user's location
                map.flyTo({
                    center: userCoords,
                    zoom: 16, // Zoom in to a street-level view
                    pitch: 75,
                    essential: true
                });

                // 2. Add or update the blue dot marker
                if (userMarker) {
                    // If the marker already exists, just move it
                    userMarker.setLngLat(userCoords);
                } else {
                    // 1. Create a new HTML element
                    const markerElement = document.createElement('div');
                    markerElement.className = 'user-marker';

                    // 2. Create the marker using the custom element
                    const newMarker = new mapboxgl.Marker(markerElement)
                        .setLngLat(userCoords)
                        .addTo(map);
                    
                    setUserMarker(newMarker); // Save the new marker to state
                }
            },
            (error) => {
                console.error("Error getting user location:", error);
                alert("Could not get your location. Please enable location services.");
            }
        );
    }; // End of handleGoToUserLocation

    const handleGetDirections = (pin) => {
    // 1. Close the pin modal, as you requested.
    setSelectedPin(null); 
    
    console.log("Requesting directions for:", pin.title.rendered);

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const { longitude, latitude } = position.coords;
            const userCoords = [longitude, latitude];
            const pinCoords = [pin.lng, pin.lat];
            const map = mapRef.current;
            if (!map) return;

            // 2. Create a 'bounds' object to fit both points.
            const bounds = new mapboxgl.LngLatBounds(userCoords, pinCoords);

            // 3. Animate the map to show the full overview.
            map.fitBounds(bounds, {
                padding: { top: 80, bottom: 80, left: 60, right: 60 },
                essential: true
            });
            
            // 4. Add/update the user location marker.
            if (userMarker) {
                userMarker.setLngLat(userCoords);
            } else {
                const newMarker = new mapboxgl.Marker({ color: "#3887be" })
                    .setLngLat(userCoords)
                    .addTo(map);
                setUserMarker(newMarker);
            }
            
            // 5. Fetch and draw the route (This was the missing line).
            fetchRoute(userCoords, pinCoords);
        }, 
        (error) => {
            console.error("Error getting user location:", error);
            alert("Could not get your location. Please ensure you have enabled location services.");
        }
    );
};

const fetchRoute = async (start, end) => {
    if (!mapRef.current) return;

    // LOG 3: Are we trying to fetch the route?
    console.log("%c3. Fetching route from Mapbox...", "color: orange;", { start, end });

    try {
        const response = await directionsClient.getDirections({
            profile: 'driving-traffic', // Or 'walking', 'cycling'
            waypoints: [
                { coordinates: start },
                { coordinates: end }
            ],
            geometries: 'geojson'
        }).send();

        // LOG 4: Did we get a response from Mapbox?
        console.log("%c4. Received response from Mapbox:", "color: cyan;", response);

        const route = response.body.routes[0].geometry.coordinates;
        drawRoute(route);

    } catch (err) {
        console.error("Mapbox API Error:", err);
        alert("Sorry, could not calculate the route.");
    }
};

const drawRoute = (route) => {
    console.log("%c--- STARTING DRAW TEST ---", "color: violet; font-weight: bold;");
    
    const map = mapRef.current;
    if (!map) {
        console.error("Test Result: FAILED. The map reference (mapRef) is not available.");
        return;
    }

    const isMapReady = map.isStyleLoaded();
    console.log(`Is the map ready right now? -> ${isMapReady}`);

    const addDataToMap = () => {
        if (map.getSource('route')) {
            map.getSource('route').setData({
                'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'LineString', 'coordinates': route }
            });
        } else {
            map.addSource('route', {
                'type': 'geojson', 'data': { 'type': 'Feature', 'properties': {}, 'geometry': { 'type': 'LineString', 'coordinates': route } }
            });
            map.addLayer({
                'id': 'route', 'type': 'line', 'source': 'route', 'layout': { 'line-join': 'round', 'line-cap': 'round' }, 'paint': { 'line-color': '#EFBF04', 'line-width': 5, 'line-opacity': 0.75 }
            });
        }
        console.log("%cTest Result: SUCCESS. The route should now be drawn on the map.", "color: limegreen; font-weight: bold;");
    };

    if (isMapReady) {
        console.log("Conclusion: Map was already loaded. Drawing immediately.");
        addDataToMap();
    } else {
        console.log("Conclusion: Map was NOT ready. Waiting for the 'load' event to fire...");
        map.once('load', () => {
            console.log("...The 'load' event has fired! Now drawing the route.");
            addDataToMap();
        });
    }
};   // End of drawRoute function




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
// --- EFFECT 1: Fetch global data (categories) ONCE on startup ---
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categoriesResponse = await fetch('https://data.hyrosy.com/wp-json/wp/v2/location_category?per_page=100');
                if (!categoriesResponse.ok) throw new Error('Failed to fetch categories');
                const categories = await categoriesResponse.json();
                
                setAllCategories(categories); // Store raw category data

                // Format data for the filter panel
                const formattedFilters = {};
                const parentCategories = categories.filter(cat => cat.parent === 0);
                parentCategories.forEach(parent => {
                    formattedFilters[parent.name] = categories
                        .filter(child => child.parent === parent.id)
                        .map(child => child.name);
                });
                setFilterData(formattedFilters);
            } catch (error) {
                console.error("Failed to fetch location categories:", error);
                setFilterData({}); // Set to empty on error to stop loading
            }
        };
        fetchCategories();
    }, []); // Empty array means this runs only once.

    // The ONLY useEffect for fetching city pins
useEffect(() => {
    const fetchCityPins = async () => {
        if (!selectedCity) {
            setAllPins([]);
            setDisplayedPins([]);
            return;
        }
        setIsLoading(true);

        // COMBINED: Get embedded categories AND standard ACF format
        const apiUrl = `https://data.hyrosy.com/wp-json/wp/v2/locations?city=${selectedCity.name.toLowerCase()}&per_page=100&_embed&acf_format=standard`;

        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('API response was not ok.');
            const locations = await response.json();

            // MODIFIED: Process the coordinate string that we know works
            // This is the logic from the useEffect you said was working.
            const cityPinsData = locations.map(loc => {
                if (!loc.acf || !loc.acf.gps_coordinates) return null; // Check for the coordinate string
                const [lat, lng] = loc.acf.gps_coordinates.split(',').map(s => parseFloat(s.trim()));
                // Ensure the pin has valid coordinates before returning it
                if (isNaN(lat) || isNaN(lng)) return null;
                return { ...loc, id: loc.id, lat, lng }; // Add lat/lng to the top level for easy access
            }).filter(Boolean); // This removes any null entries from the array

            setAllPins(cityPinsData);
            setDisplayedPins(cityPinsData);

            // This logic for the story modal can stay
            if (!viewedCities.has(selectedCity.name.toLowerCase())) {
                setStoryContentUrl(selectedCity.storyUrl);
                setStoryModalOpen(true);
                setViewedCities(prev => new Set(prev).add(selectedCity.name.toLowerCase()));
            }

        } catch (error) {
            console.error(`API fetch failed for ${selectedCity.name}:`, error);
            setAllPins([]);
            setDisplayedPins([]);
        } finally {
            setIsLoading(false);
        }
    };
    fetchCityPins();
}, [selectedCity]); // Removed viewedCities from dependency array to prevent re-fetching

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

   // --- FILTERING LOGIC (Now works on the current city's pins) ---
    const handleFilter = (selectedSubs) => {
  // LOG 1: What did we receive from the panel?
  console.log('%cHome Page: Received selections from panel:', 'color: orange; font-weight: bold;', selectedSubs);

  // --- REPLACEMENT for .flat() ---
  // This is a more compatible way to get all selected subcategory names into one array
  const selectedSubCategoryNames = Object.values(selectedSubs).reduce((acc, val) => acc.concat(val), []);
  
  if (selectedSubCategoryNames.length === 0) {
    setDisplayedPins(allPins);
    return;
  }

  // LOG 2: What are the names we're trying to match?
  console.log('Home Page: Flattened subcategory names to search for:', selectedSubCategoryNames);

  const selectedSubCategoryIds = new Set(
    allCategories
      .filter(cat => selectedSubCategoryNames.includes(cat.name))
      .map(cat => cat.id)
  );

  // LOG 3: Did we successfully find the IDs for those names?
  console.log('%cHome Page: Found matching category IDs:', 'color: lightgreen; font-weight: bold;', selectedSubCategoryIds);

  // --- NEW LOG ---
  // Let's check if we have pins to filter
  console.log(`Home Page: About to filter ${allPins.length} pins...`);

  const filtered = allPins.filter(pin => {
    // Check if the pin actually has the category data. This is a critical check.
    const pinCategoryIds = pin.location_category || [];
    
    // For debugging, let's inspect the first pin
    if (pin === allPins[0]) {
      console.log('Home Page: Inspecting first pin. It has category IDs:', pinCategoryIds);
      // Let's also see the pin object itself to confirm its structure
      console.log('Home Page: Full first pin object:', pin); 
    }
    
    return pinCategoryIds.some(id => selectedSubCategoryIds.has(id));
  });

  // LOG 4: What is the final result?
  console.log(`%cHome Page: Filtering complete. Found ${filtered.length} matching pins.`, 'color: yellow; font-weight: bold;');

  setDisplayedPins(filtered);
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

    // --- ADDITION: Handle when a user clicks a search result ---
    const handleSearchResultSelect = (pin) => {
    if (mapRef.current && pin.lat && pin.lng) {
        const map = mapRef.current;
        map.flyTo({
            center: [pin.lng, pin.lat], // Use the lat/lng we added during fetching
            zoom: 15,
            essential: true
        });

        // Set a slight delay to allow the map to pan before the modal opens
        setTimeout(() => {
            setSelectedPin(pin);
        }, 500);
    } else {
        
    }
    // You also need to close the filter panel
    setFilterPanelOpen(false);
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

            

            {/* A simple modal to show iOS instructions */}
            {showIosInstallPopup && (
                <div className="ios-install-popup">
                    <p>To install, tap the Share icon and then 'Add to Home Screen'.</p>
                    <button onClick={() => setShowIosInstallPopup(false)}>Close</button>
                </div>
            )}

            <div className="absolute top-1/2 right-4 pointer-events-auto">
            <button
                onClick={handleGoToUserLocation} // We will create this function next
                className="bg-white/80 backdrop-blur-sm rounded-full h-12 w-12 flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                title="Go to my location"
            >
                <Crosshair className="h-6 w-6 text-gray-700" />
            </button>

            {/* Add the "Install" button somewhere in your UI */}
            <button onClick={handleInstallClick} className="bg-white/80 backdrop-blur-sm rounded-full h-12 w-12 flex items-center justify-center shadow-lg hover:bg-white transition-colors">App</button>
            </div>

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
            allPins={allPins} // Pass all pins for searching
            onSearchResultSelect={handleSearchResultSelect} // Pass the handler function
        />


        {/* --- Use the new, refactored modal here --- */}
        <PinDetailsModal 
            pin={selectedPin}
            isOpen={!!selectedPin} // <-- ADD THIS LINE
            onClose={() => setSelectedPin(null)}
            onAddToCart={addToCart}
            onReadStory={handleReadStory}
            onGetDirections={handleGetDirections} // Pass the new directions handler
        />
    
      </main>
    );
}