import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserCircle, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import TermsAndConditionsDialog from '@/components/driver-profile/TermsAndConditionsDialog';

const InitialInfoForm = ({ onSubmit, isLoading, initialName = '', initialPhone = '', isEditing = false }) => {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState(initialPhone);

  useEffect(() => {
    setName(initialName);
    setPhone(initialPhone);
  }, [initialName, initialPhone]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(name, phone);
  };

  return (
    <motion.div 
      key="stage1" 
      initial={{ opacity: 0, x: isEditing ? 0 : 50 }}
      animate={{ opacity: 1, x: 0 }} 
      exit={{ opacity: 0, x: -50 }} 
      className="space-y-6"
    >
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <UserCircle className="mr-2 ml-2 text-primary" /> 
            {isEditing ? `تعديل بيانات ${initialName}` : 'معلومات السائق'}
          </CardTitle>
          <CardDescription>
            {isEditing ? 'يمكنك تعديل اسمك هنا. رقم الهاتف غير قابل للتعديل.' : 'الرجاء إدخال اسمك ورقم هاتفك (المصري) لإرسال رمز التوثيق.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="nameReg">الاسم الكامل</Label>
            <Input 
              id="nameReg" 
              type="text" 
              placeholder="مثال: محمد أحمد" 
              value={name} 
              onChange={(e) => setName(e.target.value)} 
              className="mt-1" 
              required 
            />
          </div>
          <div>
            <Label htmlFor="phoneReg">رقم الهاتف (مصر)</Label>
            <Input 
              id="phoneReg" 
              type="tel" 
              placeholder="مثال: 01xxxxxxxxx" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, ''))} 
              className="mt-1" 
              dir="ltr" 
              required 
              pattern="^01[0-2,5]\d{8}$|^0\d{9}$" 
              title="ادخل رقم هاتف مصري صحيح (مثال: 01234567890 أو 021234567)"
              inputMode="tel"
              readOnly={isEditing}
              disabled={isEditing}
            />
          </div>
          {!isEditing && (
            <>
              <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
                {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2 ml-2" /> : null}
                {isLoading ? 'جاري الإرسال...' : 'إرسال رمز التوثيق'}
              </Button>
              <div className="text-center mt-3">
                <TermsAndConditionsDialog triggerText="بالتسجيل، أنت توافق على سياسة الاستخدام والشروط." />
              </div>
            </>
          )}
        </CardContent>
      </form>
    </motion.div>
  );
};

export default InitialInfoForm;