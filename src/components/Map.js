'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from '@/app/page.module.css';
import ReactDOM from 'react-dom/client';
import ProductDetail from './ProductDetail';

// ========================================================================
// SECTION: MAPBOX CONFIGURATION
// ========================================================================
mapboxgl.accessToken = 'pk.eyJ1IjoiaHlyb3N5IiwiYSI6ImNtZW84aHIyMzFjNXEybXNlZzN0c294N3oifQ.xSS6R2U0ClqqtR9Tfxmntw';

// ========================================================================
// SECTION: THE MAP COMPONENT
// ========================================================================
const Map = ({ allPins, setAllPins, displayedPins, setDisplayedPins, onAddToCart, onPinClick }) => {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const markersRef = useRef([]);

    // ========================================================================
    // SUB-SECTION: DATA FETCHING FUNCTION
    // ========================================================================
    const fetchLocations = useCallback(async () => {
        const apiUrl = 'https://data.hyrosy.com/wp-json/wp/v2/locations?acf_format=standard';
        try {
            const response = await fetch(apiUrl);
            if (!response.ok) throw new Error('API response was not ok.');
            const locations = await response.json();
           
            const livePinsData = locations.map(loc => {
                if (!loc.acf || !loc.acf.gps_coordinates) return null;
                const [lat, lng] = loc.acf.gps_coordinates.split(',').map(s => parseFloat(s.trim()));
                const imageUrl = loc.acf.featured_image ? loc.acf.featured_image.url : null;
                const description = loc.acf.description || '';
                return {
                    id: loc.id,
                    lng, lat,
                    title: loc.title.rendered,
                    description: description,
                    featured_image: imageUrl,
                    subCategory: loc.acf.map_sub_category,
                    category_connector_id: loc.acf.category_connector_id,
                    map_category: loc.acf.map_category ? loc.acf.map_category[0] : null,
                    color: '#007bff'
                };
            }).filter(Boolean);
           
            console.log('SUCCESS: Fetched', livePinsData.length, 'live pins from WordPress.');
            setAllPins(livePinsData);
            setDisplayedPins(livePinsData);
        } catch (error) {
            console.error('API fetch failed:', error);
        }
    }, [setAllPins, setDisplayedPins]); // Add dependencies here

    // ========================================================================
    // SUB-SECTION: PIN DISPLAY LOGIC
    // ========================================================================
    useEffect(() => {
        if (!map.current || !displayedPins) return;
       
        markersRef.current.forEach(marker => marker.remove());
        markersRef.current = [];

        displayedPins.forEach(pin => {
            const markerEl = document.createElement('div');
            markerEl.style.width = '20px';
            markerEl.style.height = '20px';
            markerEl.style.backgroundColor = pin.color || '#007bff';
            markerEl.style.borderRadius = '50%';
            markerEl.style.border = '2px solid white';
            markerEl.style.boxShadow = '0 0 10px rgba(0,0,0,0.5)';
            markerEl.style.cursor = 'pointer';

            markerEl.addEventListener('click', () => {
                onPinClick(pin);
            });

            const marker = new mapboxgl.Marker(markerEl)
                .setLngLat([pin.lng, pin.lat])
                .addTo(map.current);
           
            markersRef.current.push(marker);
        });
    }, [displayedPins, onPinClick]);

    // ========================================================================
    // SUB-SECTION: MAP INITIALIZATION & LIFECYCLE
    // ========================================================================
    useEffect(() => {
        if (map.current) return;
        map.current = new mapboxgl.Map({
            container: mapContainer.current,
            style: 'mapbox://styles/mapbox/light-v11',
            center: [-7.98, 31.63],
            zoom: 14,
            pitch: 60,
            bearing: -10
        });
        map.current.on('load', () => {
            map.current.addSource('mapbox-dem', {'type': 'raster-dem','url': 'mapbox://mapbox.terrain-rgb'});
            map.current.setTerrain({ 'source': 'mapbox-dem', 'exaggeration': 1.5 });
            map.current.addLayer({'id': 'add-3d-buildings','source': 'composite','source-layer': 'building','filter': ['==', 'extrude', 'true'],'type': 'fill-extrusion','minzoom': 15,'paint': {'fill-extrusion-color': '#aaa','fill-extrusion-height': ['get', 'height'],'fill-extrusion-base': ['get', 'min_height'],'fill-extrusion-opacity': 0.6}});
            fetchLocations();
        });
    }, [fetchLocations]); // The dependency is now correctly added here

    return (
        <div ref={mapContainer} className={styles.mapContainer} />
    );
};

export default Map;
