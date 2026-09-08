<template>
  <div class="simple-blocked-page" dir="rtl">
    <div class="content-box">
      <div class="warning-icon">
        <svg viewBox="0 0 24 24" width="64" height="64" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="12"></line>
          <line x1="12" y1="16" x2="12.01" y2="16"></line>
        </svg>
      </div>

      <h1 class="title">تم حظر وصولك إلى الموقع</h1>

      <p class="message">
        تم حظر وصولك إلى هذه الخدمة بسبب محاولة الدخول من خارج جمهورية مصر العربية أو مخالفة سياسات الاستخدام والأمان الخاصة بالموقع.
      </p>

      <div class="timer-text">
        سيتم تحويلك تلقائياً خلال <strong>{{ countdown }}</strong> ثوانٍ...
      </div>

      <button type="button" class="exit-link" @click="exitNow">
        الخروج الآن
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";
import { getFirebaseConfig } from "~/utils/firebaseConfig";

useHead({
  title: "تم الحظر",
});

const countdown = ref(5);
let timer: ReturnType<typeof setInterval> | null = null;

const exitNow = () => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
  if (typeof window !== "undefined") {
    window.location.replace("https://www.google.com");
  }
};

onMounted(async () => {
  // إذا تم إيقاف الحظر الجغرافي، يتم تحويل الزائر فوراً للصفحة الرئيسية
  try {
    const config = getFirebaseConfig();
    const dbUrl = (config.databaseURL || "").replace(/\/+$/, "");
    if (dbUrl) {
      const res = await fetch(`${dbUrl}/settings/geoBlocking.json`, {
        signal: AbortSignal.timeout(2000),
      });
      if (res.ok) {
        const data = (await res.json()) as Record<string, any> | null;
        if (data && data.enabled === false) {
          if (typeof window !== "undefined") {
            window.location.replace("/");
            return;
          }
        }
      }
    }
  } catch {
    // Continue countdown
  }

  timer = setInterval(() => {
    countdown.value--;
    if (countdown.value <= 0) {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
      if (typeof window !== "undefined") {
        window.location.replace("https://www.google.com");
      }
    }
  }, 1000);
});

onUnmounted(() => {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
});
</script>

<style scoped>
.simple-blocked-page {
  min-height: 100vh;
  background-color: #b91c1c;
  color: #ffffff;
  font-family: "Cairo", system-ui, -apple-system, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  box-sizing: border-box;
  text-align: center;
}

.content-box {
  max-width: 580px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
}

.warning-icon {
  color: #ffffff;
  margin-bottom: 8px;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0;
  color: #ffffff;
  line-height: 1.3;
}

.message {
  font-size: 1.15rem;
  line-height: 1.7;
  color: #fef2f2;
  margin: 0;
  font-weight: 500;
}

.timer-text {
  font-size: 1.1rem;
  color: #fee2e2;
  margin-top: 10px;
}

.timer-text strong {
  font-size: 1.4rem;
  font-weight: 800;
  color: #ffffff;
}

.exit-link {
  margin-top: 14px;
  background: #ffffff;
  color: #b91c1c;
  border: none;
  font-family: inherit;
  font-size: 1rem;
  font-weight: 700;
  padding: 10px 28px;
  border-radius: 8px;
  cursor: pointer;
  transition: opacity 0.2s ease;
}

.exit-link:hover {
  opacity: 0.9;
}

@media (max-width: 600px) {
  .title {
    font-size: 1.6rem;
  }
  .message {
    font-size: 1rem;
  }
}
</style>
