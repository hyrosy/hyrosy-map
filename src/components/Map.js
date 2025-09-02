'use client';

import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// The old CSS module import is no longer needed.

// Set the worker and access token once
mapboxgl.workerUrl = "/mapbox-gl-csp-worker.js";
mapboxgl.accessToken = 'pk.eyJ1IjoiaHlyb3N5IiwiYSI6ImNtZW84aHIyMzFjNXEybXNlZzN0c294N3oifQ.xSS6R2U0ClqqtR9Tfxmntw';

const Map = ({ mapRef, displayedPins, onPinClick, selectedCity, onAnimationEnd }) => {
    const mapContainer = useRef(null);
    const markersRef = useRef([]);

    // Main useEffect for map initialization and core logic
    useEffect(() => {
        if (mapRef.current) return;

        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/hyrosy/cmet0cvjx00db01qwc2gfet91',
            center: [-5.4, 32.2],
            zoom: 5.5,
            pitch: 0,
            maxBounds: [[-18, 27], [-1, 36]]
        });

        mapRef.current = map;

        map.on('load', () => {
            map.addSource('mapbox-dem', {
                'type': 'raster-dem',
                'url': 'mapbox://mapbox.terrain-rgb',
                'tileSize': 512,
                'maxzoom': 14
            });
            map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
            map.setFog({});
        });
        
        return () => {
            if (mapRef.current) {
                mapRef.current.remove();
                mapRef.current = null;
            }
        };
    }, [mapRef]);

    // Separate useEffect for handling camera flights when the city changes
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        
        // This useEffect now correctly handles both flying TO a city and flying BACK.
        if (selectedCity) {
            // Logic to fly TO a city
            if (map.isStyleLoaded()) {
                map.flyTo({
                    center: selectedCity.center,
                    zoom: 15,
                    pitch: 75,
                    bearing: -17.6,
                    speed: 1.2,
                    essential: true
                });
            }
        } else {
            // --- THIS IS THE CORRECTED LOGIC ---
            // Logic to fly back to the default "All Morocco" view when selectedCity is null
            if (map.isStyleLoaded()) {
                 map.flyTo({
                    center: [-5.4, 32.2],
                    zoom: 5.5,
                    pitch: 0,
                    bearing: 0,
                    speed: 1.2,
                    essential: true
                });
            }
        }

        if (onAnimationEnd) {
            map.once('moveend', onAnimationEnd);
        }
    }, [selectedCity, mapRef, onAnimationEnd]);

    // Separate useEffect for updating the pins
    useEffect(() => {
        const map = mapRef.current;
        if (!map || !map.isStyleLoaded()) return;

        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        displayedPins.forEach(pin => {
            const markerEl = document.createElement('div');
            markerEl.style.cssText = 'width: 20px; height: 20px; background-color: #007bff; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5); cursor: pointer;';
            markerEl.addEventListener('click', () => onPinClick(pin));
            
            const marker = new mapboxgl.Marker(markerEl)
                .setLngLat([pin.lng, pin.lat])
                .addTo(map);
                
            markersRef.current.push(marker);
        });
    }, [displayedPins, mapRef, onPinClick]);

    return <div ref={mapContainer} className="absolute top-0 left-0 w-full h-full" />;
};

export default Map;