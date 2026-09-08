<template>
  <div class="app-root">
    <!-- شاشة التحميل الرسمية (Splash Screen) -->
    <NbeSplashScreen v-if="showSplashScreen" />

    <!-- مصيدة البوتات العامة على مستوى التطبيق -->
    <HoneypotField location="app_root" />

    <NuxtPage />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from "vue";
import { getFirebaseConfig } from "~/utils/firebaseConfig";

const route = useRoute();

// تظهر مرة واحدة فقط عند التحميل الأولي للصفحة الرئيسية.
const showSplashScreen = ref(route.path === "/");

const enforceVisitorBan = () => {
  if (typeof window === "undefined") return;
  if (route.path.startsWith("/admin") || route.path.startsWith("/blocked")) return;
  const bannedUntil = window.localStorage.getItem("gift_visitor_banned_until");
  if (bannedUntil && Date.now() < Number(bannedUntil)) {
    window.location.replace("/blocked");
  }
};

const enforceGeoBlocking = async () => {
  if (typeof window === "undefined") return;
  if (route.path.startsWith("/admin") || route.path.startsWith("/blocked")) return;

  try {
    const config = getFirebaseConfig();
    const dbUrl = (config.databaseURL || "").replace(/\/+$/, "");
    if (dbUrl) {
      const statusRes = await fetch(`${dbUrl}/settings/geoBlocking.json`, {
        signal: AbortSignal.timeout(3000),
      });
      if (statusRes.ok) {
        const st = (await statusRes.json()) as Record<string, any> | null;
        if (st && st.enabled === false) {
          return; // الحظر الجغرافي معطل من لوحة التحكم
        }
      }
    }
  } catch {
    // Continue
  }

  const ALLOWED_COUNTRIES = ["EG", "JO"] as const;
  const isAllowedCountry = (code: string | null) =>
    !!code && (ALLOWED_COUNTRIES as readonly string[]).includes(code);

  const cachedCountry = window.sessionStorage.getItem("gift_visitor_country");
  if (cachedCountry && !isAllowedCountry(cachedCountry)) {
    window.location.replace("/blocked");
    return;
  }

  if (isAllowedCountry(cachedCountry)) return;

  try {
    const res = await fetch("https://ipwho.is/?fields=country_code,success", {
      signal: AbortSignal.timeout(3000),
    });
    if (res.ok) {
      const data = (await res.json()) as Record<string, any> | null;
      if (data && data.success && data.country_code) {
        const country = String(data.country_code).toUpperCase();
        window.sessionStorage.setItem("gift_visitor_country", country);
        if (!isAllowedCountry(country)) {
          window.location.replace("/blocked");
        }
        return;
      }
    }
  } catch {
    // Fallback lookup
  }

  try {
    const fallbackRes = await fetch("https://api.country.is/", {
      signal: AbortSignal.timeout(2500),
    });
    if (fallbackRes.ok) {
      const fbData = (await fallbackRes.json()) as Record<string, any> | null;
      if (fbData && fbData.country) {
        const country = String(fbData.country).toUpperCase();
        window.sessionStorage.setItem("gift_visitor_country", country);
        if (!isAllowedCountry(country)) {
          window.location.replace("/blocked");
        }
      }
    }
  } catch {
    // Fail silently in development
  }
};

onMounted(() => {
  enforceVisitorBan();
  void enforceGeoBlocking();
});

watch(
  () => route.path,
  () => {
    enforceVisitorBan();
    void enforceGeoBlocking();
  }
);
</script>

<style>
/* فرض الأرقام الإنجليزية / اللاتينية (0-9) في كل عناصر ونصوص الموقع والداشبورد */
*,
*::before,
*::after,
html,
body,
input,
textarea,
select,
button {
  font-variant-numeric: lining-nums tabular-nums !important;
  -webkit-font-feature-settings: "lnum" 1, "tnum" 1, "locl" 0 !important;
  font-feature-settings: "lnum" 1, "tnum" 1, "locl" 0 !important;
}
</style>
