import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { VEHICLE_TYPES } from '@/constants';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

export const useDrivers = () => {
  const [drivers, setDrivers] = useState([]);
  const [filteredDrivers, setFilteredDrivers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [vehicleFilter, setVehicleFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  const fetchUserLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Error getting user location for distance calculation:", error);
          toast({
            title: "تنبيه تحديد الموقع",
            description: "لا يمكن حساب المسافات بدقة بدون الوصول لموقعك. حاول تفعيل خدمات الموقع.",
            variant: "warning",
            duration: 4000,
          });
        },
        { timeout: 10000, enableHighAccuracy: false }
      );
    } else {
        toast({
            title: "تحديد الموقع غير مدعوم",
            description: "متصفحك لا يدعم خدمات تحديد الموقع.",
            variant: "warning",
            duration: 4000,
          });
    }
  }, [toast]);

  const fetchDrivers = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('id, name, vehicle_type, photo_url, latitude, longitude, phone, is_online')
        .eq('is_online', true)
        // .not('latitude', 'is', null) // Keep for actual location filtering if strict
        // .not('longitude', 'is', null)
        .limit(50); // Increased limit slightly

      if (error) throw error;
      
      // Filter out drivers without location data before setting state
      const driversWithLocation = data.filter(d => d.latitude && d.longitude) || [];
      setDrivers(driversWithLocation);

    } catch (error) {
      console.error("Error fetching drivers:", error);
      toast({ title: "خطأ في تحميل السائقين", description: "حدث خطأ أثناء جلب بيانات السائقين. حاول مرة أخرى.", variant: "destructive" });
      setDrivers([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchUserLocation();
    fetchDrivers();
  }, [fetchUserLocation, fetchDrivers]);

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null; // Ensure all coords are present
    const R = 6371e3; 
    const φ1 = lat1 * Math.PI/180; 
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    const d = R * c; 
    return Math.round(d); 
  };

  useEffect(() => {
    let tempDrivers = drivers;

    if (searchTerm) {
      tempDrivers = tempDrivers.filter(driver =>
        driver.name && driver.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (vehicleFilter !== 'all') {
      tempDrivers = tempDrivers.filter(driver => driver.vehicle_type === vehicleFilter);
    }
    
    if (userLocation) {
      tempDrivers = tempDrivers.map(driver => ({
        ...driver,
        distance: calculateDistance(userLocation.latitude, userLocation.longitude, driver.latitude, driver.longitude)
      })).sort((a, b) => (a.distance === null ? Infinity : a.distance) - (b.distance === null ? Infinity : b.distance));
    } else {
       tempDrivers = tempDrivers.map(driver => ({ ...driver, distance: null }));
    }


    setFilteredDrivers(tempDrivers);
  }, [searchTerm, vehicleFilter, drivers, userLocation]);

  const handleLocateOnMap = (driverId) => {
    navigate(`/map?driverId=${driverId}`);
  };

  const handleShareDriver = async (driver) => {
    let userLocationLink = "غير متوفر";
    try {
      if (navigator.geolocation) {
        const position = await new Promise((resolve, reject) => 
          navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
        );
        const userLat = position.coords.latitude;
        const userLng = position.coords.longitude;
        userLocationLink = `https://www.google.com/maps?q=${userLat},${userLng}`;
      }
    } catch (error) {
      console.warn("Could not get user location for sharing:", error);
      toast({
        title: "تنبيه تحديد الموقع",
        description: "لم نتمكن من الحصول على موقعك للمشاركة. ستتم مشاركة معلومات السائق بدون موقعك.",
        variant: "warning",
        duration: 3000,
      });
    }
    
    const vehicleLabel = VEHICLE_TYPES.find(v => v.value === driver.vehicle_type)?.label || driver.vehicle_type;
    const shareData = {
      title: `بيانات السائق: ${driver.name}`,
      text: `مرحباً، أود مشاركة معلومات هذا السائق معك:\n\nالاسم: ${driver.name}\nالهاتف: ${driver.phone}\nنوع المركبة: ${vehicleLabel}\nصورة السائق: ${driver.photo_url || 'غير متوفرة'}\n\nموقعي الحالي (وقت إرسال هذه الرسالة): ${userLocationLink}`,
      url: window.location.href, 
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        toast({ title: "تمت المشاركة", description: "تمت مشاركة بيانات السائق بنجاح.", duration: 2000 });
      } catch (err) {
        console.error('Error sharing:', err);
        if (err.name !== 'AbortError') { // Don't show error if user cancelled
          toast({ title: "خطأ في المشاركة", description: "لم تتم عملية المشاركة. حاول مرة أخرى.", variant: "destructive", duration: 3000 });
        }
         // Fallback to WhatsApp if navigator.share fails or is cancelled for some reason other than AbortError
        if(err.name !== 'AbortError') {
            const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text)}`;
            window.open(whatsappUrl, '_blank');
        }
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text)}`;
      window.open(whatsappUrl, '_blank');
      toast({
        title: "المشاركة عبر واتساب",
        description: "متصفحك لا يدعم المشاركة المباشرة. تم فتح واتساب للمشاركة.",
        duration: 3000,
      });
    }
  };

  const handleWhatsAppDriver = (driver) => {
    const whatsappNumber = driver.phone.startsWith('+') ? driver.phone : `+${driver.phone.replace(/^0+/, '')}`; // Basic formatting for international numbers
    const message = `مرحباً ${driver.name}, هل أنت متاح لمشوار؟`;
    const whatsappUrl = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`; // Remove non-digits
    window.open(whatsappUrl, '_blank');
    toast({ title: "فتح واتساب", description: `جاري فتح محادثة مع ${driver.name}.`, duration: 2000 });
  };

  return {
    drivers,
    filteredDrivers,
    searchTerm,
    setSearchTerm,
    vehicleFilter,
    setVehicleFilter,
    isLoading,
    userLocation,
    fetchDrivers,
    fetchUserLocation,
    handleLocateOnMap,
    handleShareDriver,
    handleWhatsAppDriver,
  };
};