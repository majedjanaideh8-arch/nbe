import { ref, computed } from "vue";
import { getFirebaseConfig, getFirebasePaths } from "~/utils/firebaseConfig";

export type WhatsAppConfig = {
  number: string;
  url: string;
  updatedAt?: number;
};

const DEFAULT_WHATSAPP_URL = "https://wa.me/message/LALMISSWKJ2ND1";
const DEFAULT_WHATSAPP_NUMBER = "";

const getRtdbSettingsWhatsAppUrl = () => {
  const config = getFirebaseConfig();
  const dbUrl = (config.databaseURL || "").replace(/\/+$/, "");
  return `${dbUrl}/settings/whatsapp.json`;
};

// Shared reactive state across all component instances
const rawWhatsAppNumber = ref<string>(DEFAULT_WHATSAPP_NUMBER);
const rawWhatsAppUrl = ref<string>(DEFAULT_WHATSAPP_URL);
const isInitialized = ref(false);
const isLoading = ref(false);
const isUpdating = ref(false);
const errorMessage = ref("");

/**
 * Formats a phone number or URL to a valid WhatsApp wa.me link.
 * Handles formats like:
 * - "+972591234567" -> "https://wa.me/972591234567"
 * - "00972591234567" -> "https://wa.me/972591234567"
 * - "972 59-123-4567" -> "https://wa.me/972591234567"
 * - "https://wa.me/..." -> returns as is
 */
export const formatWhatsAppUrl = (input: string): string => {
  if (!input || !input.trim()) {
    return DEFAULT_WHATSAPP_URL;
  }

  const trimmed = input.trim();

  // If already a full URL
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }

  // Remove any spaces, dashes, brackets, plus signs
  let cleaned = trimmed.replace(/[\s\-()]/g, "");

  if (cleaned.startsWith("+")) {
    cleaned = cleaned.substring(1);
  } else if (cleaned.startsWith("00")) {
    cleaned = cleaned.substring(2);
  }

  // Extract only digits
  const digitsOnly = cleaned.replace(/\D/g, "");

  if (digitsOnly.length >= 7) {
    return `https://wa.me/${digitsOnly}`;
  }

  return DEFAULT_WHATSAPP_URL;
};

