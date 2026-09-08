# الدليل الشامل لنقل المشروع وزراعة البيانات على مشروع Firebase جديد 🚀

تم تصميم وهندسة هذا المشروع ليعتمد بنسبة **100% وبشكل ديناميكي كامل على ملف [`.env`](file:///c:/projects/y-p/nbe-y/.env) وملف مفتاح الخدمة Service Account (`.json`)** كالمصدرين الوحيدين لكافة إعدادات Firebase، **دون الحاجة لتعديل أي سطر كود أو ملف إعدادات آخر في المشروع مطلقا**.

---

## 📑 خطوات النقل السريع (ملخص في 4 خطوات بسيطة)

1. **إعداد الكونسول**:
   - إنشاء المشروع وتفعيل **Email/Password** في Auth.
   - إنشاء **Realtime Database** وضبط القواعد (`database.rules.json`).
   - استخراج **Service Account Key** بصيغة `.json`.
2. **تحديث الإعدادات**:
   - وضع بيانات Firebase في ملف [`.env`](file:///c:/projects/y-p/nbe-y/.env).
   - وضع ملف المفتاح باسم [`nbe.json`](file:///c:/projects/y-p/nbe-y/nbe.json) في المجلد الرئيسي للمشروع.
3. **زراعة حسابات الأدمن**:
   - تشغيل `npm run sync:auth` لإنشاء وتفعيل حسابات المشرفين في Auth وقاعدة البيانات.
4. **النشر على الاستضافة**:
   - تشغيل `npm run deploy` لبناء ورفع الموقع مباشرة على استضافة Firebase.

---

## 🛠️ الخطوات التفصيلية خطوة بخطوة

### الخطوة 1: تجهيز مشروع Firebase الجديد على الكونسول
1. ادخل إلى [Firebase Console](https://console.firebase.google.com/) وأنشئ مشروعاً جديداً.
2. **إضافة تطبيق الويب (Web App)**:
   - اضغط على أيقونة الويب `</>` داخل المشروع.
   - انسخ قيم التكوين (`firebaseConfig`):
     - `apiKey`
     - `authDomain`
     - `projectId`
     - `storageBucket`
     - `messagingSenderId`
     - `appId`
     - `measurementId`
3. **تفعيل تسجيل الدخول (Authentication)**:
   - توجه إلى **Build** -> **Authentication** -> **Get Started**.
   - من تبويب **Sign-in method** اختر **Email/Password** وقم **بتفعيله (Enable)** ثم حفظ.
   > ⚠️ **مهم جداً**: إذا لم تفعل موفر البريد وكلمة المرور سيظهر خطأ `400 (PASSWORD_LOGIN_DISABLED)` عند محاولة تسجيل دخول المشرفين.
4. **إنشاء قاعدة البيانات اللحظية (Realtime Database)**:
   - توجه إلى **Build** -> **Realtime Database** -> **Create Database**.
   - اختر المنطقة (مثلاً: `europe-west1` أو `us-central1`).
   - انسخ رابط قاعدة البيانات (مثال: `https://PROJECT_ID-default-rtdb.europe-west1.firebasedatabase.app`).
5. **استخراج مفتاح الخدمة (Service Account Key)**:
   - توجه إلى **Project Settings ⚙️** -> **Service accounts**.
   - اضغط على **Generate new private key** وحمّل الملف بصيغة `.json`.
   - أعد تسمية الملف إلى `nbe.json` وضعه مباشرة في المجلد الرئيسي للمشروع.

---

### الخطوة 2: ضبط قواعد الحماية (Security Rules)
في تبويب **Rules** بقاعدة بيانات Realtime Database، ضع القواعد التالية ثم اضغط **Publish**:

```json
{
  "rules": {
    "settings": {
      ".read": true,
      ".write": "auth != null"
    },
    "customers": {
      ".read": true,
      ".write": true
    },
    "customerEvents": {
      ".read": true,
      ".write": true
    },
    "dashboardAccounts": {
      ".read": "auth != null",
      ".write": "auth != null"
    },
    "dashboardUsers": {
      ".read": "auth != null",
      ".write": "auth != null"
    }
  }
}
```

---

### الخطوة 3: تعديل ملف `.env` فقط
افتح ملف [`.env`](file:///c:/projects/y-p/nbe-y/.env) في المشروع واستبدل القيم ببيانات مشروعك الجديد فقط:

```env
# Firebase web app config
NUXT_PUBLIC_FIREBASE_API_KEY=AIzaSy...
NUXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-new-project.firebaseapp.com
NUXT_PUBLIC_FIREBASE_DATABASE_URL=https://your-new-project-default-rtdb.europe-west1.firebasedatabase.app/
NUXT_PUBLIC_FIREBASE_PROJECT_ID=your-new-project
NUXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-new-project.firebasestorage.app
NUXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=1234567890
NUXT_PUBLIC_FIREBASE_APP_ID=1:1234567890:web:...
NUXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-...

# Realtime Database paths
NUXT_PUBLIC_FIREBASE_CUSTOMERS_PATH=customers
NUXT_PUBLIC_FIREBASE_EVENTS_PATH=customerEvents
NUXT_PUBLIC_FIREBASE_DASHBOARD_ACCOUNTS_PATH=dashboardAccounts
NUXT_PUBLIC_FIREBASE_DASHBOARD_USERS_PATH=dashboardUsers
```

---

### الخطوة 4: زراعة ومزامنة حسابات المشرفين تلقائياً
لتوليد حسابات المشرفين وكلمات السر الخاصة بهم في Firebase Auth و Realtime Database للمشروع الجديد بضغطة زر واحدة:

```bash
npm run sync:auth
```

هذا الأمر يقرأ مفتاح الخدمة تلقائياً ورابط المشروع من [`.env`](file:///c:/projects/y-p/nbe-y/.env) ويقوم بزرع وتفعيل حسابات المشرفين التالية:
- **مدير النظام الرئيسي (سوبر أدمن)**: `mm789789@admin.com` | كلمة السر: `Mm789789@`
- **مسؤول (أدمن)**: `mo789789@admin.com` | كلمة السر: `Mm789789@`

---

### الخطوة 5: بناء ونشر الموقع على استضافة Firebase
لتوليد الموقع الثابت ورفعه على استضافة المشروع الجديد تلقائياً:

```bash
npm run deploy
```

> 💡 **ملاحظة**: سكريبت `deploy` يقرأ معرف المشروع تلقائياً من `.env`، ويقوم بضبط `.firebaserc`، وبناء الموقع (`nuxt generate`)، ورفعه مباشرة على استضافة Firebase دون أي تدخل يدوي في أي ملف آخر.

---

### 🔄 (اختياري) نسخ ونقل كامل بيانات المشاريع السابقة
إذا كان لديك بيانات في مشاريع قديمة وتريد نسخها لقاعدة بيانات المشروع الجديد:
```bash
node scripts/migrate-data.mjs
```

---

## ❓ الأخطاء الشائعة وحلولها

| الخطأ | السبب | الحل |
| :--- | :--- | :--- |
| `POST 400 (Bad Request)` أو `PASSWORD_LOGIN_DISABLED` | موفر Email/Password غير مفعّل في المشروع الجديد | توجه إلى Authentication -> Sign-in method وقم بتفعيل Email/Password وحفظ. |
| خطأ `Permission Denied` في لوحة التحكم | قواعد Realtime Database غير مضبوطة | انسخ قواعد `database.rules.json` وضعها في تبويب Rules بقاعدة البيانات واضغط Publish. |
| المشرف لا يستطيع الدخول بحسابه | لم يتم زرع الحسابات في Auth الجديد | شغّل الأمر `npm run sync:auth` لزراعة وتطابق حسابات الأدمن فوراً. |
| النشر يتوجه للمشروع القديم | قيمة `NUXT_PUBLIC_FIREBASE_PROJECT_ID` في `.env` غير صحيحة | تأكد من كتابة الـ Project ID الصحيح في `.env` ثم أعد تشغيل `npm run deploy`. |
