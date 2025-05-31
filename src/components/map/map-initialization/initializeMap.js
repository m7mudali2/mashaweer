import mapboxgl from 'mapbox-gl';
import MapboxLanguage from '@mapbox/mapbox-gl-language';
import { createUserMarkerElement } from '@/components/map/mapUtils';

let rtlTextPluginSet = false;

export const initializeMap = (mapContainer, mapRef, initialLng, initialLat, initialZoom, setLng, setLat, setZoom, setUserMarker, setSelectedDriverForCard, toast, initialGeolocate = false) => {
  if (mapRef.current) return;

  if (!rtlTextPluginSet) {
    try {
      mapboxgl.setRTLTextPlugin(
        'https://api.mapbox.com/mapbox-gl-js/plugins/mapbox-gl-rtl-text/v0.2.3/mapbox-gl-rtl-text.js',
        null,
        true 
      );
      rtlTextPluginSet = true;
    } catch (error) {
      if (error.message && error.message.includes("setRTLTextPlugin cannot be called multiple times")) {
        rtlTextPluginSet = true; 
      } else {
        console.error("Error setting RTL text plugin:", error);
      }
    }
  }
  
  mapRef.current = new mapboxgl.Map({
    container: mapContainer.current,
    style: 'mapbox://styles/mapbox/streets-v12',
    center: [initialLng, initialLat],
    zoom: initialZoom,
    pitchWithRotate: false,
    dragRotate: false,
    touchZoomRotate: true, 
    scrollZoom: true, 
  });

  const mapInstance = mapRef.current;

  mapInstance.addControl(new mapboxgl.NavigationControl({ showCompass: false }), 'top-left');

  const setMapLanguage = () => {
    if (mapInstance.hasControl(MapboxLanguage)) { 
      const existingLanguageControl = mapInstance._controls.find(c => c instanceof MapboxLanguage);
      if (existingLanguageControl) mapInstance.removeControl(existingLanguageControl);
    }
    const language = new MapboxLanguage({ defaultLanguage: 'ar' });
    mapInstance.addControl(language);
    
    const updateTextLayers = () => {
      if (!mapInstance.isStyleLoaded()) return;
      mapInstance.getStyle().layers.forEach(layer => {
        if (layer.layout && layer.layout['text-field']) {
          mapInstance.setLayoutProperty(layer.id, 'text-field', ['coalesce', ['get', 'name_ar'], ['get', 'name']]);
        }
      });
    };

    if (mapInstance.isStyleLoaded()) {
      updateTextLayers();
    } else {
      mapInstance.once('styledata', updateTextLayers);
    }
  };

  const geolocate = new mapboxgl.GeolocateControl({
    positionOptions: { enableHighAccuracy: true },
    trackUserLocation: false, // Set to false to prevent continuous tracking and re-centering
    showUserHeading: true,
  });
  mapInstance.addControl(geolocate, 'top-left');

  geolocate.on('geolocate', (e) => {
    const userLng = e.coords.longitude;
    const userLat = e.coords.latitude;
    
    setUserMarker(prevMarker => {
      if (prevMarker) prevMarker.remove();
      const el = createUserMarkerElement();
      return new mapboxgl.Marker(el).setLngLat([userLng, userLat]).addTo(mapInstance);
    });
    // Only fly to user location if it's the initial geolocate trigger or explicitly requested
    // The 'initialGeolocate' flag is now passed to this function
    // The map will flyTo user location if geolocate.trigger() is called.
    // We don't need to call flyTo here again if trackUserLocation is false.
  });
  
  geolocate.on('error', (error) => {
    console.warn(`Geolocate error: ${error.message}`);
    if (error.code === 1) { // PERMISSION_DENIED
        toast({ title: "تحديد الموقع", description: "تم رفض إذن تحديد الموقع. سيتم عرض الموقع الافتراضي.", variant: "warning" });
    } else if (error.code === 2) { // POSITION_UNAVAILABLE
        toast({ title: "تحديد الموقع", description: "الموقع غير متاح حالياً. سيتم عرض الموقع الافتراضي.", variant: "warning" });
    }
  });

  mapInstance.on('load', () => {
    setMapLanguage();
    if (initialGeolocate) {
      // Wait a brief moment for the map to be fully ready before triggering geolocate
      setTimeout(() => {
        if (mapInstance && geolocate) {
          geolocate.trigger();
        }
      }, 500);
    }
  });

  mapInstance.on('style.load', () => {
    setMapLanguage();
  });
  
  mapInstance.on('styledata', () => { 
    if(mapInstance.isStyleLoaded()){
      setMapLanguage();
    }
  });

  mapInstance.on('move', () => {
    setLng(mapInstance.getCenter().lng.toFixed(4));
    setLat(mapInstance.getCenter().lat.toFixed(4));
    setZoom(mapInstance.getZoom().toFixed(2));
  });

  mapInstance.on('click', (e) => {
    const features = mapInstance.queryRenderedFeatures(e.point, {
      layers: Array.from(mapInstance.getContainer().querySelectorAll('[id^="driver-marker-"]')).map(el => el.id)
    });
    if (!features.length) { 
        const openPopup = mapInstance._popups && mapInstance._popups[0];
        if (openPopup && !openPopup.getElement().contains(e.originalEvent.target)) {
        }
        if (setSelectedDriverForCard) setSelectedDriverForCard(null); 
    }
  });

  return () => {
    if (mapInstance) {
      if (mapInstance.hasControl(geolocate)) mapInstance.removeControl(geolocate);
      
      const languageControl = mapInstance._controls.find(c => c instanceof MapboxLanguage);
      if (languageControl && mapInstance.hasControl(languageControl)) {
        mapInstance.removeControl(languageControl);
      }

      const navigationControl = mapInstance._controls.find(c => c instanceof mapboxgl.NavigationControl);
      if (navigationControl && mapInstance.hasControl(navigationControl)) {
        mapInstance.removeControl(navigationControl);
      }
      
      mapInstance.remove();
      mapRef.current = null;
    }
  };
};