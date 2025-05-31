import React, { useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';

export const useLocationUpdater = (driverId, isOnline) => {
  const { toast } = useToast();
  const watchIdRef = useRef(null);
  const updateIntervalRef = useRef(null);
  const lastKnownPositionRef = useRef(null);

  useEffect(() => {
    const updateLocationInDb = async (latitude, longitude) => {
      if (!driverId) return;

      try {
        const { error } = await supabase
          .from('drivers')
          .update({ latitude, longitude, updated_at: new Date().toISOString() })
          .eq('id', driverId);

        if (error) {
          throw error;
        }
        console.log(`Location updated for driver ${driverId}: ${latitude}, ${longitude}`);
      } catch (error) {
        console.error('Error updating location in DB:', error);
        toast({
          title: 'خطأ في تحديث الموقع',
          description: 'لم نتمكن من حفظ موقعك الحالي في قاعدة البيانات.',
          variant: 'destructive',
        });
      }
    };

    const startWatchingLocation = () => {
      if (!navigator.geolocation) {
        toast({
          title: 'تحديد الموقع غير مدعوم',
          description: 'متصفحك لا يدعم خدمة تحديد المواقع.',
          variant: 'destructive',
        });
        return;
      }

      watchIdRef.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          lastKnownPositionRef.current = { latitude, longitude };
          console.log(`New location obtained: ${latitude}, ${longitude}`);
        },
        (error) => {
          console.error('Error getting location:', error);
          toast({
            title: 'خطأ في تحديد الموقع',
            description: `لا يمكن الحصول على موقعك الحالي. رمز الخطأ: ${error.code}, الرسالة: ${error.message}`,
            variant: 'destructive',
          });
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );

      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
      updateIntervalRef.current = setInterval(() => {
        if (lastKnownPositionRef.current) {
          updateLocationInDb(lastKnownPositionRef.current.latitude, lastKnownPositionRef.current.longitude);
        }
      }, 30000); 
    };

    const stopWatchingLocation = () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      if (updateIntervalRef.current !== null) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }
      console.log('Location updates stopped.');
    };

    if (isOnline && driverId) {
      startWatchingLocation();
    } else {
      stopWatchingLocation();
      if (driverId && lastKnownPositionRef.current) { 
          updateLocationInDb(null, null);
      }
    }

    return () => {
      stopWatchingLocation();
    };
  }, [driverId, isOnline, toast]);

  return null; 
};