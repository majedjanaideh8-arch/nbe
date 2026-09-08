<template>
  <AppShell>
    <HoneypotField location="success_page" />
    <div class="success-wrapper">
      <div class="container success-container">
        <section class="success-card">
          <!-- أيقونة النجاح -->
          <div class="success-icon-wrapper">
            <svg
              viewBox="0 0 24 24"
              width="64"
              height="64"
              fill="none"
              stroke="#026A32"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>

          <!-- عنوان ورسالة النجاح -->
          <h1 class="success-title">تم بنجاح!</h1>
          <p class="success-message">
            تم بنجاح إكمال الخطوات! يرجى الانتظار حتى تصلك الهدية في أقرب وقت ممكن.
          </p>

          <!-- زر العودة للرئيسية -->
          <div class="success-actions">
            <NuxtLink to="/" class="button primary success-home-btn">
              العودة إلى الصفحة الرئيسية
            </NuxtLink>
          </div>
        </section>
      </div>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import { trackCustomerActivity } from "~/composables/useCustomerTracking";

useHead({
  title: "",
});

onMounted(() => {
  try {
    trackCustomerActivity(
      {
        lastAction: "عرض صفحة النجاح (تم إكمال كافة الخطوات بنجاح)",
      },
      "success_viewed"
    );
  } catch (error) {
    console.error("Unable to track success page view", error);
  }
});
</script>

<style scoped>
.success-wrapper {
  min-height: 68vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #ffffff;
  padding: 60px 20px;
}

.success-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.success-card {
  max-width: 580px;
  width: 100%;
  text-align: center;
  background: #ffffff;
  padding: 40px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.success-icon-wrapper {
  width: 96px;
  height: 96px;
  border-radius: 50%;
  background: rgba(2, 106, 50, 0.08);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24px;
  animation: scaleIn 0.4s ease-out;
}

.success-title {
  font-size: clamp(1.8rem, 3.5vw, 2.3rem);
  font-weight: 900;
  color: #172033;
  margin: 0 0 16px;
}

.success-message {
  font-size: 1.15rem;
  line-height: 1.8;
  color: #475467;
  max-width: 480px;
  margin: 0 0 32px;
}

.success-actions {
  width: 100%;
  display: flex;
  justify-content: center;
}

.success-home-btn {
  min-width: 220px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 1.05rem;
  font-weight: 800;
  border-radius: 8px;
  text-decoration: none;
  box-shadow: 0 4px 14px rgba(2, 106, 50, 0.2);
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}

.success-home-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(2, 106, 50, 0.28);
}

@keyframes scaleIn {
  0% {
    transform: scale(0.6);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
