import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { motion, AnimatePresence } from 'framer-motion';
import InitialInfoForm from './forms/InitialInfoForm';
import OtpVerificationForm from './forms/OtpVerificationForm';
import VehicleInfoForm from './forms/VehicleInfoForm';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabaseClient';
import { DRIVER_PHONE_KEY } from '@/constants';

const DriverRegistrationFlow = ({ onLoginOrProceedToRegistrationSuccess, initialPhone = '', initialData = null, isEditing = false }) => {
  const [stage, setStage] = useState(isEditing ? 3 : 1); // Start at stage 3 if editing (skip OTP for now)
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    phone: initialData?.phone || initialPhone,
    otp: '',
    vehicleType: initialData?.vehicle_type || '',
    photo: null,
    photoPreview: initialData?.photo_url || null,
    photoUrl: initialData?.photo_url || null, // Store existing photo URL if editing
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (isEditing && initialData) {
      setFormData({
        name: initialData.name,
        phone: initialData.phone,
        otp: '', // OTP not needed for edit for now
        vehicleType: initialData.vehicle_type,
        photo: null, // New photo will be handled separately
        photoPreview: initialData.photo_url, // Show existing photo
        photoUrl: initialData.photo_url, // Keep existing photo URL
      });
      setStage(3); // Go directly to vehicle/photo info for editing
    } else if (initialPhone) {
        setFormData(prev => ({ ...prev, phone: initialPhone }));
    }
  }, [isEditing, initialData, initialPhone]);


  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSendOtp = async (name, phone) => {
    if (isEditing) { // Skip OTP sending if editing
        setStage(3);
        return true;
    }
    if (!name.trim() || !phone.trim()) {
      toast({ title: 'خطأ', description: 'الرجاء إدخال الاسم ورقم الهاتف.', variant: 'destructive' });
      return false;
    }
    if (!/^01[0-2,5]\d{8}$/.test(phone) && !/^0\d{9}$/.test(phone)) { 
      toast({ title: 'خطأ', description: 'رقم الهاتف المصري غير صالح. يجب أن يبدأ بـ 01 ويتكون من 11 رقمًا أو يكون 10 أرقام أرضي.', variant: 'destructive' });
      return false;
    }
    updateFormData('name', name);
    updateFormData('phone', phone);
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-beon-otp', {
        body: JSON.stringify({ phone_number: phone, name: name }) 
      });

      if (error) throw error;
      
      if (data && data.status === 'success') {
        toast({ title: 'نجاح', description: data.message || 'تم إرسال رمز التوثيق إلى هاتفك.' });
        setStage(2);
        return true;
      } else {
        throw new Error(data.message || 'فشل إرسال رمز التوثيق.');
      }
    } catch (error) {
      console.error('OTP Send Error:', error);
      let errorMessage = 'حدث خطأ أثناء إرسال الرمز.';
      if (error.message) {
        try {
          const parsedError = JSON.parse(error.message);
          errorMessage = parsedError.message || errorMessage;
        } catch (e) {
          errorMessage = error.message;
        }
      } else if (error.context && error.context.error_description) {
         errorMessage = error.context.error_description;
      }
      toast({ title: 'خطأ في إرسال الرمز', description: errorMessage, variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (otp) => {
    if (isEditing) { // Skip OTP verification if editing
        setStage(3);
        return true;
    }
    if (!otp.trim() || otp.length !== 6) {
      toast({ title: 'خطأ', description: 'رمز التوثيق يجب أن يتكون من 6 أرقام.', variant: 'destructive' });
      return false;
    }
    updateFormData('otp', otp);
    setIsLoading(true);
    try {
      const { data: verifyData, error: verifyError } = await supabase.functions.invoke('verify-beon-otp', {
        body: JSON.stringify({ phone_number: formData.phone, otp_code_input: otp })
      });

      if (verifyError) throw verifyError;

      if (verifyData && verifyData.status === 'success') {
        const { data: driver, error: driverError } = await supabase
          .from('drivers')
          .select('*')
          .eq('phone', formData.phone)
          .single();

        if (driverError && driverError.code !== 'PGRST116') { 
          throw driverError;
        }

        if (driver) { 
          localStorage.setItem(DRIVER_PHONE_KEY, formData.phone);
          onLoginOrProceedToRegistrationSuccess(driver, formData.phone);
          toast({ title: 'تم تسجيل الدخول بنجاح!', description: `مرحباً بعودتك يا ${driver.name}!` });
          return true;
        } else { 
          toast({ title: 'نجاح', description: verifyData.message || 'تم التحقق من رقم الهاتف. أكمل التسجيل.' });
          setStage(3);
          return true;
        }
      } else {
        throw new Error(verifyData.message || 'رمز التوثيق غير صحيح أو منتهي الصلاحية. الرجاء التأكد من الرمز والمحاولة مرة أخرى.');
      }
    } catch (error) {
      console.error('OTP Verify/Driver Check Error:', error);
      let errorMessage = 'حدث خطأ أثناء التحقق.';
       if (error.message) {
        try {
          const parsedError = JSON.parse(error.message);
          errorMessage = parsedError.message || errorMessage;
        } catch (e) {
           errorMessage = error.message;
        }
      } else if (error.context && error.context.error_description) {
         errorMessage = error.context.error_description;
      }
      toast({ title: 'خطأ في التحقق', description: errorMessage, variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteRegistrationOrUpdate = async (vehicleType, photoFile, photoPreviewData) => {
    // photoFile is the new File object, photoPreviewData is its preview URL
    // formData.photoUrl is the existing URL if editing
    if (!formData.name && isEditing) { // Ensure name is present when editing (it's on stage 1 normally)
        // This scenario should ideally not happen if stage management is correct
        // but as a fallback, use initialData.name
        updateFormData('name', initialData.name); 
    }

    if (!vehicleType || (!photoFile && !formData.photoUrl && !isEditing) || (isEditing && !photoFile && !formData.photoUrl) ) {
      toast({ title: 'خطأ', description: 'الرجاء اختيار نوع المركبة وتحميل صورة شخصية.', variant: 'destructive' });
      return;
    }
    updateFormData('vehicleType', vehicleType);
    if(photoFile) updateFormData('photo', photoFile);
    if(photoPreviewData) updateFormData('photoPreview', photoPreviewData);

    setIsLoading(true);

    try {
      let finalPhotoUrl = formData.photoUrl; // Use existing photo URL by default if editing

      if (photoFile) { // If a new photo is uploaded
        const fileName = `public/${Date.now()}_${photoFile.name.replace(/\s+/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('driver_photos')
          .upload(fileName, photoFile, { cacheControl: '3600', upsert: true }); // Use upsert: true for editing

        if (uploadError) {
          if (uploadError.message && uploadError.message.includes('Duplicate')) { 
            toast({ title: 'خطأ في الرفع', description: 'ملف بنفس الإسم موجود بالفعل. حاول تغيير اسم الملف أو الرفع مرة أخرى.', variant: 'destructive' });
          } else {
            throw uploadError;
          }
          setIsLoading(false);
          return;
        }
        
        if (uploadData) {
          const { data: urlData } = supabase.storage.from('driver_photos').getPublicUrl(uploadData.path);
          finalPhotoUrl = urlData.publicUrl;
        } else if (!uploadError) {
          toast({ title: 'خطأ غير متوقع في الرفع', description: 'لم يتم رفع الصورة، ولم يتم تسجيل خطأ واضح.', variant: 'destructive' });
          setIsLoading(false);
          return;
        }
      }

      const payload = {
        name: formData.name,
        phone: formData.phone, // Phone is not editable in 'edit' mode via UI, so this is safe
        vehicle_type: vehicleType,
        photo_url: finalPhotoUrl,
        // is_online will be handled by the profile view, don't set it here unless it's a new registration
      };

      if (!isEditing) {
        payload.is_online = true; // Default for new registration
      }
      payload.updated_at = new Date().toISOString();


      if (isEditing && initialData?.id) {
        // Update existing driver
        const { data: updatedDriverData, error: updateError } = await supabase
          .from('drivers')
          .update(payload)
          .eq('id', initialData.id)
          .select()
          .single();

        if (updateError) throw updateError;
        onLoginOrProceedToRegistrationSuccess(updatedDriverData, formData.phone);
        toast({ title: 'نجاح!', description: 'تم تحديث بياناتك بنجاح.' });

      } else {
        // Insert new driver
        const { data: newDriverData, error: insertError } = await supabase
          .from('drivers')
          .insert([payload])
          .select()
          .single();

        if (insertError) throw insertError;

        localStorage.setItem(DRIVER_PHONE_KEY, formData.phone);
        onLoginOrProceedToRegistrationSuccess(newDriverData, formData.phone);
        toast({ title: 'نجاح!', description: 'تم تسجيلك كسائق بنجاح.' });
      }
      
    } catch (error) {
      console.error('Registration/Update Error:', error);
      let errorMessage = isEditing ? 'لم نتمكن من تحديث بياناتك.' : 'لم نتمكن من حفظ بياناتك.';
      if(error.message && error.message.includes('drivers_phone_key') && !isEditing) { // Only relevant for new registration
          errorMessage = 'هذا الرقم مسجل بالفعل لدينا.';
      } else if (error.message) {
          errorMessage = error.message;
      }
      toast({ title: `خطأ في ${isEditing ? 'التحديث' : 'التسجيل'}`, description: errorMessage, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };


  const renderStageContent = () => {
    switch (stage) {
      case 1:
        return (
          <InitialInfoForm
            onSubmit={handleSendOtp}
            isLoading={isLoading}
            initialName={formData.name}
            initialPhone={formData.phone}
            isEditing={isEditing} // Pass isEditing
          />
        );
      case 2:
        return (
          <OtpVerificationForm
            phoneNumber={formData.phone}
            onSubmit={handleVerifyOtp}
            onBack={() => setStage(1)}
            isLoading={isLoading}
          />
        );
      case 3:
        return (
          <VehicleInfoForm
            onSubmit={handleCompleteRegistrationOrUpdate}
            isLoading={isLoading}
            isEditing={isEditing} // Pass isEditing
            initialVehicleType={formData.vehicleType}
            initialPhotoUrl={formData.photoUrl} // Pass existing photo URL for preview
            driverName={formData.name} // Pass name for context
            onNameChange={(newName) => updateFormData('name', newName)} // Allow name change in edit mode
          />
        );
      default:
        return null;
    }
  };
  
  const totalStages = isEditing ? 1 : 3; // Only 1 stage content-wise for editing (VehicleInfoForm)
  const currentDisplayStage = isEditing ? 1 : stage;


  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-gray-100">
      <Card className="w-full max-w-md shadow-2xl overflow-hidden">
        <AnimatePresence mode="wait">
          {renderStageContent()}
        </AnimatePresence>
      </Card>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
         {isEditing ? `تعديل بيانات ${formData.name}` : `الخطوة ${currentDisplayStage} من ${totalStages}`}
        </p>
        {!isEditing && (
        <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5 mt-1 mx-auto">
          <div
            className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${(currentDisplayStage / totalStages) * 100}%` }}
          ></div>
        </div>
        )}
      </div>
    </div>
  );
};

export default DriverRegistrationFlow;