import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { VEHICLE_TYPES } from '@/constants';
import { supabase } from '@/lib/supabaseClient';
import { Camera, ShieldCheck, UserCircle, Phone, Car, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TermsAndConditionsDialog from '@/components/driver-profile/TermsAndConditionsDialog';

const DriverRegistrationScreen = () => {
  const [stage, setStage] = useState(1);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSendOtp = async () => {
    if (!name.trim() || !phone.trim()) {
      toast({ title: 'خطأ', description: 'الرجاء إدخال الاسم ورقم الهاتف.', variant: 'destructive' });
      return;
    }
    // Regex for Egyptian phone numbers: starts with 01 followed by 0, 1, 2, or 5, then 8 digits. Or starts with 0 followed by a digit (like 2 for Cairo) then 7 or 8 digits.
    if (!/^(01[0125]\d{8}|0\d{8,9})$/.test(phone)) { 
      toast({ title: 'خطأ', description: 'رقم الهاتف المصري غير صالح. يجب أن يكون مثل 01xxxxxxxxx أو 02xxxxxxx.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('send_beon_otp', { phone_number: phone });

      if (error) throw error;

      if (data && data.status === 'success') {
        toast({ title: 'نجاح', description: 'تم إرسال رمز التوثيق إلى هاتفك.' });
        setStage(2);
      } else {
        throw new Error(data.message || 'فشل إرسال رمز التوثيق.');
      }
    } catch (error) {
      console.error('OTP Send Error:', error);
      toast({ title: 'خطأ', description: error.message || 'حدث خطأ أثناء إرسال الرمز.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp.trim() || otp.length < 4) { // Assuming OTP is 4 digits
      toast({ title: 'خطأ', description: 'رمز التوثيق غير صالح. يجب أن يكون 4 أرقام.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('verify_beon_otp', { phone_number: phone, otp_code_input: otp });

      if (error) throw error;

      if (data && data.status === 'success') {
        toast({ title: 'نجاح', description: 'تم التحقق من رقم الهاتف.' });
        setStage(3);
      } else {
        throw new Error(data.message || 'رمز التوثيق غير صحيح أو منتهي الصلاحية.');
      }
    } catch (error) {
      console.error('OTP Verify Error:', error);
      toast({ title: 'خطأ', description: error.message || 'حدث خطأ أثناء التحقق من الرمز.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    } else {
      toast({ title: 'خطأ', description: 'الرجاء اختيار ملف صورة صالح.', variant: 'destructive' });
    }
  };

  const handleCompleteRegistration = async () => {
    if (!vehicleType || !photo) {
      toast({ title: 'خطأ', description: 'الرجاء اختيار نوع المركبة وتحميل صورة شخصية.', variant: 'destructive' });
      return;
    }
    setIsLoading(true);

    try {
      let photoUrl = null;
      if (photo) {
        const fileName = `public/${Date.now()}_${photo.name.replace(/\s/g, '_')}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('driver_photos') 
          .upload(fileName, photo, {
            cacheControl: '3600',
            upsert: false
          });

        if (uploadError) {
            if (uploadError.message === 'The resource already exists') {
                 toast({ title: 'خطأ في الرفع', description: 'ملف بنفس الإسم موجود بالفعل. حاول تغيير اسم الملف أو حاول مرة أخرى.', variant: 'destructive'});
                 setIsLoading(false);
                 return;
            } else {
                throw uploadError;
            }
        }
        
        if (uploadData) {
            const { data: urlData } = supabase.storage.from('driver_photos').getPublicUrl(uploadData.path);
            photoUrl = urlData.publicUrl;
        } else if (!uploadError) { 
            toast({ title: 'خطأ في الرفع', description: 'لم يتم رفع الصورة، قد يكون الملف موجودًا بالفعل.', variant: 'destructive'});
            setIsLoading(false);
            return;
        }
      }

      const { error: insertError } = await supabase
        .from('drivers')
        .insert([{ 
          name, 
          phone, 
          vehicle_type: vehicleType, 
          photo_url: photoUrl,
          is_online: true, // Default to online
        }]);

      if (insertError) throw insertError;

      toast({ title: 'نجاح!', description: 'تم تسجيلك كسائق بنجاح.' });
      // Reset form or navigate
      setStage(1); setName(''); setPhone(''); setOtp(''); setVehicleType(''); setPhoto(null); setPhotoPreview(null);
      // Potentially navigate to home or profile screen
    } catch (error) {
      console.error('Registration Error:', error);
      toast({ title: 'خطأ في التسجيل', description: error.message || 'لم نتمكن من حفظ بياناتك.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStage = () => {
    switch (stage) {
      case 1:
        return (
          <motion.div key="stage1" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center"><UserCircle className="mr-2 ml-2 text-primary" /> معلومات السائق</CardTitle>
              <CardDescription>الرجاء إدخال اسمك ورقم هاتفك (المصري) لإرسال رمز التوثيق.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">الاسم الكامل</Label>
                <Input id="name" type="text" placeholder="مثال: محمد أحمد" value={name} onChange={(e) => setName(e.target.value)} className="mt-1" required />
              </div>
              <div>
                <Label htmlFor="phone">رقم الهاتف (مصر)</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  placeholder="مثال: 01xxxxxxxxx" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} 
                  className="mt-1" 
                  dir="ltr" 
                  required 
                  pattern="^(01[0125]\d{8}|0\d{8,9})$"
                  title="ادخل رقم هاتف مصري صحيح (مثال: 01234567890 أو 021234567)"
                  inputMode="tel"
                />
              </div>
              <Button onClick={handleSendOtp} disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2 ml-2" /> : null}
                {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التوثيق'}
              </Button>
              <div className="text-center mt-3">
                <TermsAndConditionsDialog
                  triggerText={
                    <>
                      بالتسجيل، أنت توافق على{" "}
                      <span className="text-blue-600 underline cursor-pointer">
                        سياسة الاستخدام والشروط
                      </span>.
                    </>
                  }
                />
              </div>

            </CardContent>
          </motion.div>
        );
      case 2:
        return (
          <motion.div key="stage2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center"><ShieldCheck className="mr-2 ml-2 text-primary" /> توثيق رقم الهاتف</CardTitle>
              <CardDescription>أدخل الرمز الذي تم إرساله إلى رقم هاتفك ({phone}).</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="otp">رمز التوثيق (OTP)</Label>
                <Input id="otp" type="text" placeholder="xxxx" value={otp} onChange={(e) => setOtp(e.target.value)} className="mt-1 tracking-[0.5em] text-center" maxLength={4} inputMode="numeric" />
              </div>
              <Button onClick={handleVerifyOtp} disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2 ml-2" /> : null}
                {isLoading ? 'جاري التحقق...' : 'تحقق من الرمز'}
              </Button>
              <Button variant="link" onClick={() => { setStage(1); setOtp(''); setIsLoading(false); /* Reset OTP and loading state */ }}>تعديل رقم الهاتف</Button>
            </CardContent>
          </motion.div>
        );
      case 3:
        return (
          <motion.div key="stage3" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center"><Car className="mr-2 ml-2 text-primary" /> معلومات المركبة والصورة</CardTitle>
              <CardDescription>اختر نوع مركبتك وقم بتحميل صورة شخصية واضحة.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="vehicleType">نوع المركبة</Label>
                <Select value={vehicleType} onValueChange={setVehicleType}>
                  <SelectTrigger id="vehicleType" className="w-full mt-1">
                    <SelectValue placeholder="اختر نوع المركبة" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="photo">الصورة الشخصية</Label>
                <div className="mt-1 flex items-center space-x-reverse space-x-3">
                  {photoPreview ? (
                    <img-replace src={photoPreview} alt="معاينة الصورة الشخصية" className="h-20 w-20 rounded-full object-cover" />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                      <UserCircle className="h-10 w-10" />
                    </div>
                  )}
                  <label htmlFor="photo-upload" className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium flex items-center">
                    <Camera className="mr-2 ml-2 h-4 w-4" /> تحميل صورة
                    <Input id="photo-upload" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
              </div>
              <Button onClick={handleCompleteRegistration} disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2 ml-2" /> : null}
                {isLoading ? 'جاري التسجيل...' : 'إكمال التسجيل'}
              </Button>
            </CardContent>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-slate-50 to-gray-100 dark:from-slate-900 dark:to-gray-800">
      <Card className="w-full max-w-md shadow-2xl overflow-hidden bg-card">
        <AnimatePresence mode="wait">
          {renderStage()}
        </AnimatePresence>
      </Card>
      <div className="mt-4 text-center">
        <p className="text-sm text-muted-foreground">
          الخطوة {stage} من 3
        </p>
        <div className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-1 mx-auto">
          <div 
            className="bg-primary h-2.5 rounded-full transition-all duration-500 ease-out" 
            style={{ width: `${(stage / 3) * 100}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default DriverRegistrationScreen;