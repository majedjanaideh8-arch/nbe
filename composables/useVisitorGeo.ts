/**
 * useVisitorGeo
 * --------------------------------------------------------------------
 * يجلب بيانات الموقع الجغرافي للزائر (الدولة / المنطقة / المدينة / الـ IP)
 * من خلال واجهة ipwho.is المجانية مع كاش طويل في localStorage حتى لا
 * نستهلك رصيد الـ API في كل تحديث للصفحة.
 *
 * تُحفظ البيانات داخل سجل العميل في Firebase عند أول تواصل حتى تظهر
 * على لوحة التحكم (دولة الزائر + اسم المنطقة) بشكل فوري ولحظي.
 */

export type VisitorGeo = {
  ip?: string;
  country?: string;     // مثال: "Jordan"
  countryCode?: string; // مثال: "JO" — يُستخدم لتوليد علم الدولة (إيموجي)
  region?: string;      // مثال: "Amman Governorate"
  city?: string;        // مثال: "Amman"
  timezone?: string;    // مثال: "Asia/Amman"
  capturedAt?: string;  // ISO timestamp لآخر جلب
  source?: "ipwho" | "cache";
};

const GEO_CACHE_KEY = "gift_visitor_geo_v1";
// تجديد الكاش بعد 6 ساعات — يكفي للوحة تحكم لحظية دون إغراق الـ API
const GEO_CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const isBrowser = () => typeof window !== "undefined";

const readCache = (): VisitorGeo | null => {
  if (!isBrowser()) return null;
  try {
    const raw = window.localStorage.getItem(GEO_CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as VisitorGeo;
    if (!parsed || typeof parsed !== "object") return null;
    if (!parsed.capturedAt) return parsed;
    if (Date.now() - new Date(parsed.capturedAt).getTime() > GEO_CACHE_TTL_MS) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
};

const writeCache = (data: VisitorGeo) => {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(GEO_CACHE_KEY, JSON.stringify(data));
  } catch {
    /* localStorage ممتلئ أو معطّل — نتجاهل */
  }
};

const fetchFromIpWho = async (): Promise<VisitorGeo | null> => {
  if (!isBrowser()) return null;
  try {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 5000);
    const res = await fetch("https://ipwho.is/", {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    window.clearTimeout(timeout);
    if (!res.ok) return null;
    const json = await res.json();
    if (!json || json.success === false) return null;
    return {
      ip: json.ip,
      country: json.country,
      countryCode: json.country_code,
      region: json.region,
      city: json.city,
      timezone: json.timezone?.id,
      capturedAt: new Date().toISOString(),
      source: "ipwho",
    };
  } catch {
    return null;
  }
};

let inflight: Promise<VisitorGeo | null> | null = null;

/**
 * ضمان عدم تكرار الطلبات — إن كان هناك طلب جارٍ نعيد نفس الـ Promise.
 * هذا يحمي رصيد ipwho.is (1000 طلب/يوم في الخطة المجانية).
 */
export const ensureVisitorGeo = (): Promise<VisitorGeo | null> => {
  if (!isBrowser()) return Promise.resolve(null);

  const cached = readCache();
  if (cached && cached.country) return Promise.resolve(cached);

  if (inflight) return inflight;

  inflight = (async () => {
    const fresh = await fetchFromIpWho();
    if (fresh && fresh.country) {
      writeCache(fresh);
      return fresh;
    }
    // حتى لو فشل الطلب نخزّن علامة فارغة لفترة قصيرة كي لا نحاول كل ثانية
    writeCache({ capturedAt: new Date().toISOString(), source: "ipwho" });
    return readCache();
  })().finally(() => {
    inflight = null;
  });

  return inflight;
};

export const getVisitorGeoSync = (): VisitorGeo | null => {
  return readCache();
};

/**
 * تحويل كود الدولة (مثال: "JO") إلى علم Emoji (🇯🇴).
 * يستخدم الـ Regional Indicator Symbols وفق ترميز Unicode.
 */
export const countryCodeToFlag = (code?: string): string => {
  if (!code || typeof code !== "string") return "🌍";
  const trimmed = code.trim().toUpperCase();
  if (trimmed.length !== 2) return "🌍";
  const A = 0x1f1e6;
  const codeA = "A".charCodeAt(0);
  const first = trimmed.charCodeAt(0) - codeA + A;
  const second = trimmed.charCodeAt(1) - codeA + A;
  try {
    return String.fromCodePoint(first) + String.fromCodePoint(second);
  } catch {
    return "🌍";
  }
};

export const useVisitorGeo = () => {
  return {
    ensureVisitorGeo,
    getVisitorGeoSync,
    countryCodeToFlag,
  };
};
