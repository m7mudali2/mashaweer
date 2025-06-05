import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area'; // Assuming you'll create this or have it

const TermsAndConditionsDialog = ({ triggerText }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto text-sm text-muted-foreground hover:text-primary">
          {triggerText}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-center sm:text-right">سياسة الاستخدام والشروط</DialogTitle>
          <DialogDescription className="text-center sm:text-right">
            يرجى قراءة الشروط والأحكام التالية بعناية قبل استخدام خدماتنا.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[400px] w-full rounded-md border p-4 text-sm">
          <h3 className="font-semibold mb-2">1. الهدف من التطبيق</h3>
          <p className="mb-3">
            تطبيق مشاوير هو منصة تهدف إلى ربط المستخدمين (الركاب) بالسائقين المتاحين في محيطهم الجغرافي.
            يتم التواصل المباشر بين الطرفين عبر الهاتف أو WhatsApp لترتيب تفاصيل المشاوير والأسعار خارج نطاق التطبيق.
          </p>

          <h3 className="font-semibold mb-2">2. للمستخدمين (الركاب)</h3>
          <p className="mb-3">
            لا يتطلب التطبيق تسجيل دخول للركاب، ويمكنهم تصفح السائقين والتواصل معهم مباشرة.
            التطبيق مجرد أداة ربط ولا يتحمل مسؤولية أي اتفاق أو خلاف يتم خارج نطاقه.
          </p>

          <h3 className="font-semibold mb-2">3. للسائقين (التسجيل والإدارة)</h3>
          <p className="mb-3">
            يتطلب استخدام التطبيق كسائق تسجيل معلومات مثل الاسم، رقم الهاتف، نوع المركبة، وصورة شخصية.
            يمكن للسائق التحكم في حالته (متصل/غير متصل) لتحديد توفره.
          </p>

          <h3 className="font-semibold mb-2">4. مسؤوليات السائقين</h3>
          <p className="mb-3">
            السائق مسؤول عن تقديم معلومات دقيقة، مشاركة الموقع عند تفعيل حالة "متصل"،
            التواصل المهني مع الركاب، والالتزام بالقوانين المحلية.
          </p>

          <h3 className="font-semibold mb-2">5. حماية البيانات والخصوصية</h3>
          <p className="mb-3">
            نقوم بجمع الحد الأدنى من البيانات اللازمة لتشغيل التطبيق مثل الاسم ورقم الهاتف ونوع المركبة.
            لا يتم جمع بيانات الركاب. نلتزم بحماية البيانات وعدم مشاركتها دون سبب مشروع.
          </p>

          <h3 className="font-semibold mb-2">6. استخدام الموقع الجغرافي</h3>
          <p className="mb-3">
            يتم استخدام موقع السائقين النشطين فقط لعرضهم على الخريطة وتحديد المسافة بينهم وبين المستخدمين.
            يتم ذلك بموافقة السائق عند تفعيل حالة "متصل".
          </p>

          <h3 className="font-semibold mb-2">7. التعديلات على السياسة</h3>
          <p className="mb-3">
            قد يتم تعديل هذه السياسة في أي وقت. استمرارك في استخدام التطبيق بعد التعديلات يُعد قبولاً لها.
          </p>

          <h3 className="font-semibold mb-2">8. إنهاء الخدمة</h3>
          <p className="mb-3">
            يمكن لتطبيق مشاوير تعليق أو إنهاء وصولك إذا خالفت الشروط أو بدر منك سلوك غير لائق.
          </p>

          <h3 className="font-semibold mb-2">9. إخلاء المسؤولية</h3>
          <p className="mb-3">
            تطبيق مشاوير هو أداة ربط فقط ولا يضمن جودة الخدمة أو يتحمل مسؤولية الخلافات بين المستخدمين والسائقين.
            استخدامك للتطبيق يكون على مسؤوليتك الخاصة.
          </p>

          <h3 className="font-semibold mb-2">10. شرط العمر</h3>
          <p className="mb-3">
            لا يُسمح باستخدام التطبيق لمن هم دون سن 17 عامًا. باستخدامك للتطبيق، فإنك تقر أنك تبلغ 17 عامًا أو أكثر.
          </p>

          <h3 className="font-semibold mb-2">11. القانون الحاكم</h3>
          <p className="mb-3">
            تُفسر هذه السياسة وتخضع للقوانين المحلية للدولة التي يعمل بها التطبيق.
          </p>
           <h3 className="font-semibold mb-2">12. التواصل معنا</h3>
           
          <p className="mb-3">
            لأي استفسارات متعلقة بسياسة الاستخدام، يرجى التواصل عبر البريد الإلكتروني:
            <span className="underline ms-1">info@mashaweer.online</span>
          </p>

          <p className="mt-6 text-xs text-muted-foreground">آخر تحديث: 29 مايو 2025</p>
        </ScrollArea>

        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">
              إغلاق
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TermsAndConditionsDialog;