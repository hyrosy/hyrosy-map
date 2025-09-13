'use client';

import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.workerUrl = "/mapbox-gl-csp-worker.js";
mapboxgl.accessToken = 'pk.eyJ1IjoiaHlyb3N5IiwiYSI6ImNtZW84aHIyMzFjNXEybXNlZzN0c294N3oifQ.xSS6R2U0ClqqtR9Tfxmntw';

const Map = ({ mapRef, displayedPins, onPinClick, selectedCity, onAnimationEnd, categoryIconMap, onLoad }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);

    // Effect for map initialization (runs only once)
    useEffect(() => {
        if (map.current) return; // Prevent re-initialization

        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/hyrosy/cmet0cvjx00db01qwc2gfet91',
            center: [-10.067870, 29.032917],
            zoom: 0.5,
            pitch: 0,
        });

        // Pass the map instance to the parent component
        if (mapRef) {
            mapRef.current = map.current;
        }

        map.current.on('load', () => {
            map.current.addSource('mapbox-dem', {
                'type': 'raster-dem',
                'url': 'mapbox://mapbox.terrain-rgb',
                'tileSize': 512,
                'maxzoom': 14
            });
            map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
            map.current.setFog({});
            
            // Signal that the map is loaded
            if (onLoad) onLoad(map.current);
        });
        
        // Cleanup function to run when the component is unmounted
        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
                 if (mapRef) {
                    mapRef.current = null;
                }
            }
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // <-- CORRECT: Empty dependency array ensures this runs only once.

    // Effect for handling camera flights (runs only when selectedCity changes)
    useEffect(() => {
        const currentMap = mapRef.current;
        if (!currentMap || !currentMap.isStyleLoaded()) return;
        
        const target = selectedCity 
            ? { // Fly TO a city
                center: selectedCity.center,
                zoom: 15,
                pitch: 75,
                bearing: -17.6
              }
            : { // Fly BACK to default view
                center: [-5.4, 32.2],
                zoom: 5.5,
                pitch: 0,
                bearing: 0
              };

        currentMap.flyTo({
            ...target,
            speed: 1.2,
            essential: true
        });

        if (onAnimationEnd) {
            currentMap.once('moveend', onAnimationEnd);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCity]); // <-- CORRECT: Only depends on the data that triggers the animation.

    // Effect for updating pins (runs only when the pins data changes)
    useEffect(() => {
        const currentMap = mapRef.current;
        if (!currentMap || !currentMap.isStyleLoaded()) return;

        // Clear existing markers
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        // Add new markers
        displayedPins.forEach(pin => {
            const primaryCategoryId = pin.location_category?.[0];
            const iconFile = categoryIconMap?.[primaryCategoryId] || 'adventure.png';

            const markerEl = document.createElement('div');
            markerEl.className = 'custom-marker'; 
            markerEl.style.backgroundImage = `url(/pin-icons/${iconFile})`;
            markerEl.style.width = '30px'; // Example style
            markerEl.style.height = '30px'; // Example style
            markerEl.style.backgroundSize = 'contain';

            markerEl.addEventListener('click', (e) => {
                e.stopPropagation();
                onPinClick(pin);
            });
            
            const marker = new mapboxgl.Marker(markerEl)
                .setLngLat([pin.lng, pin.lat])
                .addTo(currentMap);
                
            markersRef.current.push(marker);
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [displayedPins]); // <-- CORRECT: Only depends on the data for the pins.

    return <div ref={mapContainer} className="absolute top-0 left-0 w-full h-full" />;
};

export default Map;