import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { VEHICLE_TYPES } from '@/constants';
import { Camera, UserCircle, Car, Loader2, Edit3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

const VehicleInfoForm = ({ 
  onSubmit, 
  isLoading, 
  isEditing = false, 
  initialVehicleType = '', 
  initialPhotoUrl = null,
  driverName = '', // Receive driverName for display/edit
  onNameChange // Function to update name in parent if editing
}) => {
  const [vehicleType, setVehicleType] = useState(initialVehicleType);
  const [currentDriverName, setCurrentDriverName] = useState(driverName);
  const [photo, setPhoto] = useState(null); // For new file
  const [photoPreview, setPhotoPreview] = useState(initialPhotoUrl); // For display, could be new or existing
  const { toast } = useToast();

  useEffect(() => {
    setVehicleType(initialVehicleType);
    setPhotoPreview(initialPhotoUrl);
    setCurrentDriverName(driverName);
  }, [initialVehicleType, initialPhotoUrl, driverName]);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith('image/')) {
      setPhoto(file); // Store the new file object
      setPhotoPreview(URL.createObjectURL(file)); // Set preview for the new file
    } else {
      setPhoto(null);
      // Don't reset photoPreview if a file wasn't selected, keep existing if editing
      if (file) { // Only toast if a file was selected but invalid
        toast({ title: 'خطأ', description: 'الرجاء اختيار ملف صورة صالح.', variant: 'destructive' });
      }
    }
  };

  const handleNameInputChange = (e) => {
    setCurrentDriverName(e.target.value);
    if(isEditing && onNameChange) {
        onNameChange(e.target.value); // Update name in parent state (DriverRegistrationFlow)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!vehicleType || (!photo && !photoPreview)) { // Check if there's either a new photo or an existing preview
      toast({ title: 'خطأ', description: 'الرجاء اختيار نوع المركبة وتحميل صورة شخصية.', variant: 'destructive' });
      return;
    }
    if (isEditing && !currentDriverName.trim()) {
        toast({ title: 'خطأ', description: 'اسم السائق لا يمكن أن يكون فارغًا.', variant: 'destructive' });
        return;
    }
    await onSubmit(vehicleType, photo, photoPreview); // Pass new photo file and its preview
  };

  return (
    <motion.div 
      key={isEditing ? "editStage" : "stage3"} 
      initial={{ opacity: 0, x: 50 }} 
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -50 }} 
      className="space-y-6"
    >
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            {isEditing ? <Edit3 className="mr-2 ml-2 text-primary" /> : <Car className="mr-2 ml-2 text-primary" />}
            {isEditing ? `تعديل بيانات ${driverName}` : 'معلومات المركبة والصورة'}
          </CardTitle>
          <CardDescription>
            {isEditing ? 'قم بتحديث معلومات مركبتك وصورتك الشخصية واسمك.' : 'اختر نوع مركبتك وقم بتحميل صورة شخصية واضحة.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isEditing && (
            <div>
              <Label htmlFor="driverNameEdit">الاسم الكامل</Label>
              <Input 
                id="driverNameEdit" 
                type="text" 
                value={currentDriverName} 
                onChange={handleNameInputChange} 
                className="mt-1" 
                required 
              />
            </div>
          )}
          <div>
            <Label htmlFor="vehicleTypeReg">نوع المركبة</Label>
            <Select value={vehicleType} onValueChange={setVehicleType} required>
              <SelectTrigger id="vehicleTypeReg" className="w-full mt-1">
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
            <Label htmlFor="photoReg">الصورة الشخصية</Label>
            <div className="mt-1 flex items-center space-x-reverse space-x-3">
              {photoPreview ? (
                <img src={photoPreview} alt="معاينة الصورة الشخصية" className="h-20 w-20 rounded-full object-cover" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                  <UserCircle className="h-10 w-10" />
                </div>
              )}
              <label htmlFor="photo-upload-reg" className="cursor-pointer bg-secondary text-secondary-foreground hover:bg-secondary/80 px-4 py-2 rounded-md text-sm font-medium flex items-center">
                <Camera className="mr-2 ml-2 h-4 w-4" /> {photoPreview ? 'تغيير الصورة' : 'تحميل صورة'}
                <Input id="photo-upload-reg" type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
              </label>
            </div>
             {!photo && isEditing && initialPhotoUrl && (
              <p className="text-xs text-muted-foreground mt-1">اترك حقل الصورة كما هو للاحتفاظ بالصورة الحالية.</p>
            )}
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2 ml-2" /> : null}
            {isLoading ? (isEditing ? 'جاري الحفظ...' : 'جاري التسجيل...') : (isEditing ? 'حفظ التعديلات' : 'إكمال التسجيل')}
          </Button>
        </CardContent>
      </form>
    </motion.div>
  );
};

export default VehicleInfoForm;