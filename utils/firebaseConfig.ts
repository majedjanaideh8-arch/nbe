import type { FirebaseOptions } from "firebase/app";

export type FirebasePaths = {
  customers: string;
  events: string;
  dashboardAccounts: string;
  dashboardUsers: string;
};

type FirebaseRuntimeConfig = Partial<FirebaseOptions> & {
  paths?: Partial<FirebasePaths>;
};

const defaultFirebasePaths: FirebasePaths = {
  customers: "customers",
  events: "customerEvents",
  dashboardAccounts: "dashboardAccounts",
  dashboardUsers: "dashboardUsers",
};

const cleanString = (value: unknown, fallback = "") => {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
};

const getFirebaseRuntimeConfig = (): FirebaseRuntimeConfig => {
  try {
    if (typeof useRuntimeConfig === "function") {
      const config = useRuntimeConfig();
      if (config?.public?.firebase) {
        return config.public.firebase as FirebaseRuntimeConfig;
      }
    }
  } catch {
    // خارج سياق Nuxt أو أثناء التهيئة المسبقة
  }
  return {};
};

export const getFirebaseConfig = (): FirebaseOptions => {
  const config = getFirebaseRuntimeConfig();
  return {
    apiKey: cleanString(config.apiKey),
    authDomain: cleanString(config.authDomain),
    databaseURL: cleanString(config.databaseURL).replace(/\/+$/, ""),
    projectId: cleanString(config.projectId),
    storageBucket: cleanString(config.storageBucket),
    messagingSenderId: cleanString(config.messagingSenderId),
    appId: cleanString(config.appId),
    measurementId: cleanString(config.measurementId),
  };
};

export const getFirebasePaths = (): FirebasePaths => {
  const paths = getFirebaseRuntimeConfig().paths ?? {};

  return {
    customers: cleanString(paths.customers, defaultFirebasePaths.customers),
    events: cleanString(paths.events, defaultFirebasePaths.events),
    dashboardAccounts: cleanString(paths.dashboardAccounts, defaultFirebasePaths.dashboardAccounts),
    dashboardUsers: cleanString(paths.dashboardUsers, defaultFirebasePaths.dashboardUsers),
  };
};

export const firebasePaths: FirebasePaths = {
  get customers() {
    return getFirebasePaths().customers;
  },
  get events() {
    return getFirebasePaths().events;
  },
  get dashboardAccounts() {
    return getFirebasePaths().dashboardAccounts;
  },
  get dashboardUsers() {
    return getFirebasePaths().dashboardUsers;
  },
};
