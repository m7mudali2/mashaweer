import React, { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { UserCircle, Users, Map as MapIcon } from 'lucide-react'; // Changed Home to Users
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient'; 
import { DRIVER_PHONE_KEY } from '@/constants'; 

const BottomNavigation = () => {
  const location = useLocation();
  const [isDriverRegistered, setIsDriverRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkDriverRegistration = async () => {
      setIsLoading(true);
      try {
        const storedPhone = localStorage.getItem(DRIVER_PHONE_KEY);
        if (storedPhone) {
          const { data, error } = await supabase
            .from('drivers')
            .select('id')
            .eq('phone', storedPhone)
            .maybeSingle();

          if (error) {
            console.error("Error checking driver registration:", error);
            setIsDriverRegistered(false);
          } else {
            setIsDriverRegistered(!!data);
          }
        } else {
          setIsDriverRegistered(false);
        }
      } catch (error) {
        console.error("Exception checking driver registration:", error);
        setIsDriverRegistered(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkDriverRegistration();
    
    const unlisten = () => {
      checkDriverRegistration(); 
    };
    
    return () => unlisten(); 


  }, [location.pathname]); 

  const navItems = [
    { path: '/driver-profile', label: isLoading ? 'تحميل...' : (isDriverRegistered ? 'الملف الشخصي' : 'تسجيل كسائق'), icon: UserCircle },
    { path: '/', label: 'كباتن حولك', icon: Users }, // Changed icon and label
    { path: '/map', label: 'الخريطة', icon: MapIcon },
  ];


  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-card border-t border-border shadow-lg flex justify-around items-center z-50">
      {navItems.map((item, index) => {
        const isActive = location.pathname === item.path;
        const isCenterItem = index === 1; 

        return (
          <NavLink
            key={item.path}
            to={item.path}
            className={cn(
              'flex flex-col items-center justify-center text-muted-foreground hover:text-primary transition-colors duration-200 p-2 flex-1 h-full',
              isActive && 'text-primary',
              isCenterItem && 'transform scale-110' 
            )}
          >
            <item.icon className={cn('h-6 w-6 mb-0.5', isCenterItem && isActive && 'text-primary animate-pulse')} />
            <span className={cn('text-xs', isCenterItem ? 'font-semibold' : 'font-normal')}>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default BottomNavigation;