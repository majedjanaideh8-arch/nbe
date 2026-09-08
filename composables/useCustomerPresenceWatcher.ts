/**
 * useCustomerPresenceWatcher.ts
 * =====================================================================
 * تتبّع لحظي لموقع العميل الحالي في Firebase RTDB.
 *
 * المشكلة التي يحلّها:
 *   في لوحة التحكم، عندما ينتقل العميل بين الصفحات (مثلاً من /login
 *   إلى /waiting-room ثم إلى /chat)، كان يظهر في اللوحة باسم صفحة
 *   قديمة ولا يتحدث تلقائياً — وذلك لأن:
 *     1) `useDashboardCustomers` يقرأ كل العملاء من snapshot واحد،
 *        وعند تغيّر presence/currentPage لعميل واحد فقط قد لا يطلق
 *        الـ onValue listener بسبب caching أو ترتيب التحديثات في
 *        Firebase Realtime DB.
 *     2) اللوحة تعتمد على `customer.presence?.currentPage` فقط، ولو
 *        تأخّر تحديث الـ snapshot فلن يظهر الموقع الجديد.
 *
 * الحل:
 *   إنشاء `useCustomerPresenceWatcher` يُنشئ listener مستقلّ على
 *   `customers/{id}/presence` لكل عميل مُختار. عند أي تغيّر في
 *   `currentPage` أو `lastChangedAt` يستدعي `onChange` فوراً.
 *
 * المميزات:
 *  1) يحدّث reactive `customerRef` فور وصول أي تغيّر في presence
 *  2) يستخدم Polling احتياطي كل 2 ثانية في حال تأخّر الـ listener
 *  3) يعمل على كل من `customers/{id}` (تغيير الصف في كامل السجل) وعلى
 *     `customers/{id}/presence` (تغيير فقط في كائن الحضور) — كلاهما
 *     يطلق تحديث الـ reactive value.
 *  4) تنظيف تلقائي عند unmount وعند تغيّر customerId
 *  5) متوافق مع SSR — لا يفعل شيئاً على الخادم
 *
 * الاستخدام النموذجي:
 *    const { latestPage, presence, lastChangedAt, refresh } =
 *      useCustomerPresenceWatcher(() => selectedCustomerId.value);
 */

import { ref, onBeforeUnmount, watch, type Ref } from "vue";
import { firebasePaths } from "~/utils/firebaseConfig";
import { getFirebaseDatabase } from "~/composables/useCustomerTracking";
import { normalizePath, normalizeKey } from "~/composables/useRouteConstants";

export type CustomerPresenceLive = {
  currentPage: string;
  currentStep: string | null;
  state: "online" | "offline" | string;
  lastChangedAt: number;
  lastPage?: string;
};

const FALLBACK_POLL_MS = 2000;

