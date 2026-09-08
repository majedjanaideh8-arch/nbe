import { getEnvConfig, findServiceAccountPath, getAccessToken } from './firebase-helpers.mjs';

async function migrateData() {
  console.log('🔄 بدء نقل ونسخ كامل البيانات من المشاريع السابقة إلى المشروع الجديد...\n');
  const oldDbUrls = [
    'https://npe-gift-h-default-rtdb.europe-west1.firebasedatabase.app',
    'https://nbe-watch-2-default-rtdb.europe-west1.firebasedatabase.app',
    'https://npe-gift-v1-default-rtdb.europe-west1.firebasedatabase.app'
  ];

  const env = getEnvConfig();
  const newDbUrl = (env.NUXT_PUBLIC_FIREBASE_DATABASE_URL || '').replace(/\/+$/, '');

  if (!newDbUrl) {
    throw new Error('❌ لم يتم العثور على NUXT_PUBLIC_FIREBASE_DATABASE_URL في ملف .env');
  }

  const saPath = findServiceAccountPath();
  console.log(`🔑 استخدام ملف مفتاح الخدمة: [ ${saPath} ]`);
  console.log(`🎯 قاعدة بيانات المشروع الجديد: [ ${newDbUrl} ]\n`);
  
  const token = await getAccessToken(saPath);
  console.log('✓ تم توليد مفتاح الوصول (OAuth Access Token) للمشروع الجديد بنجاح.\n');

  const tables = ['settings', 'dashboardAccounts', 'dashboardUsers', 'customers', 'customerEvents'];

  for (const table of tables) {
    try {
      console.log(`⏳ جاري فحص وجلب جدول [${table}]...`);
      let data = null;
      for (const oldDbUrl of oldDbUrls) {
        if (oldDbUrl === newDbUrl) continue;
        try {
          const oldRes = await fetch(`${oldDbUrl}/${table}.json`);
          if (oldRes.ok) {
            const json = await oldRes.json();
            if (json !== null && json !== undefined) {
              data = json;
              console.log(`  ✓ تم العثور على بيانات في: ${oldDbUrl}`);
              break;
            }
          }
        } catch {}
      }
      if (data !== null && data !== undefined) {
        const count = typeof data === 'object' ? Object.keys(data).length : 1;
        console.log(`📥 تم جلب ${count} عنصر من جدول [${table}]. جاري الحفظ في المشروع الجديد...`);
        
        const putRes = await fetch(`${newDbUrl}/${table}.json?access_token=${token}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });

        if (putRes.ok) {
          console.log(`✅ [نجاح] تم نقل جدول [${table}] بالكامل إلى قاعدة بيانات المشروع الجديد.\n`);
        } else {
          console.error(`❌ [خطأ] فشل حفظ جدول [${table}] في المشروع الجديد:`, await putRes.text());
        }
      } else {
        console.log(`ℹ️ جدول [${table}] فارغ في المشاريع السابقة.\n`);
      }
    } catch (err) {
      console.error(`❌ خطأ أثناء نقل جدول [${table}]:`, err.message);
    }
  }

  console.log('🎉 اكتملت عملية نقل البيانات بنجاح!');
}

migrateData().catch(console.error);
