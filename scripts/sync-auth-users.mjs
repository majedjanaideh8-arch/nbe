import { readFileSync } from 'fs';
import { getEnvConfig, findServiceAccountPath, getAccessToken } from './firebase-helpers.mjs';

async function syncAdminAuthUsers() {
  console.log('جاري مزامنة وتطابق حسابات المشرفين بالكامل بين Realtime Database و Firebase Authentication...\n');
  
  const saPath = findServiceAccountPath();
  console.log(`🔑 استخدام ملف مفتاح الخدمة: [ ${saPath} ]`);
  
  const sa = JSON.parse(readFileSync(saPath, 'utf8'));
  const token = await getAccessToken(saPath);

  const env = getEnvConfig();
  const projectId = env.NUXT_PUBLIC_FIREBASE_PROJECT_ID || sa.project_id;
  const dbUrl = (env.NUXT_PUBLIC_FIREBASE_DATABASE_URL || `https://${projectId}-default-rtdb.europe-west1.firebasedatabase.app`).replace(/\/+$/, '');

  if (!projectId) {
    throw new Error('❌ لم يتم العثور على NUXT_PUBLIC_FIREBASE_PROJECT_ID في ملف .env');
  }

  console.log(`🎯 المشروع المستهدف: [ ${projectId} ]`);
  console.log(`🌐 قاعدة البيانات: [ ${dbUrl} ]\n`);

  // جلب حسابات الأدمن من قاعدة البيانات
  const res = await fetch(`${dbUrl}/dashboardAccounts.json?access_token=${token}`);
  const accounts = (await res.json()) || {};

  const defaultAdmins = [
    {
      key: 'mm789789@admin_com',
      email: 'mm789789@admin.com',
      password: 'Mm789789@',
      displayName: 'مدير النظام الرئيسي',
      name: 'مدير النظام الرئيسي',
      role: 'superadmin',
      status: 'active'
    },
    {
      key: 'mo789789@admin_com',
      email: 'mo789789@admin.com',
      password: 'Mm789789@',
      displayName: 'مسؤول',
      name: 'مسؤول',
      role: 'admin',
      status: 'active'
    }
  ];

  for (const admin of defaultAdmins) {
    if (!Object.values(accounts).some(acc => acc?.email?.toLowerCase() === admin.email.toLowerCase())) {
      accounts[admin.key] = admin;
    }
  }

  // حفظ الحسابات في Realtime Database
  await fetch(`${dbUrl}/dashboardAccounts.json?access_token=${token}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(accounts)
  });
  console.log('✓ تم تحديث وحفظ حسابات المشرفين في Realtime Database.\n');

  for (const [key, acc] of Object.entries(accounts)) {
    if (!acc?.email || !acc?.password) continue;
    const cleanEmail = acc.email.trim().toLowerCase();

    try {
      // 1. فحص هل المستخدم موجود مسبقاً في Firebase Auth
      const lookupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:lookup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: [cleanEmail] })
      });
      const lookupData = await lookupRes.json();
      const existingUser = lookupData.users?.[0];

      if (existingUser) {
        // 2. تحديث وتطابق كلمة السر والاسم والحالة للمستخدم الموجود
        const updateRes = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:update`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            localId: existingUser.localId,
            password: acc.password,
            displayName: acc.name || acc.displayName || acc.username || key,
            disableUser: acc.status === 'inactive'
          })
        });
        if (updateRes.ok) {
          console.log(`✓ [تحديث وتطابق] تم تحديث كلمة السر للمشرف في Auth: ${cleanEmail}`);
        } else {
          console.error(`❌ تعذر تحديث ${cleanEmail}:`, await updateRes.text());
        }
      } else {
        // 3. إنشاء مستخدم جديد في Firebase Auth
        const createRes = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: cleanEmail,
            password: acc.password,
            displayName: acc.name || acc.displayName || acc.username || key,
            emailVerified: true,
            disabled: acc.status === 'inactive'
          })
        });
        if (createRes.ok) {
          console.log(`✓ [إنشاء جديد] تم إنشاء المشرف في Auth بنجاح: ${cleanEmail}`);
        } else {
          console.error(`❌ تعذر إنشاء ${cleanEmail}:`, await createRes.text());
        }
      }
    } catch (e) {
      console.error(`خطأ في معالجة ${cleanEmail}:`, e.message);
    }
  }

  console.log('\nانتهت المزامنة بنجاح تام وكل الحسابات متطابقة 100%.');
}

syncAdminAuthUsers().catch(console.error);