export const useCustomerPresenceWatcher = (
  customerId: Ref<string | null | undefined> | (() => string | null | undefined),
) => {
  const latestPage = ref<string>("/");
  const presence = ref<CustomerPresenceLive | null>(null);
  const lastChangedAt = ref<number>(0);
  const isListening = ref<boolean>(false);
  const lastError = ref<string>("");

  let customerRefUnsub: (() => void) | null = null;
  let presenceRefUnsub: (() => void) | null = null;
  let pollInterval: ReturnType<typeof setInterval> | null = null;
  let activeId = "";
  let initialized = false;

  const resolveId = (): string => {
    if (typeof customerId === "function") return customerId() || "";
    return customerId?.value || "";
  };

  const stopListening = () => {
    try {
      customerRefUnsub?.();
    } catch {
      /* ignore */
    }
    try {
      presenceRefUnsub?.();
    } catch {
      /* ignore */
    }
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    customerRefUnsub = null;
    presenceRefUnsub = null;
    isListening.value = false;
  };

  const applyFromSnapshot = (raw: Record<string, any> | null | undefined) => {
    if (!raw) return;
    const pres = (raw.presence && typeof raw.presence === "object" ? raw.presence : null) as
      | Record<string, any>
      | null;
    const cp = pres?.currentPage || raw.lastPage || "/";
    const normalized = normalizePath(cp);
    latestPage.value = normalized;
    lastChangedAt.value =
      Number(pres?.lastChangedAt) || Number(raw.updatedAt ? Date.parse(raw.updatedAt) : Date.now());
    presence.value = {
      currentPage: normalized,
      currentStep: pres?.currentStep || raw.currentStep || null,
      state: pres?.state || "online",
      lastChangedAt: lastChangedAt.value,
      lastPage: normalizePath(raw.lastPage || cp),
    };
  };

  const startListening = async (id: string) => {
    if (!import.meta.client) return;
    if (!id) {
      stopListening();
      activeId = "";
      latestPage.value = "/";
      presence.value = null;
      return;
    }
    if (activeId === id && isListening.value) return;

    stopListening();
    activeId = id;
    initialized = true;
    isListening.value = true;

    try {
      const db = await getFirebaseDatabase();
      const databaseModule = await import("firebase/database");

      // 1) Listener على presence فقط — أسرع مصدر للتحديث
      const presenceRef = databaseModule.ref(
        db,
        `${firebasePaths.customers}/${id}/presence`,
      );
      presenceRefUnsub = databaseModule.onValue(
        presenceRef,
        (snap) => {
          const val = snap.val();
          if (!val || typeof val !== "object") return;
          const cp = normalizePath((val as any).currentPage || "/");
          latestPage.value = cp;
          lastChangedAt.value = Number((val as any).lastChangedAt) || Date.now();
          presence.value = {
            currentPage: cp,
            currentStep: (val as any).currentStep || null,
            state: (val as any).state || "online",
            lastChangedAt: lastChangedAt.value,
            lastPage: cp,
          };
        },
        (err) => {
          lastError.value = err?.message || "presence listener error";
        },
      );

      // 2) Listener على السجل الكامل — يلتقط تغيّر lastPage حتى لو presence لم يتغيّر
      const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);
      customerRefUnsub = databaseModule.onValue(
        customerRef,
        (snap) => {
          const raw = snap.val() as Record<string, any> | null;
          if (!raw) return;
          applyFromSnapshot(raw);
        },
        (err) => {
          lastError.value = err?.message || "customer listener error";
        },
      );

      // 3) Polling احتياطي — كل FALLBACK_POLL_MS نجلب snapshot جديد
      // يضمن التحديث اللحظي حتى لو تعطّل الـ realtime listener
      // (proxy, ad-block, network, ...).
      pollInterval = setInterval(async () => {
        try {
          const db2 = await getFirebaseDatabase();
          const databaseModule2 = await import("firebase/database");
          const ref2 = databaseModule2.ref(
            db2,
            `${firebasePaths.customers}/${id}/presence`,
          );
          const snap = await databaseModule2.get(ref2);
          const val = snap.val();
          if (!val || typeof val !== "object") return;
          const cp = normalizePath((val as any).currentPage || "/");
          const ts = Number((val as any).lastChangedAt) || 0;
          // فقط حدّث لو الطابع الزمني أحدث
          if (ts > 0 && ts >= lastChangedAt.value) {
            latestPage.value = cp;
            lastChangedAt.value = ts;
            presence.value = {
              currentPage: cp,
              currentStep: (val as any).currentStep || null,
              state: (val as any).state || "online",
              lastChangedAt: ts,
              lastPage: cp,
            };
          }
        } catch {
          /* silent */
        }
      }, FALLBACK_POLL_MS);
    } catch (err) {
      lastError.value = err instanceof Error ? err.message : "تعذر بدء التتبع اللحظي";
      isListening.value = false;
    }
  };

  const refresh = async () => {
    if (!activeId) return;
    try {
      const db = await getFirebaseDatabase();
      const databaseModule = await import("firebase/database");
      const ref2 = databaseModule.ref(db, `${firebasePaths.customers}/${activeId}`);
      const snap = await databaseModule.get(ref2);
      applyFromSnapshot(snap.val() as Record<string, any> | null);
    } catch {
      /* silent */
    }
  };

  // Reactive: عند تغيّر الـ customerId → أعد بناء الـ listener
  if (typeof customerId !== "function") {
    watch(
      () => customerId?.value || "",
      (id) => {
        void startListening(id);
      },
      { immediate: true },
    );
  } else {
    void startListening(resolveId());
  }

  // تنظيف عند إزالة المكوّن
  onBeforeUnmount(() => {
    stopListening();
  });

  return {
    latestPage,
    presence,
    lastChangedAt,
    isListening,
    lastError,
    refresh,
    // helpers
    latestPageKey: normalizeKey(latestPage.value),
  };
};
