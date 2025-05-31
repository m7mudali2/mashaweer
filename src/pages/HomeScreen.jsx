import React from 'react';
import DriverFilters from '@/components/home/DriverFilters';
import DriverList from '@/components/home/DriverList';
import { useDrivers } from '@/components/home/hooks/useDrivers';
import { motion } from 'framer-motion';
import { Users } from 'lucide-react'; // Changed from Award to Users

const HomeScreen = () => {
  const {
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
    handleShareDriver,
    handleLocateOnMap,
    handleWhatsAppDriver,
  } = useDrivers();

  return (
    <div className="p-0 sm:p-0 bg-gradient-to-br from-background to-slate-50 min-h-screen">
      <header className="pt-3 px-3 sm:pt-4 sm:px-4 mb-2 text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center"
        >
          <Users className="h-8 w-8 sm:h-10 sm:w-10 text-primary mr-2 ml-2" /> {/* Changed Icon */}
          <h1 className="text-2xl sm:text-4xl font-bold text-primary">كباتن حولك</h1>
        </motion.div>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-xs sm:text-base text-muted-foreground mt-1"
        >
          اعثر على أقرب السائقين وتواصل معهم مباشرة
        </motion.p>
      </header>

      <DriverFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        vehicleFilter={vehicleFilter}
        setVehicleFilter={setVehicleFilter}
        onRefresh={() => { fetchDrivers(); fetchUserLocation(); }}
      />
      
      <div className="px-3 sm:px-4 pb-16 sm:pb-20"> {/* Added padding-bottom for nav bar */}
        <DriverList
          isLoading={isLoading}
          drivers={filteredDrivers}
          userLocation={userLocation}
          onLocateOnMap={handleLocateOnMap}
          onShareDriver={handleShareDriver}
          onWhatsAppDriver={handleWhatsAppDriver}
        />
      </div>
    </div>
  );
};

export default HomeScreen;