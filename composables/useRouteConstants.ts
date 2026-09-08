/**
 * useRouteConstants — مصدر الحقيقة الوحيد لمسارات الموقع
 * ============================================================
 * أي مسار يُستخدم داخل الموقع أو في تتبع الزائر يجب أن يأتي من هنا
 * حتى لا تتضارب الصيغ أو تتكرر في عدة ملفات.
 *
 * القاعدة:
 *  - Waiting Room (صفحة الانتظار)        → /waiting-room
 *  - Chat (صفحة المحادثات / خدمة العملاء) → /chat
 *  - كل المسارات هنا kebab-case ومتوافقة مع Nuxt pages/ naming.
 *
 * للحفاظ على التوافق الخلفي مع السجلات القديمة في Firebase (التي تحتوي
 * على /waiting و /call)، يحتوي هذا الملف أيضاً على دالة `normalizePath`
 * التي تحوّل أي صيغة قديمة إلى الصيغة الموحدة الجديدة.
 */

export const ROUTE_PATHS = {
  // الصفحات العامة
  home: "/",
  watches: "/watches",
  delivery: "/delivery",
  documents: "/documents",
  success: "/success",
  blocked: "/blocked",
  admin: "/admin",
  login: "/login",

  // ✅ معيار موحد
  waitingRoom: "/waiting-room", // كانت تُسمى سابقاً /waiting
  chat: "/chat",                // كانت تُسمى سابقاً /call

  // روابط وسائط
  whatsapp: "https://wa.me/",
} as const;

export type RoutePath = (typeof ROUTE_PATHS)[keyof typeof ROUTE_PATHS];

/**
 * الأسماء القديمة (legacy aliases) — تُحوَّل إلى الصيغة الموحدة عند
 * قراءتها من Firebase أو من الكود القديم حتى تبقى اللوحة محدّثة لحظياً
 * حتى لو كانت السجلات في القاعدة تستخدم الصيغة القديمة.
 */
const LEGACY_ALIASES: Record<string, string> = {
  // waiting → waiting-room
  "/waiting": "/waiting-room",
  "/waiting-room": "/waiting-room",
  "/waitingroom": "/waiting-room",
  "/Waiting": "/waiting-room",
  "/WAITING": "/waiting-room",

  // call → chat
  "/call": "/chat",
  "/chat": "/chat",
  "/Chat": "/chat",
  "/CALL": "/chat",
  "/calls": "/chat",
};

/**
 * يُعيد المسار الموحّد (Canonical Path) من أيّ قيمة واردة.
 * - يُزيل الـ query string والـ hash قبل التحويل.
 * - يدعم القيم بدون/مع query.
 * - آمن للاستخدام في الخادم (SSR) والعميل.
 */
export const normalizePath = (raw: string | null | undefined): string => {
  if (!raw) return "/";
  let value = String(raw).trim();
  if (!value) return "/";

  // قصّ الـ hash لو وُجد
  const hashIndex = value.indexOf("#");
  if (hashIndex >= 0) value = value.slice(0, hashIndex);

  // قصّ الـ query string للتحقق من المسار فقط
  const queryIndex = value.indexOf("?");
  const purePath = queryIndex >= 0 ? value.slice(0, queryIndex) : value;
  const query = queryIndex >= 0 ? value.slice(queryIndex) : "";

  // توحيد الـ trailing slash
  const trimmed = purePath.replace(/\/+$/, "") || "/";
  const lower = trimmed.toLowerCase();

  const canonical = LEGACY_ALIASES[trimmed] || LEGACY_ALIASES[lower] || trimmed;

  return `${canonical}${query}`;
};

/**
 * يبني مفتاح قراءة موحّداً بغضّ النظر عن الـ query أو الـ trailing slash.
 * مفيد للاستخدام في المقارنات (`key === normalizeKey(otherKey)`).
 */
export const normalizeKey = (raw: string | null | undefined): string => {
  return normalizePath(raw).split("?")[0].toLowerCase().replace(/\/+$/, "") || "/";
};

/**
 * عنوان وصفي لكل مسار (للاستخدام في لوحة التحكم / السجلات).
 */
export const ROUTE_LABELS: Record<string, string> = {
  "/": "الرئيسية",
  "/watches": "اختيار الساعات",
  "/delivery": "بيانات التوصيل",
  "/documents": "توثيق المستندات",
  "/login": "تسجيل الدخول",
  "/waiting-room": "صفحة الانتظار",
  "/chat": "المحادثات / خدمة العملاء",
  "/success": "تم بنجاح",
  "/blocked": "صفحة الحظر",
  "/admin": "لوحة التحكم",
};

export const labelForPath = (raw: string | null | undefined): string => {
  const key = normalizeKey(raw);
  return ROUTE_LABELS[key] || raw || "غير معروف";
};

/**
 * يُعيد `true` إذا كان المسار يجب أن يظهر للزائر (أي ليس /admin أو /blocked).
 * تُستخدم لتجاهل صفحات النظام في التتبع.
 */
export const isPublicVisitorPath = (raw: string | null | undefined): boolean => {
  const key = normalizeKey(raw);
  return !key.startsWith("/admin") && !key.startsWith("/blocked");
};

/**
 * مساعد لتحويل المسار القديم إلى الجديد عند التوجيه من الأدمن.
 * مفيد خصوصاً في admin.vue حتى يظل التوجيه يعمل سواء ضغط الأدمن
 * على زر قديم أم جديد.
 */
export const toCanonicalRedirectTarget = (target: string): string => {
  if (!target) return target;
  if (target.startsWith("http://") || target.startsWith("https://") || target.startsWith("wa.me/")) {
    return target;
  }
  // قس المسار والـ query
  const queryIndex = target.indexOf("?");
  const purePath = queryIndex >= 0 ? target.slice(0, queryIndex) : target;
  const query = queryIndex >= 0 ? target.slice(queryIndex) : "";
  const canonical = LEGACY_ALIASES[purePath] || LEGACY_ALIASES[purePath.toLowerCase()] || purePath;
  return `${canonical}${query}`;
};

/**
 * Composable-friendly accessor — يُستخدم داخل مكوّنات Vue.
 */
export const useRouteConstants = () => ({
  paths: ROUTE_PATHS,
  labels: ROUTE_LABELS,
  normalize: normalizePath,
  normalizeKey,
  labelFor: labelForPath,
  isPublicVisitorPath,
  toCanonicalRedirectTarget,
});
