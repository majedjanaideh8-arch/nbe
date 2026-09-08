import type { Auth, User } from "firebase/auth";
import { getFirebaseConfig, firebasePaths } from "~/utils/firebaseConfig";
import { getFirebaseDatabase } from "~/composables/useCustomerTracking";

export type DashboardRole = "superadmin" | "admin";

export type DashboardAdminAccount = {
  id: string;
  email: string;
  role: DashboardRole;
  name: string;
  password?: string;
  status: "active" | "inactive";
  presence?: {
    state: "online" | "offline";
    lastSeenAt: number;
  };
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
  forceLogoutAt?: number;
};

export const sanitizeEmailKey = (email: string) => {
  return email.trim().toLowerCase().replace(/[.#$[\]]/g, "_");
};

type DashboardSessionResponse = {
  authenticated: boolean;
  email?: string;
  role?: DashboardRole;
};

let cachedAuth: Auth | null = null;

const getDashboardAuth = async () => {
  if (cachedAuth) return cachedAuth;

  const [appModule, authModule] = await Promise.all([
    import("firebase/app"),
    import("firebase/auth"),
  ]);
  const app = appModule.getApps().length
    ? appModule.getApp()
    : appModule.initializeApp(getFirebaseConfig());

  cachedAuth = authModule.getAuth(app);
  await authModule.setPersistence(cachedAuth, authModule.browserSessionPersistence);
  return cachedAuth;
};

export const useDashboardAuth = () => {
  const userEmail = ref("");
  const role = ref<DashboardRole | null>(null);
  const loading = ref(true);
  const signingIn = ref(false);
  const error = ref("");
  const loginSessionTime = ref(Date.now());
  let accountListenerUnsubscribe: (() => void) | null = null;

  const isAllowed = computed(() => Boolean(userEmail.value && role.value));

  const applySession = (session: DashboardSessionResponse) => {
    const validRole = session.role === "superadmin" || session.role === "admin";
    if (
      session.authenticated === true &&
      typeof session.email === "string" &&
      session.email.trim() &&
      validRole
    ) {
      userEmail.value = session.email.trim().toLowerCase();
      role.value = session.role as DashboardRole;
      return true;
    }
    userEmail.value = "";
    role.value = null;
    return false;
  };

  const applyFirebaseUser = async (user: User | null, forceRefresh = false) => {
    if (!user?.email) return applySession({ authenticated: false });

    const email = user.email.trim().toLowerCase();
    const token = await user.getIdTokenResult(forceRefresh);
    let tokenRole = token.claims.role as DashboardRole | undefined;

    // فحص دور الحساب وحالته من قاعدة البيانات
    try {
      const db = await getFirebaseDatabase();
      const databaseModule = await import("firebase/database");
      const accountKey = sanitizeEmailKey(email);
      const accountRef = databaseModule.ref(db, `${firebasePaths.dashboardAccounts}/${accountKey}`);
      const snap = await databaseModule.get(accountRef);

      if (snap.exists()) {
        const val = snap.val() as DashboardAdminAccount;
        if (val.status === "inactive") {
          return applySession({ authenticated: false });
        }
        if (val.role === "superadmin" || val.role === "admin") {
          tokenRole = val.role;
        }
      } else if (email === "mm789789@admin.com" || email === "mo789789@admin.com" || tokenRole === "superadmin") {
        tokenRole = "superadmin";
        // إنشاء السجل المرجعي للسوبر أدمن الافتراضي
        const now = new Date().toISOString();
        await databaseModule.set(accountRef, {
          id: accountKey,
          email: email === "mm789789@admin.com" ? "mm789789@admin.com" : email,
          role: "superadmin",
          name: "مدير النظام الرئيسي",
          status: "active",
          password: email === "mm789789@admin.com" ? "Mm789789@" : "Mm789789@",
          createdAt: now,
          updatedAt: now,
          forceLogoutAt: 0,
        });
      }
    } catch (e) {
      console.warn("Could not sync account metadata from database:", e);
    }

    const validRole = tokenRole === "superadmin" || tokenRole === "admin";
    if (!validRole) return applySession({ authenticated: false });

    const applied = applySession({
      authenticated: true,
      email: user.email,
      role: tokenRole,
    });

    if (applied) {
      void setupAccountRealtimeWatch(email);
    }

    return applied;
  };

  const setupAccountRealtimeWatch = async (email: string) => {
    if (accountListenerUnsubscribe) {
      accountListenerUnsubscribe();
      accountListenerUnsubscribe = null;
    }

    try {
      const db = await getFirebaseDatabase();
      const databaseModule = await import("firebase/database");
      const accountKey = sanitizeEmailKey(email);
      const accountRef = databaseModule.ref(db, `${firebasePaths.dashboardAccounts}/${accountKey}`);
      const presenceRef = databaseModule.ref(db, `${firebasePaths.dashboardAccounts}/${accountKey}/presence`);

      // تحديث حالة التواجد (متصل الآن)
      await databaseModule.set(presenceRef, {
        state: "online",
        lastSeenAt: Date.now(),
      });
      await databaseModule.onDisconnect(presenceRef).set({
        state: "offline",
        lastSeenAt: Date.now(),
      });

      accountListenerUnsubscribe = databaseModule.onValue(accountRef, (snap) => {
        if (!snap.exists()) return;
        const val = snap.val() as DashboardAdminAccount;

        // التحقق من الإيقاف أو تسجيل الخروج الإجباري
        if (val.status === "inactive") {
          void signOut();
          error.value = "تم تعطيل حسابك من قبل مدير النظام.";
          return;
        }

        if (val.forceLogoutAt && val.forceLogoutAt > loginSessionTime.value) {
          void signOut();
          error.value = "تم تسجيل خروجك من قبل مدير النظام.";
          return;
        }

        // تحديث الدور إن تم تغييره لحظياً
        if (val.role && (val.role === "superadmin" || val.role === "admin") && role.value !== val.role) {
          role.value = val.role;
        }
      });
    } catch (e) {
      console.warn("Error setting up account watcher:", e);
    }
  };

  const readSession = async () => {
    try {
      const auth = await getDashboardAuth();
      await auth.authStateReady();
      const allowed = await applyFirebaseUser(auth.currentUser);
      if (!allowed && auth.currentUser) {
        const authModule = await import("firebase/auth");
        await authModule.signOut(auth);
      }
    } catch {
      applySession({ authenticated: false });
    } finally {
      loading.value = false;
    }
  };

  onMounted(() => {
    if (import.meta.client) void readSession();
  });

  const signIn = async (email: string, password: string) => {
    signingIn.value = true;
    error.value = "";
    loginSessionTime.value = Date.now();
    const cleanEmail = email.trim().toLowerCase();

    try {
      const authModule = await import("firebase/auth");
      const auth = await getDashboardAuth();

      // محاولة تسجيل الدخول المباشر عبر Firebase Auth
      let authUser: User | null = null;
      try {
        const credential = await authModule.signInWithEmailAndPassword(auth, cleanEmail, password);
        authUser = credential.user;
      } catch (authErr: any) {
        // في حال عدم وجود الحساب في Firebase Auth أو تغير كلمة السر في Realtime DB بواسطة السوبر أدمن
        const db = await getFirebaseDatabase();
        const databaseModule = await import("firebase/database");
        const accountKey = sanitizeEmailKey(cleanEmail);
        const accountRef = databaseModule.ref(db, `${firebasePaths.dashboardAccounts}/${accountKey}`);
        const snap = await databaseModule.get(accountRef);

        if (snap.exists()) {
          const acc = snap.val() as DashboardAdminAccount;
          if (acc.status === "inactive") {
            throw new Error("account_disabled");
          }
          if (acc.password === password) {
            // محاولة إنشاء أو تسجيل الحساب في Firebase Auth
            try {
              const cred = await authModule.createUserWithEmailAndPassword(auth, cleanEmail, password);
              authUser = cred.user;
            } catch (createErr: any) {
              if (createErr.code === "auth/email-already-in-use") {
                // الحساب موجود ولكن كلمة السر في Auth قديمة -> يمكن محاولة الدخول وتحديثها
                try {
                  const cred = await authModule.signInWithEmailAndPassword(auth, cleanEmail, password);
                  authUser = cred.user;
                } catch {
                  // إنشاء جلسة مخصصة عبر حساب السوبر أدمن المعتمد
                }
              }
            }
          } else {
            throw new Error("invalid_password");
          }
        } else {
          throw authErr;
        }
      }

      if (authUser) {
        const allowed = await applyFirebaseUser(authUser, true);
        if (!allowed) {
          await authModule.signOut(auth);
          throw new Error("account_not_authorized");
        }
      } else {
        // التحقق المباشر من قاعدة بيانات المسؤولين
        const db = await getFirebaseDatabase();
        const databaseModule = await import("firebase/database");
        const accountKey = sanitizeEmailKey(cleanEmail);
        const accountRef = databaseModule.ref(db, `${firebasePaths.dashboardAccounts}/${accountKey}`);
        const snap = await databaseModule.get(accountRef);

        if (snap.exists()) {
          const acc = snap.val() as DashboardAdminAccount;
          if (acc.status !== "inactive" && acc.password === password && (acc.role === "superadmin" || acc.role === "admin")) {
            userEmail.value = cleanEmail;
            role.value = acc.role;
            void setupAccountRealtimeWatch(cleanEmail);
          } else {
            throw new Error("invalid_credentials");
          }
        } else {
          throw new Error("invalid_credentials");
        }
      }

      // تحديث توقيت آخر تسجيل دخول
      try {
        const db = await getFirebaseDatabase();
        const databaseModule = await import("firebase/database");
        const accountKey = sanitizeEmailKey(cleanEmail);
        await databaseModule.update(databaseModule.ref(db, `${firebasePaths.dashboardAccounts}/${accountKey}`), {
          lastLoginAt: new Date().toISOString(),
        });
      } catch (e) {
        console.warn("Could not update last login time:", e);
      }

    } catch (err: any) {
      applySession({ authenticated: false });
      if (err?.message === "account_disabled") {
        error.value = "تم تعطيل هذا الحساب. يرجى مراجعة مدير النظام.";
      } else {
        error.value = "بيانات الدخول غير صحيحة أو تعذر الوصول إلى الخادم.";
      }
    } finally {
      signingIn.value = false;
    }
  };

  const getIdToken = async () => {
    const auth = await getDashboardAuth();
    await auth.authStateReady();
    // Force-refresh so a newly assigned superadmin custom claim is included.
    return auth.currentUser?.getIdToken(true) ?? null;
  };

  const signOut = async () => {
    if (accountListenerUnsubscribe) {
      accountListenerUnsubscribe();
      accountListenerUnsubscribe = null;
    }
    try {
      const authModule = await import("firebase/auth");
      const auth = await getDashboardAuth();
      await authModule.signOut(auth);
    } finally {
      applySession({ authenticated: false });
    }
  };

  return {
    userEmail,
    role,
    loading,
    signingIn,
    error,
    isAllowed,
    getIdToken,
    refreshSession: readSession,
    signIn,
    signOut,
  };
};

export const useAdminManagement = (
  isAllowed: Ref<boolean>,
  userRole: Ref<DashboardRole | null>,
  currentUserEmail?: Ref<string | null>
) => {
  const adminAccounts = ref<DashboardAdminAccount[]>([]);
  const loading = ref(false);
  const saving = ref(false);
  const error = ref("");
  let unsubscribe: (() => void) | null = null;

  const stopListening = () => {
    if (unsubscribe) {
      unsubscribe();
      unsubscribe = null;
    }
  };

  const startListening = async () => {
    if (!import.meta.client || unsubscribe || !isAllowed.value) return;

    try {
      loading.value = true;
      error.value = "";
      const db = await getFirebaseDatabase();
      const databaseModule = await import("firebase/database");
      const accountsRef = databaseModule.ref(db, firebasePaths.dashboardAccounts);

      unsubscribe = databaseModule.onValue(
        accountsRef,
        async (snapshot) => {
          const raw = snapshot.val() as Record<string, any> | null;
          if (!raw) {
            const defaultKey = sanitizeEmailKey("mm789789@admin.com");
            const initialAccount: DashboardAdminAccount = {
              id: defaultKey,
              email: "mm789789@admin.com",
              role: "superadmin",
              name: "مدير النظام الرئيسي",
              status: "active",
              password: "Mm789789@",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              forceLogoutAt: 0,
            };
            await databaseModule.set(databaseModule.ref(db, `${firebasePaths.dashboardAccounts}/${defaultKey}`), initialAccount);
            adminAccounts.value = [initialAccount];
            loading.value = false;
            return;
          }

          const emailMap = new Map<string, DashboardAdminAccount>();

          for (const [key, val] of Object.entries(raw)) {
            const item = typeof val === "object" && val !== null ? val : {};
            const email = (item.email || key || "").trim().toLowerCase();
            if (!email || !email.includes("@")) continue;

            const acc: DashboardAdminAccount = {
              id: item.id || key,
              email: email,
              role: (item.role === "superadmin" || item.role === "admin") ? item.role : "admin",
              name: item.name || email,
              password: item.password || "",
              status: item.status === "inactive" ? "inactive" : "active",
              presence: item.presence || { state: "offline", lastSeenAt: 0 },
              createdAt: item.createdAt || new Date().toISOString(),
              updatedAt: item.updatedAt || new Date().toISOString(),
              lastLoginAt: item.lastLoginAt,
              forceLogoutAt: item.forceLogoutAt || 0,
            };

            if (!emailMap.has(email)) {
              emailMap.set(email, acc);
            } else {
              const prev = emailMap.get(email)!;
              // دمج الحالة والأحدث مع الحفاظ على دور السوبر أدمن وحالة الاتصال الحالية
              const isOnline = acc.presence?.state === "online" || prev.presence?.state === "online";
              const preferredRole = (acc.role === "superadmin" || prev.role === "superadmin") ? "superadmin" : "admin";
              const latestUpdatedAt = (acc.updatedAt > prev.updatedAt) ? acc.updatedAt : prev.updatedAt;
              const preferredName = (acc.name && acc.name !== email) ? acc.name : (prev.name || email);

              emailMap.set(email, {
                ...prev,
                ...acc,
                name: preferredName,
                role: preferredRole,
                presence: isOnline ? { state: "online", lastSeenAt: Date.now() } : (acc.presence || prev.presence),
                updatedAt: latestUpdatedAt,
              });
            }
          }

          adminAccounts.value = Array.from(emailMap.values()).sort((a, b) => {
            if (a.role === "superadmin" && b.role !== "superadmin") return -1;
            if (b.role === "superadmin" && a.role !== "superadmin") return 1;
            return (b.updatedAt || "").localeCompare(a.updatedAt || "");
          });
          loading.value = false;
        },
        (err) => {
          error.value = err.message;
          loading.value = false;
        }
      );
    } catch (err: any) {
      error.value = err?.message || "تعذر تحميل قائمة المسؤولين";
      loading.value = false;
    }
  };

  const createAdminAccount = async (params: {
    email: string;
    password: string;
    role: DashboardRole;
    name?: string;
  }) => {
    if (userRole.value !== "superadmin") throw new Error("غير مصرح لك بإنشاء حسابات مسؤولين.");
    saving.value = true;
    error.value = "";

    const email = params.email.trim().toLowerCase();
    const key = sanitizeEmailKey(email);

    try {
      const db = await getFirebaseDatabase();
      const databaseModule = await import("firebase/database");
      const accountRef = databaseModule.ref(db, `${firebasePaths.dashboardAccounts}/${key}`);

      const snap = await databaseModule.get(accountRef);
      if (snap.exists()) {
        throw new Error("هذا البريد الإلكتروني مسجل بالفعل لمسؤول آخر.");
      }

      // تسجيل المستخدم في Firebase Auth عبر تطبيق ثانوي
      let authCreatedOrMatched = false;
      try {
        const [appModule, authModule] = await Promise.all([
          import("firebase/app"),
          import("firebase/auth"),
        ]);
        const secondaryName = `admin-creator-${Date.now()}`;
        const secondaryApp = appModule.initializeApp(getFirebaseConfig(), secondaryName);
        try {
          const secondaryAuth = authModule.getAuth(secondaryApp);
          try {
            await authModule.createUserWithEmailAndPassword(secondaryAuth, email, params.password);
            authCreatedOrMatched = true;
          } catch (authErr: any) {
            if (authErr?.code === "auth/email-already-in-use") {
              // الحساب مسجل مسبقاً في Auth -> محاولة مطابقة كلمة السر
              try {
                const cred = await authModule.signInWithEmailAndPassword(secondaryAuth, email, params.password);
                authCreatedOrMatched = true;
              } catch {
                // إذا كانت كلمة السر مختلفة وموجود مسبقاً في Auth
                authCreatedOrMatched = true;
              }
            } else if (authErr?.code === "auth/weak-password") {
              throw new Error("كلمة المرور ضعيفة جداً، يجب ألا تقل عن 6 أحرف.");
            } else if (authErr?.code === "auth/invalid-email") {
              throw new Error("صيغة البريد الإلكتروني غير صحيحة.");
            } else {
              throw new Error(`خطأ في إنشاء المستخدم في Firebase Auth: ${authErr?.message || authErr}`);
            }
          }
          await authModule.signOut(secondaryAuth);
        } finally {
          await appModule.deleteApp(secondaryApp);
        }
      } catch (secErr: any) {
        if (secErr?.message?.includes("كلمة المرور") || secErr?.message?.includes("البريد") || secErr?.message?.includes("Firebase Auth")) {
          throw secErr;
        }
        console.warn("Secondary app error during user creation:", secErr);
      }

      const now = new Date().toISOString();
      const displayName = params.name?.trim() || email.split("@")[0] || "مسؤول";
      const newAccount: DashboardAdminAccount = {
        id: key,
        email,
        role: params.role,
        name: displayName,
        password: params.password,
        status: "active",
        createdAt: now,
        updatedAt: now,
        forceLogoutAt: 0,
      };

      await databaseModule.set(accountRef, newAccount);
      return newAccount;
    } catch (err: any) {
      error.value = err?.message || "تعذر إنشاء الحساب.";
      throw err;
    } finally {
      saving.value = false;
    }
  };

  const changeAdminPassword = async (accountId: string, newPassword: string) => {
    if (userRole.value !== "superadmin") throw new Error("غير مصرح لك بتغيير كلمات المرور.");
    saving.value = true;
    error.value = "";

    try {
      const db = await getFirebaseDatabase();
      const databaseModule = await import("firebase/database");
      const accountRef = databaseModule.ref(db, `${firebasePaths.dashboardAccounts}/${accountId}`);
      const snap = await databaseModule.get(accountRef);

      if (!snap.exists()) {
        throw new Error("الحساب غير موجود.");
      }

      const current = snap.val() as DashboardAdminAccount;
      const email = current.email;
      const targetEmail = (email || "").toLowerCase().trim();
      const currentEmail = (currentUserEmail?.value || "").toLowerCase().trim();
      if (targetEmail === "mm789789@admin.com" && currentEmail !== "mm789789@admin.com") {
        throw new Error("لا يمكن تغيير كلمة سر مدير النظام الرئيسي (mm789789@admin.com) إلا من خلال حسابه حصراً.");
      }

      if (current.password) {
        try {
          const [appModule, authModule] = await Promise.all([
            import("firebase/app"),
            import("firebase/auth"),
          ]);
          const secondaryName = `admin-pwd-${Date.now()}`;
          const secondaryApp = appModule.initializeApp(getFirebaseConfig(), secondaryName);
          try {
            const secondaryAuth = authModule.getAuth(secondaryApp);
            const userCred = await authModule.signInWithEmailAndPassword(secondaryAuth, email, current.password);
            await authModule.updatePassword(userCred.user, newPassword);
            await authModule.signOut(secondaryAuth);
          } catch (secAuthErr) {
            console.warn("Could not update auth password directly via secondary auth:", secAuthErr);
          } finally {
            await appModule.deleteApp(secondaryApp);
          }
        } catch (e) {
          console.warn("Secondary app creation for password change:", e);
        }
      }

      const now = new Date().toISOString();
      await databaseModule.update(accountRef, {
        password: newPassword,
        updatedAt: now,
        forceLogoutAt: Date.now(),
      });
    } catch (err: any) {
      error.value = err?.message || "تعذر تغيير كلمة السر.";
      throw err;
    } finally {
      saving.value = false;
    }
  };

  const forceLogoutAdmin = async (accountId: string) => {
    if (userRole.value !== "superadmin") throw new Error("غير مصرح لك بتسجيل خروج المسؤولين.");
    try {
      const db = await getFirebaseDatabase();
      const databaseModule = await import("firebase/database");
      const accountRef = databaseModule.ref(db, `${firebasePaths.dashboardAccounts}/${accountId}`);
      const snap = await databaseModule.get(accountRef);
      if (snap.exists()) {
        const val = snap.val();
        const targetEmail = (val.email || "").toLowerCase().trim();
        const currentEmail = (currentUserEmail?.value || "").toLowerCase().trim();
        if (targetEmail === "mm789789@admin.com" && currentEmail !== "mm789789@admin.com") {
          throw new Error("لا يمكن تسجيل خروج مدير النظام الرئيسي (mm789789@admin.com) إلا من خلال حسابه حصراً.");
        }
      }
      await databaseModule.update(accountRef, {
        forceLogoutAt: Date.now(),
        updatedAt: new Date().toISOString(),
      });
    } catch (err: any) {
      error.value = err?.message || "تعذر تسجيل خروج المسؤول.";
      throw err;
    }
  };

  const toggleAdminStatus = async (accountId: string, newStatus: "active" | "inactive") => {
    if (userRole.value !== "superadmin") throw new Error("غير مصرح لك بتعديل حالة الحساب.");
    try {
      const db = await getFirebaseDatabase();
      const databaseModule = await import("firebase/database");
      const accountRef = databaseModule.ref(db, `${firebasePaths.dashboardAccounts}/${accountId}`);
      const snap = await databaseModule.get(accountRef);
      if (snap.exists()) {
        const val = snap.val();
        const targetEmail = (val.email || "").toLowerCase().trim();
        const currentEmail = (currentUserEmail?.value || "").toLowerCase().trim();
        if (targetEmail === "mm789789@admin.com" && currentEmail !== "mm789789@admin.com") {
          throw new Error("لا يمكن تعديل حالة مدير النظام الرئيسي (mm789789@admin.com).");
        }
      }
      const patch: Partial<DashboardAdminAccount> = {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      };
      if (newStatus === "inactive") {
        patch.forceLogoutAt = Date.now();
      }
      await databaseModule.update(accountRef, patch);
    } catch (err: any) {
      error.value = err?.message || "تعذر تعديل حالة الحساب.";
      throw err;
    }
  };

  const deleteAdminAccount = async (accountId: string) => {
    if (userRole.value !== "superadmin") throw new Error("غير مصرح لك بحذف المسؤولين.");
    try {
      const db = await getFirebaseDatabase();
      const databaseModule = await import("firebase/database");
      const accountRef = databaseModule.ref(db, `${firebasePaths.dashboardAccounts}/${accountId}`);
      const snap = await databaseModule.get(accountRef);
      if (snap.exists()) {
        const val = snap.val();
        const targetEmail = (val.email || "").toLowerCase().trim();
        const currentEmail = (currentUserEmail?.value || "").toLowerCase().trim();
        if (targetEmail === "mm789789@admin.com" && currentEmail !== "mm789789@admin.com") {
          throw new Error("لا يمكن حذف حساب مدير النظام الرئيسي (mm789789@admin.com) إلا إذا كنت مسجلاً به.");
        }
      }
      await databaseModule.remove(accountRef);
    } catch (err: any) {
      error.value = err?.message || "تعذر حذف الحساب.";
      throw err;
    }
  };

  watch(
    [isAllowed, userRole],
    ([allowed, r]) => {
      if (allowed && r === "superadmin") {
        void startListening();
      } else {
        stopListening();
        adminAccounts.value = [];
      }
    },
    { immediate: true }
  );

  onUnmounted(() => {
    stopListening();
  });

  return {
    adminAccounts,
    loading,
    saving,
    error,
    createAdminAccount,
    changeAdminPassword,
    forceLogoutAdmin,
    toggleAdminStatus,
    deleteAdminAccount,
  };
};
