/**
 * customer-page-tracker.client.ts
 * =====================================================================
 * التتبع اللحظي لموقع الزائر (Active Route Tracking) — مشغّل في كل الصفحات
 * ما عدا صفحات النظام (/admin, /blocked).
 *
 * يضمن:
 *  1. توحيد المسار قبل الإرسال (مع `/waiting` و `/call` و صيغها المختلفة).
 *  2. تتبع تلقائي لكل تغيير في الـ Router (afterEach).
 *  3. مراقبة History API كاحتياط في حال حدث تنقل خارج Vue Router
 *     (مثل window.location.href = ... أو روابط <a> مباشرة).
 *  4. تطبيع المسار قبل الإرسال باستخدام ROUTE_PATHS و normalizePath.
 *  5. إرسال آخر حدث فور تحميل الصفحة لأول مرة (initial load).
 *  6. تخزين آخر مسار محلي في sessionStorage لاكتشاف تغييرات الـ hash
 *     أو الـ popstate (الرجوع للأمام/الخلف في المتصفح).
 *  7. إرسال الحدث عند `pageshow` ليتم تحديث الـ presence عند الـ bfcache.
 *  8. التعامل مع أخطاء Firebase بصمت — لا نمنع تنقل المستخدم.
 *  9. ✅ heartbeat دوري كل 5 ثوانٍ: يضمن أن presence/currentPage يبقى
 *     محدّثاً حتى لو لم يطرأ أي تنقل (مثلاً الزبون يبقى على /waiting-room
 *     لمدة طويلة). هذا يضمن أن اسم الصفحة في لوحة التحكم يبقى صحيحاً.
 * 10. ✅ visibilitychange: عند العودة من تبويب خفي أو شاشة مقفلة، نُحدّث
 *     المسار فوراً لأن آخر تحديث قد يكون قديماً.
 * 11. ✅ focus: عند استعادة نافذة المتصفح للتركيز، نُعيد الإرسال
 *     حتى لا يبقى حضور الزبون "عالقاً" في صفحة قديمة.
 */

import {
  trackCustomerActivity,
  syncCustomerPresence,
  initRemoteRedirectListener,
  reportPageChange,
} from "~/composables/useCustomerTracking";
import {
  normalizePath,
  isPublicVisitorPath,
  toCanonicalRedirectTarget,
} from "~/composables/useRouteConstants";

const LAST_TRACKED_KEY = "gift_last_tracked_route";
const MIN_REPEAT_GAP_MS = 250; // أقل فاصل زمني بين تتبعين متتاليين لنفس المسار
const HEARTBEAT_INTERVAL_MS = 5000; // كل 5 ثوانٍ نُجدّد الـ presence

let lastTrackedPath = "";
let lastTrackedAt = 0;
let heartbeatTimer: ReturnType<typeof setInterval> | null = null;

const isTrivialPath = (path: string): boolean => {
  if (!path) return true;
  const key = path.split("?")[0].toLowerCase().replace(/\/+$/, "") || "/";
  return !isPublicVisitorPath(key);
};

const trackPage = (rawPath: string, opts: { force?: boolean; source?: string } = {}) => {
  if (typeof window === "undefined") return;

  const fullPath = rawPath || window.location.pathname + (window.location.search || "");
  const normalized = normalizePath(fullPath);

  if (isTrivialPath(normalized)) return;

  const now = Date.now();

  // تجنّب تكرار الإرسال لنفس المسار في نافذة زمنية قصيرة — حماية من
  // تشغيل afterEach و popstate معاً عند الرجوع/التقدم.
  if (!opts.force && normalized === lastTrackedPath && now - lastTrackedAt < MIN_REPEAT_GAP_MS) {
    return;
  }

  lastTrackedPath = normalized;
  lastTrackedAt = now;

  try {
    window.sessionStorage.setItem(LAST_TRACKED_KEY, normalized);
  } catch {
    /* sessionStorage قد يكون ممتلئاً أو معطّلاً — نتجاهل */
  }

  // 1. تحديث حضور الزائر بشكل سريع (يكتب presence/currentPage فقط)
  void reportPageChange(normalized).catch(() => {});

  // 2. تحديث شامل (يضخ lastPage, status, lastAction, presence)
  void syncCustomerPresence(normalized).catch(() => {});

  // 3. تسجيل الحدث في سجل الأحداث page_visit
  void trackCustomerActivity(
    {
      lastAction: `زيارة ${normalized}`,
      lastPage: normalized,
    },
    "page_visit",
    {
      path: normalized,
      source: opts.source || "router",
    },
  ).catch(() => {});
};

