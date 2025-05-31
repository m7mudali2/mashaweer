import React from 'react';

const MapStyle = () => (
  <style>{`
    .driver-marker {
      background-size: cover;
      width: 40px;
      height: 40px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid white;
      box-shadow: 0 0 0 2px hsl(var(--primary));
    }
    .user-marker {
      background-image: url('data:image/svg+xml;charset=UTF-8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="%23007bff" width="24px" height="24px"><path d="M12 2C8.13 2 5 5.13 5 9c0 4.17 4.42 9.92 6.24 12.11.4.48 1.13.48 1.53 0C14.58 18.92 19 13.17 19 9c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>');
      background-size: contain;
      width: 24px;
      height: 24px;
    }
    .mapboxgl-popup-content { 
      padding: 10px; 
      background: hsl(var(--background)); 
      border-radius: var(--radius); 
      box-shadow: 0 2px 10px rgba(0,0,0,0.1); 
      border: 1px solid hsl(var(--border));
    }
    .mapboxgl-popup-close-button { display: none; }
    .driver-popup-rtl { direction: rtl; text-align: right; }
    .driver-popup-rtl h3 { font-size: 1rem; font-weight: bold; margin-bottom: 0.25rem; color: hsl(var(--primary)); }
    .driver-popup-rtl p { font-size: 0.875rem; color: hsl(var(--foreground)); }
    .mapboxgl-ctrl-attrib.mapboxgl-compact { margin: 0 10px 10px 0 !important; }
    .mapboxgl-ctrl-geolocate .mapboxgl-ctrl-icon { font-size: 1.5em; }
  `}</style>
);

export default MapStyle;