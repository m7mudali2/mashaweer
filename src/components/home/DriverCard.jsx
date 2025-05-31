import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MapPin, Phone, Share2, MessageSquare } from 'lucide-react';
import { VEHICLE_TYPES } from '@/constants';
import { motion } from 'framer-motion';

const DriverCard = ({ driver, index, onLocateOnMap, onShareDriver, onWhatsAppDriver }) => {
  const vehicleLabel = VEHICLE_TYPES.find(v => v.value === driver.vehicle_type)?.label || driver.vehicle_type;

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
        ease: "easeOut"
      }
    })
  };

  return (
    <motion.div custom={index} variants={cardVariants} initial="hidden" animate="visible" exit="hidden">
      <Card className="overflow-hidden shadow-lg rounded-xl transform transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 bg-card">
        <CardHeader className="flex flex-row items-center justify-between p-3 bg-slate-100 dark:bg-slate-800">
          <div className="flex items-center space-x-2 space-x-reverse">
            <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-primary shadow-md">
              <AvatarImage src={driver.photo_url || `https://i.pravatar.cc/80?u=${driver.id}`} alt={driver.name} />
              <AvatarFallback>{driver.name ? driver.name.substring(0,1).toUpperCase() : 'S'}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg sm:text-xl font-semibold text-primary">{driver.name}</CardTitle>
              <p className="text-xs sm:text-sm text-muted-foreground">{vehicleLabel}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => onShareDriver(driver)} className="text-primary hover:bg-primary/10 p-1">
            <Share2 className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </CardHeader>
        <CardContent className="p-3 space-y-1">
          {driver.distance !== null && driver.distance !== undefined && (
            <p className="text-xs sm:text-sm text-muted-foreground flex items-center">
              <MapPin className="inline h-3 w-3 sm:h-4 sm:w-4 mr-1 ml-1 text-secondary" />
              المسافة: {driver.distance < 1000 ? `${driver.distance} متر` : `${(driver.distance/1000).toFixed(1)} كم`}
            </p>
          )}
        </CardContent>
        <CardFooter className="p-3 grid grid-cols-3 gap-2 items-center bg-slate-100 dark:bg-slate-800">
          <Button onClick={() => onLocateOnMap(driver.id)} className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md text-xs sm:text-sm px-2 py-2 h-auto flex items-center justify-center">
            <MapPin className="h-4 w-4 sm:h-5 sm:w-5 mr-1 ml-1" />
            الخريطة
          </Button>
          <Button onClick={() => onWhatsAppDriver(driver)} variant="outline" className="border-green-500 text-green-500 hover:bg-green-500 hover:text-white shadow-md text-xs sm:text-sm px-2 py-2 h-auto flex items-center justify-center">
            <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 mr-1 ml-1" />
            واتساب
          </Button>
          <a 
            href={`tel:${driver.phone}`} 
            className="flex items-center justify-center p-2 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg shadow-md h-full w-full text-xs sm:text-sm"
            aria-label={`اتصل بـ ${driver.name}`}
          >
            <Phone className="h-4 w-4 sm:h-5 sm:w-5 mr-1 ml-1" />
            اتصال
          </a>
        </CardFooter>
      </Card>
    </motion.div>
  );
};

export default DriverCard;