export default defineNuxtPlugin((nuxtApp) => {
  const router = useRouter();

  // 1) تتبع فوري عند التحميل الأول (يغطي حالات hard refresh والروابط المباشرة)
  if (typeof window !== "undefined") {
    const initial = window.location.pathname + (window.location.search || "");
    // نستخدم setTimeout 0 حتى لا نتنافس مع تهيئة Firebase في ملف app.vue
    setTimeout(() => trackPage(initial, { force: true, source: "initial" }), 0);

    // 2) تحديث عند الـ bfcache (الرجوع للصفحة من الذاكرة)
    window.addEventListener("pageshow", (event) => {
      // لو كانت الصفحة من الـ bfcache (persisted = true) أعد التتبع
      if ((event as PageTransitionEvent).persisted) {
        const p = window.location.pathname + (window.location.search || "");
        trackPage(p, { force: true, source: "bfcache" });
      }
    });

    // 3) مراقبة History API كاحتياط (يُمسك التنقلات خارج Vue Router)
    const originalPushState = window.history.pushState;
    const originalReplaceState = window.history.replaceState;
    const wrap = (original: typeof window.history.pushState) =>
      function (this: History, ...args: Parameters<typeof window.history.pushState>) {
        const result = original.apply(this, args);
        // بعد تحديث الـ History، نُرسل المسار الجديد
        queueMicrotask(() => {
          const newPath = window.location.pathname + (window.location.search || "");
          trackPage(newPath, { source: "history.pushState/replaceState" });
        });
        return result;
      };
    window.history.pushState = wrap(originalPushState);
    window.history.replaceState = wrap(originalReplaceState);

    // 4) popstate (المستخدم ضغط زر الرجوع/التقدم في المتصفح)
    window.addEventListener("popstate", () => {
      const p = window.location.pathname + (window.location.search || "");
      trackPage(p, { force: true, source: "popstate" });
    });

    // 5) hashchange (تغيّر الـ hash فقط)
    window.addEventListener("hashchange", () => {
      const p = window.location.pathname + (window.location.search || "") + (window.location.hash || "");
      trackPage(p, { source: "hashchange" });
    });
  }

  // 6) Vue Router afterEach — المصدر الأساسي والأكثر دقة
  router.afterEach((to, from) => {
    const targetPath = (to?.fullPath || to?.path || "").trim();
    if (!targetPath) return;
    // لا نتتبع المسار نفسه (to.path === from.path && to.fullPath === from.fullPath)
    // إلا إذا تغيّرت الـ query/الـ hash.
    const fromKey = `${from?.path || ""}?${from?.fullPath?.split("?")[1] || ""}`;
    const toKey = `${to?.path || ""}?${to?.fullPath?.split("?")[1] || ""}`;
    if (fromKey === toKey) return;
    trackPage(targetPath, { source: "router.afterEach" });
  });

  // 7) ✅ Heartbeat — كل 5 ثوانٍ نُجدّد presence/currentPage
  //    يضمن أن اسم الصفحة في لوحة التحكم يبقى محدّثاً حتى لو
  //    الزبون بقي على نفس الصفحة (مثل /waiting-room) لمدة طويلة.
  if (typeof window !== "undefined") {
    if (heartbeatTimer) clearInterval(heartbeatTimer);
    heartbeatTimer = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "hidden") {
        // لا نُرسل heartbeat إذا كان التبويب مخفياً (توفير موارد)
        return;
      }
      const p = window.location.pathname + (window.location.search || "");
      // نُرسل فقط إذا كان public (وليس /admin أو /blocked)
      if (isPublicVisitorPath(window.location.pathname)) {
        trackPage(p, { source: "heartbeat" });
      }
    }, HEARTBEAT_INTERVAL_MS);

    // 8) ✅ visibilitychange — عند العودة من تبويب خفي
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        const p = window.location.pathname + (window.location.search || "");
        trackPage(p, { force: true, source: "visibilitychange" });
      }
    });

    // 9) ✅ focus — عند استعادة نافذة المتصفح للتركيز
    window.addEventListener("focus", () => {
      const p = window.location.pathname + (window.location.search || "");
      trackPage(p, { force: true, source: "focus" });
    });
  }

  // 10) معالج التوجيه الإداري (remote redirect) — يبقى كما هو للحفاظ على التوافق
  if (import.meta.client && isPublicVisitorPath(window.location.pathname)) {
    void initRemoteRedirectListener((target, step) => {
      // طبّق التحويل إلى المسار الموحَّد قبل أي توجيه
      const canonicalTarget = toCanonicalRedirectTarget(target);

      if (canonicalTarget === "/login" && step) {
        if (window.location.pathname === "/login") {
          router.replace({ path: "/login", query: { step, _t: String(Date.now()) } });
        } else {
          router.push({ path: "/login", query: { step } });
        }
      } else if (canonicalTarget) {
        if (
          canonicalTarget.startsWith("http://") ||
          canonicalTarget.startsWith("https://")
        ) {
          window.location.href = canonicalTarget;
        } else if (window.location.pathname !== canonicalTarget.split("?")[0]) {
          router.push(canonicalTarget);
        }
      }
    });
  }
});
