'use client';

import React, { useRef, useEffect } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from '@/app/page.module.css';

// CORRECTED: Removed the duplicate, incorrect line
mapboxgl.workerUrl = "/mapbox-gl-csp-worker.js";
mapboxgl.accessToken = 'pk.eyJ1IjoiaHlyb3N5IiwiYSI6ImNtZW84aHIyMzFjNXEybXNlZzN0c294N3oifQ.xSS6R2U0ClqqtR9Tfxmntw';

const Map = ({ mapRef, displayedPins, onPinClick, selectedCity, onAnimationEnd  }) => {
    const mapContainer = useRef(null);
    const markersRef = useRef([]);
    const lightingIntervalRef = useRef(null);

    const getLightingConfig = () => {
        const now = new Date();
        const moroccoHour = now.getUTCHours() + 1 + now.getMinutes() / 60;
        if (moroccoHour > 7 && moroccoHour < 19) { // Daytime
            const progress = (moroccoHour - 7) / 12;
            const sunAzimuth = 180 + progress * 180;
            const sunAltitude = Math.sin(progress * Math.PI) * 70;
            return { ambientIntensity: 0.6, directionalIntensity: 0.6, sunPosition: [1, sunAzimuth, sunAltitude] };
        }
        return { ambientIntensity: 0.1, directionalIntensity: 0.2, sunPosition: [1, 240, 20] }; // Nighttime
    };

    useEffect(() => {
        if (mapRef.current) return;
        const map = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/hyrosy/cmet0cvjx00db01qwc2gfet91',
            center: [-5.4, 32.2], zoom: 5.5, pitch: 0,
            maxBounds: [[-18, 27], [-1, 36]]
        });
        mapRef.current = map;
        return () => { if (lightingIntervalRef.current) clearInterval(lightingIntervalRef.current); };
    }, [mapRef]);

    // ========================================================================
    // SUB-SECTION: STYLE, 3D, POIs, AND CAMERA ANIMATION (REVISED)
    // ========================================================================
    useEffect(() => {
        if (!mapRef.current) return;
        const map = mapRef.current;
        
        if (lightingIntervalRef.current) clearInterval(lightingIntervalRef.current);

        const setupCityViewAndFly = () => {
            const lighting = getLightingConfig();
            map.setLights({
                'ambient': { 'intensity': lighting.ambientIntensity, 'color': 'white' },
                'directional': { 'intensity': lighting.directionalIntensity, 'cast-shadows': true, 'position': lighting.sunPosition }
            });
            map.setFog({});
            if (!map.getSource('mapbox-dem')) {
                map.addSource('mapbox-dem', { 'type': 'raster-dem', 'url': 'mapbox://mapbox.terrain-rgb' });
            }
            map.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });

            
            // **THE FIX:** The camera animation is now correctly placed inside this callback.
            map.flyTo({ center: selectedCity.center, zoom: 15, pitch: 75, bearing: -17.6, essential: true, speed: 1.2 });
            map.once('moveend', onAnimationEnd);

            lightingIntervalRef.current = setInterval(() => {
                const newLighting = getLightingConfig();
                map.setLights({
                    'ambient': { 'intensity': newLighting.ambientIntensity, 'color': 'white' },
                    'directional': { 'intensity': newLighting.directionalIntensity, 'cast-shadows': true, 'position': newLighting.sunPosition }
                });
            }, 60000);
        };

        if (selectedCity) {
        map.flyTo({
            center: selectedCity.center,
            zoom: 15,
            pitch: 75,
            bearing: -17.6,
            speed: 1.2,
            essential: true
        });
    }
}, [selectedCity, mapRef]);
    
    useEffect(() => {
        if (!mapRef.current || !mapRef.current.isStyleLoaded()) return;
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];
        displayedPins.forEach(pin => {
            const markerEl = document.createElement('div');
            markerEl.style.cssText = 'width: 20px; height: 20px; background-color: #007bff; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.5); cursor: pointer;';
            markerEl.addEventListener('click', () => onPinClick(pin));
            const marker = new mapboxgl.Marker(markerEl).setLngLat([pin.lng, pin.lat]).addTo(mapRef.current);
            markersRef.current.push(marker);
        });
    }, [displayedPins]);

    return <div ref={mapContainer} className={styles.mapContainer} />;
};

export default Map;