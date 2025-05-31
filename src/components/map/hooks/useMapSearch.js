import React, { useState } from 'react';
import { MAPBOX_TOKEN } from '@/constants';
import { useToast } from '@/components/ui/use-toast';

export const useMapSearch = (mapInstance) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim() || !mapInstance) return;
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchQuery)}.json?access_token=${MAPBOX_TOKEN}&autocomplete=true&language=ar&proximity=${mapInstance.getCenter().lng},${mapInstance.getCenter().lat}`
      );
      const data = await response.json();
      if (data.features && data.features.length > 0) {
        const [foundLng, foundLat] = data.features[0].center;
        mapInstance.flyTo({ center: [foundLng, foundLat], zoom: 14 });
      } else {
        toast({ title: "لم يتم العثور على نتائج", description: "الرجاء محاولة البحث بكلمات أخرى.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "خطأ في البحث", description: "حدث خطأ أثناء محاولة البحث عن الموقع.", variant: "destructive" });
    }
  };

  return { searchQuery, setSearchQuery, handleSearch };
};