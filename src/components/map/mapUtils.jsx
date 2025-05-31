import React from 'react';
import { VEHICLE_TYPES } from '@/constants';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Phone, MessageSquare as MessageSquareText, Car, Share2, MapPin } from 'lucide-react'; 

export const createUserMarkerElement = () => {
  const el = document.createElement('div');
  el.className = 'user-marker';
  return el;
};

export const createDriverMarkerElement = (driver) => {
  const el = document.createElement('div');
  el.className = 'driver-marker';
  el.style.backgroundImage = `url(${driver.photoUrl || 'https://i.pravatar.cc/40?u=' + driver.id})`;
  return el;
};

// Helper function to calculate distance using Haversine formula
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in kilometers
  return distance;
};

export const DriverMapPopup = ({ driver, distance }) => {
  if (!driver) return null;

  const vehicleLabel = VEHICLE_TYPES.find(v => v.value === driver.vehicle_type)?.label || driver.vehicle_type;

  const handleWhatsApp = () => {
    const message = `مرحباً ${driver.name}, أتواصل معك من تطبيق مشاوير.`;
    const whatsappUrl = `https://wa.me/${driver.phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };
  
  const handleShare = async () => {
    const shareText = `مرحباً، أود مشاركة معلومات هذا السائق معك:\n\nالاسم: ${driver.name}\nالهاتف: ${driver.phone}\nنوع المركبة: ${vehicleLabel}\nصورة السائق: ${driver.photoUrl || 'غير متوفرة'}`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `معلومات السائق: ${driver.name}`,
          text: shareText,
          url: window.location.href, 
        });
      } catch (err) {
        console.error('Error sharing:', err);
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
      }
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
      window.open(whatsappUrl, '_blank');
    }
  };

  const formatDistance = (dist) => {
    if (dist === null || dist === undefined) {
      return "الموقع غير متاح";
    }
    if (dist < 1) {
      return `${Math.round(dist * 1000)} متر`;
    }
    return `${dist.toFixed(1)} كم`;
  };

  return (
    <div className="p-4 bg-card text-card-foreground rounded-xl shadow-2xl w-80" dir="rtl">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center flex-grow">
          <Avatar className="h-16 w-16 border-2 border-primary shadow-lg ml-3">
            <AvatarImage src={driver.photoUrl || `https://i.pravatar.cc/90?u=${driver.id}`} alt={driver.name} />
            <AvatarFallback className="text-xl">{driver.name ? driver.name.substring(0, 1).toUpperCase() : 'D'}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-foreground">{driver.name}</h3>
            <p className="text-sm text-muted-foreground flex items-center">
              <Car size={16} className="mr-0 ml-1 text-primary" /> {vehicleLabel}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={handleShare} className="text-primary p-1 h-auto w-auto">
          <Share2 size={22} />
        </Button>
      </div>
      
      <div className="mb-4 text-center border-t border-b border-border py-2.5">
        <p className="text-sm text-muted-foreground flex items-center justify-center">
          <MapPin size={16} className="mr-0 ml-1 text-primary" /> 
          المسافة: {formatDistance(distance)}
        </p>
      </div>
      
      <div className="flex justify-between items-center space-x-2 space-x-reverse">
        <Button 
          variant="default" 
          size="lg" 
          className="flex-1 py-2.5 h-auto text-sm bg-green-500 hover:bg-green-600 text-white shadow-md" 
          onClick={() => window.location.href = `tel:${driver.phone}`}
        >
          <Phone size={18} className="mr-0 ml-2" /> اتصال
        </Button>
        <Button 
          variant="outline" 
          size="lg" 
          className="flex-1 py-2.5 h-auto text-sm border-green-500 text-green-500 hover:bg-green-500 hover:text-white shadow-md" 
          onClick={handleWhatsApp}
        >
          <MessageSquareText size={18} className="mr-0 ml-2" /> واتساب
        </Button>
      </div>
    </div>
  );
};