
import { BadRequestException } from "../common/exceptions/error.exception.js";
import { processMulterUpload } from "../common/utils/multer/local.multer.js";


// إنشاء وسيط مسؤول عن استقبال الملفات والتحقق منها وحفظها
export const uploadMiddleware = ({
    isRequired = true,       // تحديد هل رفع الملف إجباري أم اختياري
    multerMiddleware,        // إعداد استقبال الملفات باستخدام Multer
    customPath = "general",  // تحديد المجلد الذي ستُحفظ فيه الملفات
    validation = []          // تحديد أنواع الملفات المسموح بها
}) => {

    // إرجاع وسيط يعمل أثناء استقبال الطلب
    return (req, res, next) => {

        // تشغيل Multer لاستقبال الملفات وتجهيز بيانات الطلب
        multerMiddleware(req, res, async (error) => {

            // إذا حدث خطأ أثناء استقبال الملفات، مرره لمعالج الأخطاء
            if (error) {
                next(new Error(error.message, {
                    cause: { status: 400 }
                }))
                return;
            }

            // التحقق من وجود الملفات إذا كان رفعها إجباريًا
            // ملاحظة: الشرط الأصلي هنا يحتاج تعديلًا لضمان صحة التحقق
            if (
                isRequired &&
                (!req.file && !(Array.isArray(req.files) && !req.files.length)) &&
                !(typeof req.files == "object" && Object.keys(req.files)?.length)
            ) {

                // إرجاع خطأ إذا لم يتم إرسال الملف المطلوب
                next(BadRequestException("File is required"))
                return;
            }

            try {

                // فحص الملفات وتحديد أنواعها وحفظها في المجلد المحدد
                await processMulterUpload({
                    customPath,
                    validation,
                    req
                })

                // الانتقال إلى الوسيط التالي بعد نجاح المعالجة
                next()

            } catch (error) {

                // تمرير أخطاء فحص الملفات أو حفظها إلى معالج الأخطاء
                next(new Error(error.message, {
                    cause: { status: 400 }
                }))
            }
        })
    }
}
