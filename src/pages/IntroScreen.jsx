import React from 'react';
import { motion } from 'framer-motion';
import { useAppContext } from '@/contexts/AppContext';
import { useNavigate } from 'react-router-dom';
import TermsAndConditionsDialog from '@/components/driver-profile/TermsAndConditionsDialog';
import { Button } from '@/components/ui/button';
import { Rocket } from 'lucide-react';

const IntroScreen = () => {
  const { markIntroAsViewed } = useAppContext();
  const navigate = useNavigate();

  const handleStartNow = () => {
    markIntroAsViewed();
    navigate('/'); 
  };

  const subtleFadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600 text-white relative overflow-hidden">
      <div className="flex-grow flex flex-col items-center justify-center text-center z-10 w-full max-w-md pt-12 pb-8">
        <motion.div
          initial={subtleFadeInUp.initial}
          animate={subtleFadeInUp.animate}
          transition={{ ...subtleFadeInUp.transition, delay: 0.1 }}
          className="mb-6 md:mb-8"
        >
          <img
            alt="رسم توضيحي لسيارة وأشخاص يتصافحون ودراجة نارية في بيئة حضرية"
            className="w-56 h-auto md:w-72 mx-auto" // Slightly smaller image
            src="https://storage.googleapis.com/hostinger-horizons-assets-prod/8b474ad4-ec3e-4078-bc95-1ee72e18ec7b/80590c0a3182865c539d48cef46ece9b.png"
          />
        </motion.div>
        
        <motion.h1 
          className="text-5xl md:text-6xl font-bold mb-3 md:mb-4 tracking-tight" // Slightly smaller title, less extrabold
          initial={subtleFadeInUp.initial}
          animate={subtleFadeInUp.animate}
          transition={{ ...subtleFadeInUp.transition, delay: 0.25 }}
        >
          مشاوير
        </motion.h1>
        
        <motion.p 
          className="text-md md:text-lg mb-10 md:mb-12 font-normal max-w-xs mx-auto" // Normal font weight, adjusted margin
          initial={subtleFadeInUp.initial}
          animate={subtleFadeInUp.animate}
          transition={{ ...subtleFadeInUp.transition, delay: 0.4 }}
        >
          ببساطة! تواصل مع السائقين حولك وابدأ مشوارك.
        </motion.p>

        <motion.div 
          className="w-full flex justify-center"
          initial={subtleFadeInUp.initial}
          animate={subtleFadeInUp.animate}
          transition={{ ...subtleFadeInUp.transition, delay: 0.55 }}
        >
          <Button 
            size="lg" 
            className="w-full max-w-xs text-md md:text-lg bg-white text-green-600 hover:bg-gray-100 shadow-lg hover:shadow-xl transform hover:scale-103 transition-all duration-200 font-medium" // Slightly smaller text, more subtle hover
            onClick={handleStartNow}
          >
            <Rocket className="mr-2 ml-2 h-5 w-5" /> ابدأ الآن
          </Button>
        </motion.div>

      </div>

      <motion.div 
        className="w-full text-center py-4 z-10 mt-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <TermsAndConditionsDialog 
          triggerText="سياسة الاستخدام"
          dialogTitle="سياسة الاستخدام والشروط"
          dialogDescription="مرحباً بك في تطبيق مشاوير! باستخدامك لهذا التطبيق، فإنك توافق على الالتزام بالشروط والأحكام التالية:"
          terms={[
            {
              title: "1. الهدف من التطبيق",
              content: "تطبيق مشاوير هو منصة تهدف إلى ربط المستخدمين (الركاب) بالسائقين المتاحين في محيطهم الجغرافي. يتم التواصل المباشر بين الطرفين عبر الهاتف أو WhatsApp لترتيب تفاصيل المشاوير والأسعار خارج نطاق التطبيق."
            },
            {
              title: "2. للمستخدمين (الركاب)",
              content: "لا يتطلب التطبيق تسجيل دخول للركاب، ويمكنهم تصفح السائقين والتواصل معهم مباشرة عبر الهاتف أو WhatsApp. التطبيق مجرد أداة ربط ولا يتحمل مسؤولية أي اتفاق أو خلاف."
            },
            {
              title: "3. للسائقين (التسجيل والإدارة)",
              content: "يتطلب استخدام التطبيق كسائق تسجيل معلوماتك مثل الاسم، رقم الهاتف، نوع المركبة، وصورة شخصية. يمكن للسائق التحكم في حالته (متصل/غير متصل) لتحديد توفره."
            },
            {
              title: "4. مسؤوليات السائقين",
              content: "السائق مسؤول عن تقديم معلومات دقيقة، مشاركة الموقع عند تفعيل حالة 'متصل'، التواصل المهني مع الركاب، والالتزام بالقوانين المحلية."
            },
            {
              title: "5. حماية البيانات والخصوصية",
              content: "نقوم بجمع الحد الأدنى من البيانات اللازمة لتشغيل التطبيق مثل الاسم ورقم الهاتف ونوع المركبة. لا يتم جمع بيانات الركاب. نلتزم بحماية البيانات وعدم مشاركتها دون سبب مشروع."
            },
            {
              title: "6. استخدام الموقع الجغرافي",
              content: "يتم استخدام موقع السائقين النشطين فقط لعرضهم على الخريطة وتحديد المسافة بينهم وبين المستخدمين. يتم ذلك بموافقة السائق عند تفعيل حالة 'متصل'."
            },
            {
              title: "7. التعديلات على السياسة",
              content: "قد يتم تعديل هذه السياسة في أي وقت. استمرارك في استخدام التطبيق بعد التعديلات يُعد قبولاً لها."
            },
            {
              title: "8. إنهاء الخدمة",
              content: "يمكن لتطبيق مشاوير تعليق أو إنهاء وصولك إذا خالفت الشروط أو بدر منك سلوك غير لائق."
            },
            {
              title: "9. إخلاء المسؤولية",
              content: "تطبيق مشاوير هو أداة ربط فقط ولا يضمن جودة الخدمة أو يتحمل مسؤولية الخلافات بين المستخدمين والسائقين. استخدامك للتطبيق يكون على مسؤوليتك الخاصة."
            },
            {
              title: "10. شروط العمر",
              content: "لا يُسمح باستخدام التطبيق لمن هم دون سن 17 عامًا. باستخدامك للتطبيق، فإنك تقر أنك تبلغ 17 عامًا أو أكثر."
            },
            {
              title: "11. القانون الحاكم",
              content: "تُفسر هذه السياسة وتخضع للقوانين المحلية للدولة التي يعمل بها التطبيق."
            },
            {
              title: "12. التواصل معنا",
              content: "لأي استفسارات متعلقة بسياسة الاستخدام، يرجى التواصل عبر البريد الإلكتروني: info@mashaweer.online"
            },

            {
              title: "13. تاريخ آخر تحديث",
              content: "تم تحديث سياسة الاستخدام هذه بتاريخ 30 مايو 2025."
            }
            
          ]}

            buttonText="أوافق" 
            triggerClassName="text-white hover:text-gray-200 transition-colors duration-200 text-sm" // Made text slightly smaller
        />
      </motion.div>
    </div>
  );
};

export default IntroScreen;