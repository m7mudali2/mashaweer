import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { DRIVER_PHONE_KEY } from '@/constants';
import DriverRegistrationFlow from '@/components/driver-profile/DriverRegistrationFlow';
import DriverProfileView from '@/components/driver-profile/DriverProfileView';
import { Loader2 } from 'lucide-react';
import { useLocationUpdater } from '@/hooks/useLocationUpdater';

const DriverProfileScreen = () => {
  const [driverData, setDriverData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showRegistrationOrEdit, setShowRegistrationOrEdit] = useState(false); // Combined state
  const [isEditing, setIsEditing] = useState(false); 
  const [phoneNumber, setPhoneNumber] = useState('');
  const { toast } = useToast();

  useLocationUpdater(driverData?.id, driverData?.is_online);

  const fetchDriverData = useCallback(async (phone) => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('drivers')
        .select('*')
        .eq('phone', phone)
        .single();

      if (error) {
        if (error.code === 'PGRST116') { 
          setShowRegistrationOrEdit(true); // Could be new registration
          setIsEditing(false);
          setDriverData(null);
        } else {
          throw error;
        }
      } else {
        setDriverData(data);
        setShowRegistrationOrEdit(false); // Data fetched, show profile
        setIsEditing(false); 
      }
    } catch (error) {
      console.error("Error fetching driver data:", error);
      toast({ title: 'خطأ', description: 'لم نتمكن من تحميل بيانات ملفك الشخصي.', variant: 'destructive' });
      setShowRegistrationOrEdit(true); // Fallback to registration/edit flow on error
      setIsEditing(false); // Default to not editing on error
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const storedPhone = localStorage.getItem(DRIVER_PHONE_KEY);
    if (storedPhone) {
      setPhoneNumber(storedPhone);
      // If we are not already in an edit flow, fetch data
      if (!isEditing) {
        fetchDriverData(storedPhone);
      } else {
        // If we are in edit mode, driverData should already be set.
        // No need to re-fetch unless explicitly needed after an update.
        setIsLoading(false); // Stop loading if we are already editing
      }
    } else {
      setShowRegistrationOrEdit(true);
      setIsEditing(false); // Not editing if no stored phone (new user)
      setIsLoading(false);
    }
  }, [fetchDriverData, isEditing]); // Add isEditing to dependency array

  const handleRegistrationOrUpdateSuccess = (processedDriverData, registeredPhone) => {
    setDriverData(processedDriverData);
    setPhoneNumber(registeredPhone); // Should be same as current phone if editing
    if(!isEditing) localStorage.setItem(DRIVER_PHONE_KEY, registeredPhone); // Only set if new registration
    setShowRegistrationOrEdit(false);
    setIsEditing(false); 
    // Toast message is handled in DriverRegistrationFlow
  };
  
  const handleLogout = () => {
    if (driverData?.id && driverData?.is_online) {
      supabase
        .from('drivers')
        .update({ latitude: null, longitude: null, is_online: false, updated_at: new Date().toISOString() })
        .eq('id', driverData.id)
        .then(({error}) => {
          if (error) console.error("Error clearing location on logout:", error);
        });
    }
    localStorage.removeItem(DRIVER_PHONE_KEY);
    setDriverData(null);
    setPhoneNumber('');
    setShowRegistrationOrEdit(true);
    setIsEditing(false); 
    toast({ title: 'تسجيل الخروج', description: 'تم تسجيل خروجك.' });
  };

  const handleEdit = () => {
    setIsEditing(true);
    setShowRegistrationOrEdit(true); 
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="mt-4 text-lg text-muted-foreground">جاري تحميل ملفك الشخصي...</p>
      </div>
    );
  }

  if (showRegistrationOrEdit || (isEditing && !driverData) ) { // If showing reg/edit, or editing but no data (e.g. error state)
    return (
      <DriverRegistrationFlow 
        onLoginOrProceedToRegistrationSuccess={handleRegistrationOrUpdateSuccess} 
        initialPhone={phoneNumber}
        initialData={isEditing ? driverData : null} 
        isEditing={isEditing}
      />
    );
  }
  
  if (!driverData && !isLoading && !showRegistrationOrEdit) { // No driver data, not loading, not in reg flow (could be error)
     return ( // Fallback or redirect, for now, shows registration flow
      <DriverRegistrationFlow 
        onLoginOrProceedToRegistrationSuccess={handleRegistrationOrUpdateSuccess} 
        initialPhone={phoneNumber}
      />
     );
  }


  return <DriverProfileView driverData={driverData} onLogout={handleLogout} onEdit={handleEdit} />;
};

export default DriverProfileScreen;