import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { X, Share2, Phone } from 'lucide-react';
import { VEHICLE_TYPES } from '@/constants';
import { useToast } from '@/components/ui/use-toast';

// This component is no longer used in MapScreen.jsx
// You can choose to delete it or keep it for future reference.
// For now, I will leave its content as is but it won't be rendered.

const DriverInfoCard = ({ driver, onClose, onNavigateHome }) => {
  const { toast } = useToast(); 
  if (!driver) return null;

  const vehicleLabel = VEHICLE_TYPES.find(v => v.value === driver.vehicleType)?.label || driver.vehicleType;

  const handleShare = async () => {
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
        description: "لم نتمكن من الحصول على موقعك الحالي للمشاركة. سيتم مشاركة معلومات السائق بدون موقعك.",
        variant: "warning",
        duration: 3000,
      });
    }

    const shareData = {
      title: `بيانات السائق: ${driver.name}`,
      text: `مرحباً، أود مشاركة معلومات هذا السائق معك:\n\nالاسم: ${driver.name}\nالهاتف: ${driver.phone}\nنوع المركبة: ${vehicleLabel}\nصورة السائق: ${driver.photoUrl || 'غير متوفرة'}\n\nموقعي الحالي: ${userLocationLink}`,
      url: window.location.href, 
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text)}`;
        window.open(whatsappUrl, '_blank');
      }
    } else {
      const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareData.text)}`;
      window.open(whatsappUrl, '_blank');
      toast({
        title: "المشاركة عبر واتساب",
        description: "متصفحك لا يدعم المشاركة المباشرة، تم فتح واتساب للمشاركة.",
        duration: 3000,
      });
    }
  };


  return (
    <Card className="absolute bottom-20 md:bottom-4 left-4 right-4 md:left-auto md:w-80 bg-background shadow-xl z-20 animate-slide-in-up">
      <CardHeader className="p-3 relative flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Avatar className="h-10 w-10 mr-2 ml-2 border-2 border-primary">
            <AvatarImage src={driver.photoUrl || `https://i.pravatar.cc/80?u=${driver.id}`} alt={driver.name} />
            <AvatarFallback>{driver.name ? driver.name.substring(0,1) : 'D'}</AvatarFallback>
          </Avatar>
          <CardTitle className="text-md">{driver.name}</CardTitle>
        </div>
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={handleShare} className="text-primary">
            <Share2 className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="mr-1" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-3 text-sm">
        <p>نوع المركبة: {vehicleLabel}</p>
        <div className="flex items-center justify-between mt-1">
            <p>الهاتف: <a href={`tel:${driver.phone}`} className="text-primary hover:underline">{driver.phone}</a></p>
            <a href={`tel:${driver.phone}`} className="text-primary p-2 rounded-full hover:bg-primary/10">
                <Phone className="h-5 w-5"/>
            </a>
        </div>
        <Button className="w-full mt-3 bg-secondary hover:bg-secondary/80" onClick={onNavigateHome}>
          عرض كل السائقين
        </Button>
      </CardContent>
    </Card>
  );
};

export default DriverInfoCard;