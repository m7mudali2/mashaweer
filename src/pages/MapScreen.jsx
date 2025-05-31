import React, { useRef, useEffect, useState, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import { MAPBOX_TOKEN } from '@/constants';
import { useToast } from '@/components/ui/use-toast';
import { useSearchParams, useNavigate } from 'react-router-dom';
import MapControls from '@/components/map/MapControls';
import MapStyle from '@/components/map/MapStyle';
import { useMapDrivers } from '@/components/map/hooks/useMapDrivers.jsx'; 
import { useMapSearch } from '@/components/map/hooks/useMapSearch';
import { initializeMap } from '@/components/map/map-initialization/initializeMap';

mapboxgl.accessToken = MAPBOX_TOKEN;

const MapScreen = () => {
  const mapContainer = useRef(null);
  const map = useRef(null); 
  const [lng, setLng] = useState(31.2357); // Default to Cairo longitude
  const [lat, setLat] = useState(30.0444);  // Default to Cairo latitude
  const [zoom, setZoom] = useState(12); // Adjusted zoom for Cairo
  const [userMarker, setUserMarker] = useState(null);
  
  const { toast } = useToast();
  const [searchParams] = useSearchParams();
  
  const { drivers, fetchDrivers } = useMapDrivers(map.current); 
  const { searchQuery, setSearchQuery, handleSearch } = useMapSearch(map.current);

  useEffect(() => {
    const driverIdParam = searchParams.get('driverId');
    // Pass driverIdParam to initializeMap to control initial geolocate behavior
    const cleanupMap = initializeMap(
      mapContainer, map, lng, lat, zoom, 
      setLng, setLat, setZoom, 
      setUserMarker, null, toast, !driverIdParam // Only geolocate initially if no driverId is present
    );
    return cleanupMap;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only on mount

  useEffect(() => {
    const driverIdParam = searchParams.get('driverId');
    if (driverIdParam && drivers.length > 0 && map.current) {
      const driver = drivers.find(d => String(d.id) === String(driverIdParam));
      if (driver && driver.lat && driver.lng) {
        // Fly to driver location without triggering geolocate for user
        map.current.flyTo({ center: [driver.lng, driver.lat], zoom: 15 });
        // Optional: Add a marker for the selected driver if not already handled by useMapDrivers
        // This might be redundant if useMapDrivers already places and manages driver markers effectively
        // For example, highlight the driver's marker or open their popup.
        const driverMarkerElement = map.current.getContainer().querySelector(`#driver-marker-${driver.id}`);
        if (driverMarkerElement) {
           // Simulate a click to open the popup for this driver
           // This ensures the popup logic from useMapDrivers is triggered
           setTimeout(() => driverMarkerElement.click(), 100); 
        }
      }
    }
  }, [searchParams, drivers, map]); // Rerun when driverId, drivers or map changes
  
  const refreshMapData = () => {
    fetchDrivers();
    toast({ title: "تحديث", description: "تم تحديث بيانات الخريطة." });
  };

  const goToUserLocation = () => {
    if (!map.current) return;
    const geolocateControl = map.current._controls.find(ctrl => ctrl instanceof mapboxgl.GeolocateControl);
    if (geolocateControl) {
      geolocateControl.trigger(); // This will fly to user's location
    } else {
       if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLng = position.coords.longitude;
            const userLat = position.coords.latitude;
            if (userMarker) userMarker.remove(); // Remove old user marker if any
            // You might want to use createUserMarkerElement here as well if you have custom user markers
            // For simplicity, just flying:
            map.current.flyTo({ center: [userLng, userLat], zoom: 15 });
          },
          () => {
            toast({ title: "خطأ", description: "لا يمكن الوصول إلى موقعك. يرجى تفعيل خدمات الموقع.", variant: "destructive" });
          }
        );
      } else {
        toast({ title: "خطأ", description: "لم يتم تفعيل خدمة تحديد الموقع في المتصفح.", variant: "destructive" });
      }
    }
  };

  return (
    <div className="h-full w-full flex flex-col relative" style={{ paddingBottom: '0' }}>
      <MapStyle mapInstance={map.current} />
      <div ref={mapContainer} className="flex-grow" />
      <MapControls 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleSearch={handleSearch}
        goToUserLocation={goToUserLocation}
        refreshMapData={refreshMapData}
      />
    </div>
  );
};

export default MapScreen;