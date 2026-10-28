
import { randomUUID } from 'node:crypto'
import { resolve } from "node:path"
import { mkdir, writeFile } from 'node:fs/promises'
import { fileTypeFromBuffer } from 'file-type'
import multer from 'multer'
import { BadRequestException } from "../../exceptions/error.exception.js"


// تحديد أنواع الملفات المسموح برفعها
export const fileValidation = {

    // أنواع الصور المسموح بها
    image: ['image/jpeg', 'image/png', 'image/gif'],

    // أنواع المستندات المسموح بها
    files: ["application/pdf", "application/json"]
}


// تجهيز استقبال الملفات وتحديد الحد الأقصى لحجمها
export const localFileUpload = ({ maxFileSize = 5 } = {}) => {

    // استقبال الملف في ذاكرة السيرفر بدلًا من حفظه مباشرة على الجهاز
    const storage = multer.memoryStorage()

    // إنشاء إعدادات استقبال الملفات وتحديد أقصى حجم بالبايت
    return multer({
        storage,
        limits: {
            fileSize: maxFileSize * 1024 * 1024
        }
    })
}


// فحص ملف واحد وحفظه على الجهاز
export const processFile = async ({
    customPath = "general",
    file,
    validation = []
}) => {

    // تحديد نوع الملف من محتواه الفعلي
    const result = await fileTypeFromBuffer(file.buffer)

    // رفض الملف إذا كان نوعه غير معروف أو غير مسموح به
    if (!result || !validation.includes(result.mime)) {
        throw BadRequestException("Invalid file formats")
    } else {

        // إنشاء مجلد الحفظ إذا لم يكن موجودًا بالفعل
        await mkdir(resolve(`./assets/${customPath}`), {
            recursive: true
        })

        // إنشاء مسار للملف باستخدام اسم فريد وامتداده الصحيح
        const uniqueFilePath =
            `assets/${customPath}/${randomUUID()}.${result.ext}`

        // حفظ بيانات الملف الموجودة في الذاكرة على الجهاز
        await writeFile(
            resolve(`./${uniqueFilePath}`),
            file.buffer
        )

        // إضافة مسار الملف الذي تم حفظه إلى بياناته
        file.finalPath = uniqueFilePath

        // إرجاع بيانات الملف بعد معالجته
        return file
    }
}





// معالجة مجموعة من الملفات وحفظها على الجهاز
export const processFiles = async ({
    customPath = "general",
    files = [],
    validation = []
}) => {

    // إنشاء مصفوفة لتجميع الملفات بعد معالجتها
    const assets = []

    // المرور على الملفات واحدًا واحدًا
    for (const file of files) {

        // فحص الملف الحالي وحفظه باستخدام دالة معالجة الملف الواحد
        const uploadFile = await processFile({
            customPath,
            file,
            validation
        })

        // إضافة الملف بعد معالجته إلى المصفوفة
        assets.push(uploadFile)
    }

    // إرجاع جميع الملفات بعد معالجتها
    return assets
}


// معالجة الملفات الموجودة داخل حقول مختلفة
export const processFields = async ({
    customPath,
    fields = {},
    validation = []
}) => {

    // إنشاء مصفوفة لتجميع نتائج الحقول
    const assets = []

    // المرور على أسماء الحقول الموجودة في البيانات
    for (const field of Object.keys(fields)) {

        // معالجة الملفات التابعة للحقل الحالي
        const files = await processFiles({
            customPath,
            files: fields[field],
            validation
        })

        // تجميع اسم الحقل والملفات التابعة له
        assets.push({
            field,
            files
        })
    }

    // إرجاع نتائج جميع الحقول بعد المعالجة
    return assets
}


// اختيار طريقة معالجة الملفات حسب شكل البيانات التي استقبلتها المكتبة
export const processMulterUpload = async ({
    req,
    customPath = "general",
    validation = []
}) => {

    // إذا كان الطلب يحتوي على ملف واحد
    if (req.file) {

        // فحص الملف وحفظه
        await processFile({
            customPath,
            file: req.file,
            validation
        })

    // إذا كانت الملفات موجودة داخل مصفوفة
    } else if (Array.isArray(req.files)) {

        // معالجة جميع الملفات الموجودة في المصفوفة
        await processFiles({
            customPath,
            files: req.files,
            validation
        })

    // إذا كانت الملفات موزعة على حقول مختلفة
    } else if (
        typeof req.files == "object" &&
        Object.keys(req.files)?.length
    ) {

        // معالجة الملفات الموجودة داخل كل حقل
        await processFields({
            customPath,
            fields: req.files,
            validation
        })
    }
}