export const useWhatsAppSettings = () => {
  const whatsappNumber = computed(() => rawWhatsAppNumber.value);
  const whatsappUrl = computed(() => {
    if (rawWhatsAppUrl.value && rawWhatsAppUrl.value !== DEFAULT_WHATSAPP_URL) {
      return rawWhatsAppUrl.value;
    }
    if (rawWhatsAppNumber.value) {
      return formatWhatsAppUrl(rawWhatsAppNumber.value);
    }
    return DEFAULT_WHATSAPP_URL;
  });

  const loadSettings = async () => {
    if (!import.meta.client) return;
    isLoading.value = true;
    errorMessage.value = "";

    try {
      // 1. First attempt via Firebase RTDB direct fetch
      const rtdbWhatsAppUrl = getRtdbSettingsWhatsAppUrl();
      const res = await fetch(rtdbWhatsAppUrl, {
        cache: "no-store",
        signal: AbortSignal.timeout(3500),
      });

      if (res.ok) {
        const data = (await res.json()) as Partial<WhatsAppConfig> | string | null;
        if (data) {
          if (typeof data === "string") {
            rawWhatsAppNumber.value = data;
            rawWhatsAppUrl.value = formatWhatsAppUrl(data);
          } else if (typeof data === "object") {
            if (data.number) rawWhatsAppNumber.value = String(data.number);
            if (data.url) rawWhatsAppUrl.value = String(data.url);
            else if (data.number) rawWhatsAppUrl.value = formatWhatsAppUrl(data.number);
          }
          isInitialized.value = true;
          return;
        }
      }
    } catch (err) {
      // Ignore and continue
    } finally {
      isLoading.value = false;
    }

    // 2. Realtime listener via Firebase SDK if available
    try {
      const appModule = await import("firebase/app");
      const databaseModule = await import("firebase/database");
      const config = getFirebaseConfig();
      const app = appModule.getApps().length ? appModule.getApp() : appModule.initializeApp(config);
      const dbUrl = (config.databaseURL || "").replace(/\/+$/, "");
      const db = dbUrl ? databaseModule.getDatabase(app, dbUrl) : databaseModule.getDatabase(app);

      const whatsappRef = databaseModule.ref(db, "settings/whatsapp");
      databaseModule.onValue(whatsappRef, (snapshot) => {
        const val = snapshot.val() as Partial<WhatsAppConfig> | string | null;
        if (val) {
          if (typeof val === "string") {
            rawWhatsAppNumber.value = val;
            rawWhatsAppUrl.value = formatWhatsAppUrl(val);
          } else if (typeof val === "object") {
            if (val.number) rawWhatsAppNumber.value = String(val.number);
            if (val.url) rawWhatsAppUrl.value = String(val.url);
            else if (val.number) rawWhatsAppUrl.value = formatWhatsAppUrl(val.number);
          }
        } else {
          rawWhatsAppNumber.value = DEFAULT_WHATSAPP_NUMBER;
          rawWhatsAppUrl.value = DEFAULT_WHATSAPP_URL;
        }
        isInitialized.value = true;
      });
    } catch {
      // Fallback
    }
  };

  const saveWhatsAppSettings = async (
    newNumber: string,
    getIdToken?: () => Promise<string | null>
  ) => {
    isUpdating.value = true;
    errorMessage.value = "";

    const trimmed = newNumber.trim();
    const formattedUrl = formatWhatsAppUrl(trimmed);

    // Optimistic UI update
    rawWhatsAppNumber.value = trimmed;
    rawWhatsAppUrl.value = formattedUrl;

    const payload: WhatsAppConfig = {
      number: trimmed,
      url: formattedUrl,
      updatedAt: Date.now(),
    };

    try {
      let token: string | null = null;
      if (getIdToken) {
        try {
          token = await getIdToken();
        } catch {
          // Ignore
        }
      }

      // Try SDK first if client
      if (import.meta.client) {
        try {
          const appModule = await import("firebase/app");
          const databaseModule = await import("firebase/database");
          const config = getFirebaseConfig();
          const app = appModule.getApps().length ? appModule.getApp() : appModule.initializeApp(config);
          const dbUrl = (config.databaseURL || "").replace(/\/+$/, "");
          const db = dbUrl ? databaseModule.getDatabase(app, dbUrl) : databaseModule.getDatabase(app);

          const whatsappRef = databaseModule.ref(db, "settings/whatsapp");
          await databaseModule.set(whatsappRef, payload);
          return { success: true };
        } catch {
          // Fall back to REST PUT
        }
      }

      const rtdbWhatsAppUrl = getRtdbSettingsWhatsAppUrl();
      const rtdbAuthUrl = token
        ? `${rtdbWhatsAppUrl}?auth=${encodeURIComponent(token)}`
        : rtdbWhatsAppUrl;

      const res = await fetch(rtdbAuthUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(4000),
      });

      if (!res.ok) {
        // Fallback without auth
        await fetch(rtdbWhatsAppUrl, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(4000),
        });
      }

      return { success: true };
    } catch (err: any) {
      errorMessage.value = err?.message || "تعذر حفظ إعدادات الواتساب.";
      return { success: false, error: errorMessage.value };
    } finally {
      isUpdating.value = false;
    }
  };

  const resetWhatsAppSettings = async (getIdToken?: () => Promise<string | null>) => {
    return await saveWhatsAppSettings("", getIdToken);
  };

  // Automatically initialize on mount if not yet initialized
  if (import.meta.client && !isInitialized.value) {
    void loadSettings();
  }

  return {
    whatsappNumber,
    whatsappUrl,
    isLoading,
    isUpdating,
    errorMessage,
    formatWhatsAppUrl,
    loadSettings,
    saveWhatsAppSettings,
    resetWhatsAppSettings,
    DEFAULT_WHATSAPP_URL,
  };
};
