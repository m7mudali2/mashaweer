import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useAppContext } from '@/contexts/AppContext';
import { Toaster } from '@/components/ui/toaster';
import BottomNavigation from '@/components/BottomNavigation';
import IntroScreen from '@/pages/IntroScreen';
import HomeScreen from '@/pages/HomeScreen';
import DriverProfileScreen from '@/pages/DriverProfileScreen';
import MapScreen from '@/pages/MapScreen';
import { AnimatePresence } from 'framer-motion';
import { Geolocation } from '@capacitor/geolocation'; // ✅ أضفنا الاستيراد هنا

const AppContent = () => {
  const { introViewed } = useAppContext();

  // ✅ نطلب صلاحية الموقع هنا مرة واحدة
  useEffect(() => {
    const requestPermissions = async () => {
      try {
        const result = await Geolocation.requestPermissions();
        console.log('Location permissions:', result);
      } catch (error) {
        console.error('Error requesting location permissions:', error);
      }
    };

    requestPermissions();
  }, []);

  if (!introViewed) {
    return <IntroScreen />;
  }

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-grow overflow-y-auto pb-16">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<HomeScreen />} />
            <Route path="/driver-profile" element={<DriverProfileScreen />} />
            <Route path="/map" element={<MapScreen />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
      <BottomNavigation />
    </div>
  );
};

function App() {
  return (
    <AppProvider>
      <Router>
        <AppContent />
        <Toaster />
      </Router>
    </AppProvider>
  );
}

export default App;
