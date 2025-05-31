import React from 'react';
import DriverCard from '@/components/home/DriverCard';
import DriverListSkeleton from '@/components/home/DriverListSkeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { UserX, WifiOff } from 'lucide-react'; // Added UserX for no drivers

const DriverList = ({ isLoading, drivers, userLocation, onLocateOnMap, onShareDriver, onWhatsAppDriver }) => {
  if (isLoading) {
    return <DriverListSkeleton count={5} />;
  }

  if (!drivers || drivers.length === 0) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center text-center py-10 px-4"
      >
        <UserX className="h-20 w-20 text-muted-foreground mb-6" />
        <h3 className="text-xl font-semibold text-foreground mb-2">لا يوجد سائقون متاحون حاليًا</h3>
        <p className="text-muted-foreground text-sm">
          حاول تحديث القائمة أو تغيير معايير البحث.
        </p>
      </motion.div>
    );
  }

  if (!userLocation && drivers.some(d => d.distance === undefined)) {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center text-center py-10 px-4"
      >
        <WifiOff className="h-20 w-20 text-destructive mb-6" />
        <h3 className="text-xl font-semibold text-foreground mb-2">خدمة تحديد الموقع غير متاحة</h3>
        <p className="text-muted-foreground text-sm">
          يرجى تمكين خدمة تحديد الموقع في جهازك أو المتصفح لعرض المسافات وحسابها.
        </p>
      </motion.div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence>
        {drivers.map((driver, index) => (
          <DriverCard
            key={driver.id}
            driver={driver}
            index={index}
            onLocateOnMap={onLocateOnMap}
            onShareDriver={onShareDriver}
            onWhatsAppDriver={onWhatsAppDriver}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export default DriverList;