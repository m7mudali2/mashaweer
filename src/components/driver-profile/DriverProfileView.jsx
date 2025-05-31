import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ShieldCheck, LogOut, Edit3, Phone, Mail, Car, UserCircle, MapPin, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { VEHICLE_TYPES } from '@/constants';
import { motion } from 'framer-motion';

const DriverProfileView = ({ driverData, onLogout, onEdit }) => {
  const [isOnline, setIsOnline] = useState(driverData?.is_online || false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    setIsOnline(driverData?.is_online || false);
  }, [driverData?.is_online]);

  const handleOnlineStatusChange = async (newStatus) => {
    if (!driverData || !driverData.id) {
      toast({ title: "خطأ", description: "بيانات السائق غير متوفرة.", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setIsOnline(newStatus); 

    try {
      const { error } = await supabase
        .from('drivers')
        .update({ is_online: newStatus, updated_at: new Date().toISOString() })
        .eq('id', driverData.id);

      if (error) {
        setIsOnline(!newStatus); 
        throw error;
      }
      
      toast({
        title: "تم تحديث الحالة",
        description: `أنت الآن ${newStatus ? "متصل" : "غير متصل"}.`,
        variant: newStatus ? "default" : "destructive",
        className: newStatus ? "bg-green-500 text-white" : "bg-red-500 text-white",
      });
    } catch (error) {
      console.error("Error updating online status:", error);
      toast({ title: "خطأ", description: "لم نتمكن من تحديث حالة الاتصال. حاول مرة أخرى.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const vehicleLabel = VEHICLE_TYPES.find(v => v.value === driverData?.vehicle_type)?.label || driverData?.vehicle_type;

  if (!driverData) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 bg-gradient-to-br from-background to-slate-50 text-center">
        <AlertTriangle className="w-16 h-16 text-destructive mb-4" />
        <h2 className="text-2xl font-semibold text-destructive mb-2">خطأ في تحميل البيانات</h2>
        <p className="text-muted-foreground mb-6">لم نتمكن من تحميل بيانات ملفك الشخصي. يرجى المحاولة مرة أخرى.</p>
        <Button onClick={() => navigate('/')} variant="outline">العودة للرئيسية</Button>
      </div>
    );
  }
  
  const profileItemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.4,
        ease: "easeOut"
      }
    })
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="p-4 sm:p-6 bg-gradient-to-br from-background to-slate-100 dark:from-slate-900 dark:to-slate-800 min-h-screen"
      dir="rtl"
    >
      <Card className="w-full max-w-2xl mx-auto shadow-2xl rounded-3xl overflow-hidden bg-card">
        <CardHeader className="bg-primary text-primary-foreground p-6 text-center relative">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative inline-block"
          >
            <Avatar className="w-28 h-28 sm:w-32 sm:h-32 border-4 border-background shadow-lg mx-auto">
              <AvatarImage src={driverData.photo_url || `https://i.pravatar.cc/150?u=${driverData.id}`} alt={driverData.name} />
              <AvatarFallback className="text-4xl">{driverData.name ? driverData.name.substring(0, 1).toUpperCase() : 'S'}</AvatarFallback>
            </Avatar>
            <div className={`absolute bottom-1 right-1 sm:bottom-2 sm:right-2 w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 border-card ${isOnline ? 'bg-green-500' : 'bg-red-500'} flex items-center justify-center shadow-md`}>
              {isOnline ? <CheckCircle size={12} className="text-white" /> : <XCircle size={12} className="text-white" />}
            </div>
          </motion.div>
          <motion.h1 
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-2xl sm:text-3xl font-bold mt-3"
          >
            {driverData.name}
          </motion.h1>
          <motion.p 
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-sm sm:text-base text-primary-foreground/80"
          >
            {driverData.phone}
          </motion.p>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-5">
          <motion.div 
            custom={0} variants={profileItemVariants} initial="hidden" animate="visible"
            className="flex items-center justify-between p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg shadow"
          >
            <Label htmlFor="online-status" className="text-base font-medium text-foreground flex items-center">
              <ShieldCheck className="w-5 h-5 mr-0 ml-2 text-primary" />
              حالة الاتصال
            </Label>
            <div dir="ltr"> {/* Explicitly set LTR for Switch direction control */}
              <Switch
                id="online-status"
                checked={isOnline}
                onCheckedChange={handleOnlineStatusChange}
                disabled={isLoading}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500"
                thumbClassName="data-[state=checked]:bg-white data-[state=unchecked]:bg-white"
              />
            </div>
          </motion.div>
          
          <motion.div custom={1} variants={profileItemVariants} initial="hidden" animate="visible" className="p-3 bg-slate-100 dark:bg-slate-700/50 rounded-lg shadow space-y-2">
            <h3 className="text-sm font-semibold text-primary mb-1 flex items-center"><Car className="w-4 h-4 mr-0 ml-1" /> معلومات المركبة</h3>
            <div className="text-sm text-muted-foreground flex items-center">
              <Car className="w-4 h-4 mr-0 ml-2 text-gray-400" /> نوع المركبة: {vehicleLabel}
            </div>
            {driverData.vehicle_model && (
              <div className="text-sm text-muted-foreground flex items-center">
                <ShieldCheck className="w-4 h-4 mr-0 ml-2 text-gray-400" /> موديل المركبة: {driverData.vehicle_model}
              </div>
            )}
            {driverData.license_plate && (
              <div className="text-sm text-muted-foreground flex items-center">
                <MapPin className="w-4 h-4 mr-0 ml-2 text-gray-400" /> رقم اللوحة: {driverData.license_plate}
              </div>
            )}
          </motion.div>

          <motion.div 
            custom={2} variants={profileItemVariants} initial="hidden" animate="visible"
            className="pt-4 flex flex-col sm:flex-row gap-3"
          >
            <Button onClick={onEdit} variant="outline" className="flex-1 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              <Edit3 className="w-4 h-4 mr-0 ml-2" /> تعديل الملف الشخصي
            </Button>
            <Button onClick={onLogout} variant="destructive" className="flex-1">
              <LogOut className="w-4 h-4 mr-0 ml-2" /> تسجيل الخروج
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default DriverProfileView;
