import { writeFileSync, existsSync } from "fs";
import { execSync } from "child_process";
import { getEnvConfig } from "./firebase-helpers.mjs";

// 1. قراءة معرف المشروع من ملف .env
const env = getEnvConfig();
const projectId = env.NUXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!projectId) {
  console.error("❌ خطأ: لم يتم العثور على NUXT_PUBLIC_FIREBASE_PROJECT_ID في ملف .env!");
  process.exit(1);
}

console.log(`\n🚀 بدء النشر على مشروع Firebase: [ ${projectId} ] (مأخوذ مباشرة وبشكل آلي من .env)\n`);

// 2. تحديث ملف .firebaserc تلقائياً
const firebaserc = {
  projects: {
    default: projectId,
  },
};
writeFileSync("./.firebaserc", JSON.stringify(firebaserc, null, 2) + "\n", "utf8");

// 3. بناء وتوليد الموقع الثابت
console.log("📦 جاري بناء الموقع الثابت (nuxt generate)...");
execSync("npx nuxt generate", { stdio: "inherit" });

// 4. النشر على استضافة Firebase
console.log(`\n☁️ جاري النشر على استضافة Firebase للمشروع (${projectId})...`);
execSync(`npx firebase deploy --only hosting --project ${projectId}`, { stdio: "inherit" });

console.log(`\n✨ تم النشر بنجاح على مشروع ${projectId}!\n`);
