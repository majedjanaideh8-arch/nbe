import type { Ref } from "vue";
import { getFirebaseConfig } from "~/utils/firebaseConfig";

type GeoBlockingState = {
  enabled: boolean;
  updatedAt?: number;
};

type UnauthorizedHandler = () => void | Promise<void>;
type IdTokenProvider = () => Promise<string | null>;

const getRtdbGeoUrl = () => {
  const config = getFirebaseConfig();
  const dbUrl = (config.databaseURL || "").replace(/\/+$/, "");
  return `${dbUrl}/settings/geoBlocking.json`;
};

export const useGeoBlocking = (
  adminAllowed: Ref<boolean>,
  getIdToken: IdTokenProvider,
  onUnauthorized?: UnauthorizedHandler
) => {
  const enabled = ref<boolean | null>(null);
  const loading = ref(false);
  const updating = ref(false);
  const error = ref("");

  const getGeoApiUrl = () => {
    if (!import.meta.client) return "https://gift-geo-block.onrender.com/admin/api/geo";
    return "https://gift-geo-block.onrender.com/admin/api/geo";
  };

  const load = async () => {
    if (!import.meta.client || !adminAllowed.value) return;
    loading.value = true;
    error.value = "";

    try {
      // 1. Try reading directly from Firebase RTDB (fastest & reliable)
      const rtdbGeoUrl = getRtdbGeoUrl();
      const rtdbRes = await fetch(rtdbGeoUrl, {
        cache: "no-store",
        signal: AbortSignal.timeout(3000),
      });
      if (rtdbRes.ok) {
        const data = (await rtdbRes.json()) as Partial<GeoBlockingState> | null;
        if (data && typeof data.enabled === "boolean") {
          enabled.value = data.enabled;
          loading.value = false;
          return;
        }
      }
    } catch {
      // Continue to Render fallback
    }

    try {
      // 2. Fallback to Render API
      const token = await getIdToken();
      if (!token) throw new Error("unauthorized");
      const url = getGeoApiUrl();
      const response = await fetch(url, {
        method: "GET",
        cache: "no-store",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(4000),
      });
      if (response.status === 401 || response.status === 403) {
        enabled.value = null;
        await onUnauthorized?.();
        throw new Error("unauthorized");
      }
      if (response.ok) {
        const state = (await response.json()) as Partial<GeoBlockingState>;
        if (typeof state.enabled === "boolean") {
          enabled.value = state.enabled;
          return;
        }
      }
      // Default to true if not yet configured
      enabled.value = true;
    } catch {
      if (enabled.value === null) {
        enabled.value = true;
      }
    } finally {
      loading.value = false;
    }
  };

  const toggle = async () => {
    if (!adminAllowed.value || loading.value || updating.value) return;
    const nextState = enabled.value === null ? false : !enabled.value;

    // Optimistic UI update
    enabled.value = nextState;
    updating.value = true;
    error.value = "";

    try {
      const token = await getIdToken().catch(() => null);

      // 1. Update Firebase RTDB directly (immediate & reliable)
      const rtdbGeoUrl = getRtdbGeoUrl();
      const rtdbAuthUrl = token ? `${rtdbGeoUrl}?auth=${encodeURIComponent(token)}` : rtdbGeoUrl;
      await fetch(rtdbAuthUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          enabled: nextState,
          updatedAt: Date.now(),
        }),
        signal: AbortSignal.timeout(3500),
      }).catch(async () => {
        // Fallback without auth param
        await fetch(rtdbGeoUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            enabled: nextState,
            updatedAt: Date.now(),
          }),
          signal: AbortSignal.timeout(3500),
        }).catch(() => {});
      });

      // 2. Sync to Render in background
      if (token) {
        const url = getGeoApiUrl();
        void fetch(url, {
          method: "POST",
          cache: "no-store",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ enabled: nextState }),
          signal: AbortSignal.timeout(4000),
        }).catch(() => {});
      }
    } catch {
      // Keep optimistic state
    } finally {
      updating.value = false;
    }
  };

  watch(
    adminAllowed,
    (allowed) => {
      if (allowed) void load();
      else {
        enabled.value = null;
        error.value = "";
      }
    },
    { immediate: true }
  );

  return { enabled, loading, updating, error, load, toggle };
};
