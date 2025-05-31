import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const OtpVerificationForm = ({ phoneNumber, onSubmit, onBack, isLoading }) => {
  const [otp, setOtp] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit(otp);
  };

  return (
    <motion.div key="stage2" initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className="space-y-6">
      <form onSubmit={handleSubmit}>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center"><ShieldCheck className="mr-2 ml-2 text-primary" /> توثيق رقم الهاتف</CardTitle>
          <CardDescription>أدخل الرمز المكون من 6 أرقام الذي تم إرساله إلى رقم هاتفك ({phoneNumber}).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="otpReg">رمز التوثيق (OTP)</Label>
            <Input 
              id="otpReg" 
              type="text" 
              placeholder="xxxxxx" 
              value={otp} 
              onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))} 
              className="mt-1 tracking-[0.3em] text-center" 
              maxLength={6} 
              minLength={6}
              required 
              pattern="\d{6}"
              inputMode="numeric"
            />
          </div>
          <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 text-primary-foreground">
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2 ml-2" /> : null}
            {isLoading ? 'جاري التحقق...' : 'تحقق من الرمز'}
          </Button>
          <Button variant="link" onClick={onBack} disabled={isLoading}>تعديل رقم الهاتف أو إعادة الإرسال</Button>
        </CardContent>
      </form>
    </motion.div>
  );
};

export default OtpVerificationForm;