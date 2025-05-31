import React, { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom/client';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { createDriverMarkerElement, DriverMapPopup } from '@/components/map/mapUtils'; 
import mapboxgl from 'mapbox-gl';

export const useMapDrivers = (mapInstance, navigate, setSelectedDriverForCard) => {
  const [drivers, setDrivers] = useState([]);
  const [driverMarkersAndPopups, setDriverMarkersAndPopups] = useState([]);
  const { toast } = useToast();

  const fetchDriversFromSupabase = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('id, name, vehicle_type, photo_url, latitude, longitude, phone')
        .eq('is_online', true)
        .not('latitude', 'is', null)
        .not('longitude', 'is', null);

      if (error) throw error;
      
      const mappedDrivers = data.map(d => ({
        ...d,
        lat: d.latitude,
        lng: d.longitude,
        photoUrl: d.photo_url,
        vehicleType: d.vehicle_type,
      }));
      setDrivers(mappedDrivers);
    } catch (error) {
      console.error("Error fetching drivers for map:", error);
      toast({ title: "خطأ", description: "لم نتمكن من تحميل بيانات السائقين.", variant: "destructive" });
    }
  }, [toast]);

  useEffect(() => {
    fetchDriversFromSupabase();
    const intervalId = setInterval(fetchDriversFromSupabase, 30000);
    return () => clearInterval(intervalId);
  }, [fetchDriversFromSupabase]);

  useEffect(() => {
    if (!mapInstance || !drivers.length) {
      driverMarkersAndPopups.forEach(({ marker, popup }) => {
        marker.remove();
        if (popup) popup.remove();
      });
      setDriverMarkersAndPopups([]);
      return;
    }

    driverMarkersAndPopups.forEach(({ marker, popup }) => {
      marker.remove();
      if (popup) popup.remove();
    });
    const newMarkersAndPopups = [];

    drivers.forEach(driver => {
      if (driver.lat != null && driver.lng != null) {
        const markerEl = createDriverMarkerElement(driver);
        
        const marker = new mapboxgl.Marker(markerEl)
          .setLngLat([driver.lng, driver.lat])
          .addTo(mapInstance);
        
        markerEl.id = `driver-marker-${driver.id}`;

        markerEl.addEventListener('click', (e) => {
          e.stopPropagation();
          
          // Close any existing popups and clear driver card
          driverMarkersAndPopups.forEach(({ popup: p }) => p && p.remove());
          if (setSelectedDriverForCard) setSelectedDriverForCard(null);


          const popupNode = document.createElement('div');
          const popupRoot = ReactDOM.createRoot(popupNode);
          popupRoot.render(
            <DriverMapPopup 
              driver={driver} 
              onNavigateToProfile={() => navigate(`/?driverId=${driver.id}`)} 
            />
          );

          const popup = new mapboxgl.Popup({ 
            offset: 35, 
            closeButton: true, 
            closeOnClick: true,
            className: 'driver-custom-popup' 
          })
            .setDOMContent(popupNode)
            .setLngLat([driver.lng, driver.lat])
            .addTo(mapInstance);
          
          popup.on('close', () => {
            popupRoot.unmount(); // Clean up React component
            if (setSelectedDriverForCard) setSelectedDriverForCard(null);
          });

          mapInstance.flyTo({ center: [driver.lng, driver.lat], zoom: Math.max(mapInstance.getZoom(), 15) });
          
          // Update the state for this marker to include the new popup
          const existingEntryIndex = newMarkersAndPopups.findIndex(item => item.marker === marker);
          if (existingEntryIndex > -1) {
            newMarkersAndPopups[existingEntryIndex].popup = popup;
          }
        });
        
        newMarkersAndPopups.push({ marker, popup: null }); // Initially no popup, created on click
      }
    });
    setDriverMarkersAndPopups(newMarkersAndPopups);

    return () => {
      newMarkersAndPopups.forEach(({ marker, popup }) => {
        marker.remove();
        if (popup) popup.remove();
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [drivers, mapInstance, navigate, setSelectedDriverForCard]);

  return { drivers, fetchDrivers: fetchDriversFromSupabase };
};