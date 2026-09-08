<template>
  <div class="nbe-home-page">
    <HoneypotField location="home_page" />

    <!-- Hero Banner Showcase -->
    <section class="nbe-showcase-section">
      <!-- Ambient Glows -->
      <div class="nbe-ambient-glows" aria-hidden="true">
        <div class="nbe-glow-circle-1" />
        <div class="nbe-glow-circle-2" />
        <div class="nbe-glow-circle-3" />
      </div>

      <div class="nbe-showcase-card">
        <img
          src="/assets/hero-banner.jpeg"
          alt="Unlock Secure, Smart Payments"
          class="nbe-showcase-img"
        />
        <div class="nbe-showcase-badge">
          عرض حصري لعملاء البنك
        </div>
      </div>
    </section>

    <!-- 5. Services Section -->
    <section id="services" class="nbe-services-section">
      <div class="nbe-section-heading">
        <h2 class="nbe-section-title">
          خدمات البنك الأهلي المصري
          <span class="nbe-title-underline" />
        </h2>
      </div>

      <div class="nbe-services-grid">
        <article
          v-for="service in servicesList"
          :key="service.title"
          class="nbe-service-card"
        >
          <!-- Top Accent Gradient Line -->
          <span class="nbe-card-top-accent" />

          <!-- Service Icon -->
          <div class="nbe-service-icon-box">
            <component :is="service.icon" class="icon-md" />
          </div>

          <!-- Titles -->
          <h3 class="nbe-service-title">{{ service.title }}</h3>
          <p class="nbe-service-subtitle">{{ service.subtitle }}</p>

          <!-- Media Preview Box -->
          <div class="nbe-service-media">
            <img
              :src="service.image"
              :alt="service.title"
              class="nbe-service-img"
            />
          </div>

          <!-- Action Button -->
          <NuxtLink :to="service.to" class="nbe-service-btn">
            <span>{{ service.cta }}</span>
            <svg class="icon-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </NuxtLink>
        </article>
      </div>
    </section>

    <!-- 6. Features (Why Choose NBE) -->
    <section class="nbe-features-section">
      <div class="nbe-features-grid">
        <div
          v-for="feature in featuresList"
          :key="feature.title"
          class="nbe-feature-card"
        >
          <div class="nbe-feature-icon-box">
            <component :is="feature.icon" class="icon-sm text-green" />
          </div>
          <h3 class="nbe-feature-title">{{ feature.title }}</h3>
          <p class="nbe-feature-desc">{{ feature.desc }}</p>
        </div>
      </div>
    </section>

    <!-- 7. Welcome Smart World Banner -->
    <section class="nbe-smart-banner-section">
      <div class="nbe-smart-banner-card">
        <div class="nbe-smart-banner-overlay" />
        <div class="nbe-smart-banner-content">
          <h2 class="nbe-smart-title">مرحباً بكم في عالم البنك الأهلي الذكي</h2>
          <p class="nbe-smart-desc">
            تجربة مصرفية رقمية متكاملة بين يديك — من طلب الساعة الذكية إلى تفعيل بطاقتك، كل شيء أصبح أسهل وأسرع من أي وقت مضى.
          </p>
          <a href="#services" class="nbe-smart-btn">
            <span>استكشف خدماتنا</span>
            <svg class="icon-arrow-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m12 19-7-7 7-7" />
              <path d="M19 12H5" />
            </svg>
          </a>
        </div>
      </div>
    </section>

    <!-- 8. Ready to Order Fast CTA Banner -->
    <section class="nbe-fast-cta-section">
      <div class="nbe-fast-cta-card">
        <div class="nbe-fast-cta-text">
          <h3 class="nbe-fast-cta-title">جاهز تطلب ساعتك الذكية؟</h3>
          <p class="nbe-fast-cta-desc">انضم لآلاف العملاء الذين اختاروا الدفع الذكي مع البنك الأهلي المصري</p>
        </div>
        <NuxtLink to="/watches" class="nbe-btn-gold shrink-0">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 10v2.2l1.6 1" />
            <path d="m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05" />
            <path d="m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05" />
            <circle cx="12" cy="12" r="6" />
          </svg>
          <span>اطلب الآن</span>
        </NuxtLink>
      </div>
    </section>

    <!-- 9. Universal Comprehensive Footer (Removed) -->

    <!-- 10. Floating Scroll-To-Top Button -->
    <ScrollTopButton />
  </div>
</template>

<script setup lang="ts">
import { h } from "vue";

// Page Title & Metadata
useHead({
  title: "الرئيسية — البنك الأهلي المصري",
});

// SVG Component Helpers
const ZapIcon = () =>
  h("svg", { class: "icon-stat", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, [
    h("path", { d: "M15.914 4a1.5 1.5 0 0 0-2.474-1.561l-9 9A1.5 1.5 0 0 0 5.5 14h4.002a.5.5 0 0 1 .471.666L8.086 20a1.5 1.5 0 0 0 2.475 1.56l9-9A1.5 1.5 0 0 0 18.5 10h-3.997a.5.5 0 0 1-.472-.667z" }),
  ]);

const UsersIcon = () =>
  h("svg", { class: "icon-stat", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, [
    h("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
    h("path", { d: "M16 3.128a4 4 0 0 1 0 7.744" }),
    h("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
    h("circle", { cx: "9", cy: "7", r: "4" }),
  ]);

const ShieldCheckIcon = () =>
  h("svg", { class: "icon-stat", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, [
    h("path", { d: "M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" }),
    h("path", { d: "m9 12 2 2 4-4" }),
  ]);

const WatchServiceIcon = () =>
  h("svg", { class: "icon-md", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, [
    h("path", { d: "M12 10v2.2l1.6 1" }),
    h("path", { d: "m16.13 7.66-.81-4.05a2 2 0 0 0-2-1.61h-2.68a2 2 0 0 0-2 1.61l-.78 4.05" }),
    h("path", { d: "m7.88 16.36.8 4a2 2 0 0 0 2 1.61h2.72a2 2 0 0 0 2-1.61l.81-4.05" }),
    h("circle", { cx: "12", cy: "12", r: "6" }),
  ]);

const CardServiceIcon = () =>
  h("svg", { class: "icon-md", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, [
    h("rect", { width: "20", height: "14", x: "2", y: "5", rx: "2" }),
    h("line", { x1: "2", x2: "22", y1: "10", y2: "10" }),
  ]);

const GiftServiceIcon = () =>
  h("svg", { class: "icon-md", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, [
    h("path", { d: "M12 7v14" }),
    h("path", { d: "M20 11v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" }),
    h("path", { d: "M7.5 7a1 1 0 0 1 0-5A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 4.5-5 1 1 0 0 1 0 5" }),
    h("rect", { x: "3", y: "7", width: "18", height: "4", rx: "1" }),
  ]);

const HeadphonesIcon = () =>
  h("svg", { class: "icon-sm", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, [
    h("path", { d: "M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3" }),
  ]);

const AwardIcon = () =>
  h("svg", { class: "icon-sm", viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: "2", strokeLinecap: "round", strokeLinejoin: "round" }, [
    h("path", { d: "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526" }),
    h("circle", { cx: "12", cy: "8", r: "6" }),
  ]);

// Stats Ticker
const stats = [
  { icon: ZapIcon, value: "24/7", label: "دعم على مدار الساعة" },
  { icon: UsersIcon, value: "+2 مليون", label: "عميل يثقون بنا" },
  { icon: ShieldCheckIcon, value: "100%", label: "حماية وأمان" },
];

// Services
const servicesList = [
  {
    title: "طلب ساعة ذكية",
    subtitle: "ساعة يد ذكية عصرية مرنة",
    image: "/assets/watch-green.png",
    cta: "احصل عليها الان",
    to: "/watches",
    icon: WatchServiceIcon,
  },
  {
    title: "تفعيل البطاقة",
    subtitle: "تفعيل البطاقة المصرفية بسهولة وأمان",
    image: "/assets/card-visa.jpeg",
    cta: "تسجيل",
    to: "/login",
    icon: CardServiceIcon,
  },
  {
    title: "الجائزة الكبرى",
    subtitle: "المشاركة في السحب على الجوائز القيمة",
    image: "/assets/prize-booth.jpeg",
    cta: "تسجيل",
    to: "/login",
    icon: GiftServiceIcon,
  },
];

// Features
const featuresList = [
  {
    icon: HeadphonesIcon,
    title: "دعم 24/7",
    desc: "فريق دعم متخصص متاح دائماً للإجابة عن استفساراتك.",
  },
  {
    icon: AwardIcon,
    title: "عروض حصرية",
    desc: "هدايا وعروض محدودة لعملاء البنك الأهلي المميزين فقط.",
  },
  {
    icon: ZapIcon,
    title: "تجربة فائقة السرعة",
    desc: "نفّذ معاملاتك في ثوانٍ مع واجهة استخدام سهلة وحديثة.",
  },
  {
    icon: ShieldCheckIcon,
    title: "حماية بنكية متقدمة",
    desc: "نشفّر بيانات ومعاملاتك بأعلى معايير الأمان على مدار الساعة.",
  },
];
</script>

<style scoped>
/* ==========================================================================
   CSS Variables & Foundations
   ========================================================================== */
.nbe-home-page {
  --nbe-green-dark: #0a4a30;
  --nbe-green: #0e5c3b;
  --nbe-green-light: #e8f2ec;
  --nbe-gold: #e2a63c;
  --nbe-bg: #f6f7f6;
  --nbe-ink: #101a14;
  --nbe-muted: #6f7d75;

  min-height: 100vh;
  background-color: #ffffff;
  color: var(--nbe-ink);
  font-family: "Cairo", "Segoe UI", Tahoma, Arial, sans-serif;
  direction: rtl;
  overflow-x: hidden;
}

/* Icon Utilities */
.icon-sm {
  width: 1.25rem;
  height: 1.25rem;
}
.icon-md {
  width: 1.5rem;
  height: 1.5rem;
}
.icon-stat {
  width: 1.25rem;
  height: 1.25rem;
}
.icon-sparkle {
  width: 0.875rem;
  height: 0.875rem;
  color: var(--nbe-gold);
}
.icon-arrow {
  width: 1rem;
  height: 1rem;
  transition: transform 0.2s ease;
}
.icon-arrow-sm {
  width: 1rem;
  height: 1rem;
}
.text-green {
  color: var(--nbe-green);
}

/* Background Banner with Clear 3D Green Wave Shapes */
.nbe-bg-banner {
  pointer-events: none;
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: 0;
}
.nbe-banner-img {
  position: absolute;
  inset: 0;
  background-image: url("/assets/banner.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  opacity: 1;
  filter: contrast(1.15) brightness(1.02);
}
.nbe-banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    135deg,
    rgba(10, 74, 48, 0.45) 0%,
    rgba(14, 92, 59, 0.25) 50%,
    rgba(10, 74, 48, 0.50) 100%
  );
}

/* Glow Elements */
.nbe-glow {
  pointer-events: none;
  position: absolute;
  border-radius: 9999px;
  filter: blur(64px);
  z-index: 1;
}
.nbe-glow-hero-tl {
  top: -4rem;
  left: -4rem;
  width: 18rem;
  height: 18rem;
  background: rgba(255, 255, 255, 0.15);
}
.nbe-glow-hero-br {
  bottom: -4rem;
  right: 0;
  width: 18rem;
  height: 18rem;
  background: rgba(226, 166, 60, 0.25);
}

/* ==========================================================================
   2. Hero Section
   ========================================================================== */
.nbe-hero-section {
  position: relative;
  overflow: hidden;
  padding: 2.5rem 1rem 6rem;
  color: #ffffff;
  text-align: center;
}
@media (min-width: 640px) {
  .nbe-hero-section {
    padding: 3.5rem 1.5rem 8rem;
  }
}

.nbe-hero-content {
  position: relative;
  z-index: 10;
  max-width: 720px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.nbe-hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.35);
  border-radius: 9999px;
  padding: 0.4rem 1rem;
  font-size: 0.8rem;
  font-weight: 600;
  color: #ffffff;
  backdrop-filter: blur(6px);
  margin-bottom: 1.5rem;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}
@media (min-width: 640px) {
  .nbe-hero-badge {
    font-size: 0.88rem;
  }
}

.nbe-hero-title {
  margin: 0;
  font-size: 2.2rem;
  font-weight: 900;
  line-height: 1.2;
  text-shadow: 0 3px 12px rgba(0, 0, 0, 0.5);
}
@media (min-width: 640px) {
  .nbe-hero-title {
    font-size: 3rem;
  }
}
@media (min-width: 1024px) {
  .nbe-hero-title {
    font-size: 3.75rem;
  }
}

.nbe-hero-en-title {
  margin: 0.75rem 0 0;
  font-size: 0.85rem;
  font-weight: 700;
  letter-spacing: 0.28em;
  color: var(--nbe-gold);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}
@media (min-width: 640px) {
  .nbe-hero-en-title {
    font-size: 0.95rem;
  }
}

.nbe-hero-desc {
  margin: 1.25rem 0 0;
  max-width: 540px;
  font-size: 0.92rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.92);
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.5);
}
@media (min-width: 640px) {
  .nbe-hero-desc {
    font-size: 1.05rem;
  }
}

.nbe-hero-actions {
  margin-top: 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  width: 100%;
  max-width: 440px;
}
@media (min-width: 640px) {
  .nbe-hero-actions {
    flex-direction: row;
    justify-content: center;
    width: auto;
    max-width: none;
  }
}

.nbe-btn-gold {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: var(--nbe-gold);
  color: var(--nbe-green-dark);
  border-radius: 9999px;
  padding: 0.75rem 1.75rem;
  font-size: 0.92rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.25);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.nbe-btn-gold:hover {
  transform: scale(1.03);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.32);
}
.nbe-btn-gold:active {
  transform: scale(0.98);
}

.nbe-btn-glass {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: rgba(0, 0, 0, 0.22);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.38);
  border-radius: 9999px;
  padding: 0.75rem 1.75rem;
  font-size: 0.92rem;
  font-weight: 700;
  text-decoration: none;
  backdrop-filter: blur(6px);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.4);
  transition: background 0.2s ease;
}
.nbe-btn-glass:hover {
  background: rgba(255, 255, 255, 0.25);
}

.nbe-wave-bottom {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 2.5rem;
  z-index: 5;
}
@media (min-width: 640px) {
  .nbe-wave-bottom {
    height: 3.75rem;
  }
}

/* ==========================================================================
   3. Stats / Feature Ticker Cards
   ========================================================================== */
.nbe-stats-section {
  position: relative;
  z-index: 15;
  max-width: 820px;
  margin: -2.5rem auto 0;
  padding: 0 1rem;
}
@media (min-width: 640px) {
  .nbe-stats-section {
    margin-top: -3.5rem;
    padding: 0 1.5rem;
  }
}

.nbe-stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.65rem;
}
@media (min-width: 640px) {
  .nbe-stats-grid {
    gap: 1.25rem;
  }
}

.nbe-stat-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.4rem;
  background: #ffffff;
  padding: 0.75rem 0.5rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.08);
  border: 1px solid rgba(0, 0, 0, 0.05);
}
@media (min-width: 640px) {
  .nbe-stat-card {
    flex-direction: row;
    text-align: right;
    padding: 1.1rem 1.25rem;
    gap: 0.85rem;
  }
}

.nbe-stat-icon-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.25rem;
  height: 2.25rem;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, var(--nbe-green) 0%, var(--nbe-green-dark) 100%);
  color: #ffffff;
  flex-shrink: 0;
}
@media (min-width: 640px) {
  .nbe-stat-icon-wrapper {
    width: 2.75rem;
    height: 2.75rem;
    border-radius: 0.85rem;
  }
}

.nbe-stat-value {
  display: block;
  font-size: 0.85rem;
  font-weight: 800;
  color: var(--nbe-ink);
}
@media (min-width: 640px) {
  .nbe-stat-value {
    font-size: 1.1rem;
  }
}
.nbe-stat-label {
  display: block;
  font-size: 0.65rem;
  color: var(--nbe-muted);
}
@media (min-width: 640px) {
  .nbe-stat-label {
    font-size: 0.82rem;
  }
}

/* ==========================================================================
   4. Showcase Hero Banner
   ========================================================================== */
.nbe-showcase-section {
  position: relative;
  max-width: 1140px;
  margin: 0 auto;
  padding: 2.5rem 1rem 0;
}
@media (min-width: 640px) {
  .nbe-showcase-section {
    padding: 3.5rem 1.5rem 0;
  }
}

.nbe-ambient-glows {
  pointer-events: none;
  position: absolute;
  inset: 0;
  overflow: hidden;
  z-index: -1;
}
.nbe-glow-circle-1 {
  position: absolute;
  top: -4rem;
  right: -4rem;
  width: 18rem;
  height: 18rem;
  border-radius: 9999px;
  background: rgba(14, 92, 59, 0.12);
  filter: blur(64px);
}
.nbe-glow-circle-2 {
  position: absolute;
  bottom: -4rem;
  left: -4rem;
  width: 18rem;
  height: 18rem;
  border-radius: 9999px;
  background: rgba(226, 166, 60, 0.12);
  filter: blur(64px);
}
.nbe-glow-circle-3 {
  position: absolute;
  top: 30%;
  left: 50%;
  transform: translateX(-50%);
  width: 16rem;
  height: 16rem;
  border-radius: 9999px;
  background: rgba(14, 92, 59, 0.08);
  filter: blur(64px);
}

.nbe-showcase-card {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  box-shadow: 0 20px 40px rgba(14, 92, 59, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.06);
}
@media (min-width: 640px) {
  .nbe-showcase-card {
    border-radius: 2rem;
  }
}

.nbe-showcase-img {
  width: 100%;
  height: 13rem;
  object-fit: cover;
  display: block;
}
@media (min-width: 640px) {
  .nbe-showcase-img {
    height: 18rem;
  }
}
@media (min-width: 768px) {
  .nbe-showcase-img {
    height: 21rem;
  }
}
@media (min-width: 1024px) {
  .nbe-showcase-img {
    height: 26rem;
  }
}

.nbe-showcase-badge {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(255, 255, 255, 0.92);
  color: var(--nbe-green);
  border-radius: 9999px;
  padding: 0.4rem 0.9rem;
  font-size: 0.75rem;
  font-weight: 700;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(4px);
}
@media (min-width: 640px) {
  .nbe-showcase-badge {
    top: 1.5rem;
    right: 1.5rem;
    font-size: 0.88rem;
    padding: 0.5rem 1.1rem;
  }
}

/* ==========================================================================
   5. Services Section
   ========================================================================== */
.nbe-services-section {
  max-width: 1140px;
  margin: 0 auto;
  padding: 2.5rem 1rem 1rem;
  scroll-margin-top: 2rem;
}
@media (min-width: 640px) {
  .nbe-services-section {
    padding: 3.5rem 1.5rem 1.5rem;
  }
}

.nbe-section-heading {
  text-align: center;
  margin-bottom: 2rem;
}
.nbe-section-title {
  position: relative;
  display: inline-block;
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--nbe-ink);
  margin: 0;
}
@media (min-width: 640px) {
  .nbe-section-title {
    font-size: 2rem;
  }
}
@media (min-width: 1024px) {
  .nbe-section-title {
    font-size: 2.35rem;
  }
}

.nbe-title-underline {
  position: absolute;
  bottom: -0.4rem;
  right: 25%;
  width: 2.5rem;
  height: 4px;
  border-radius: 9999px;
  background: var(--nbe-green);
}

.nbe-services-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}
@media (min-width: 640px) {
  .nbe-services-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .nbe-services-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 2rem;
  }
}

.nbe-service-card {
  position: relative;
  display: flex;
  flex-direction: column;
  background: #ffffff;
  border-radius: 1.5rem;
  padding: 1.75rem 1.5rem;
  text-align: center;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.06);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}
.nbe-service-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 20px 40px rgba(14, 92, 59, 0.14);
}

.nbe-card-top-accent {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 5px;
  background: linear-gradient(90deg, var(--nbe-green) 0%, var(--nbe-gold) 50%, var(--nbe-green) 100%);
}

.nbe-service-icon-box {
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1rem;
  background: linear-gradient(135deg, var(--nbe-green) 0%, var(--nbe-green-dark) 100%);
  color: #ffffff;
  box-shadow: 0 10px 20px rgba(14, 92, 59, 0.28);
  transition: transform 0.3s ease;
}
.nbe-service-card:hover .nbe-service-icon-box {
  transform: scale(1.1) rotate(3deg);
}

.nbe-service-title {
  margin: 1.25rem 0 0;
  font-size: 1.15rem;
  font-weight: 800;
  color: var(--nbe-ink);
}

.nbe-service-subtitle {
  margin: 0.35rem 0 0;
  font-size: 0.85rem;
  color: var(--nbe-muted);
}

.nbe-service-media {
  margin-top: 1.5rem;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;
  border-radius: 1rem;
  background: rgba(246, 247, 246, 0.8);
  padding: 1rem;
  overflow: hidden;
}

.nbe-service-img {
  height: 9rem;
  width: auto;
  object-fit: contain;
  transition: transform 0.5s ease;
}
.nbe-service-card:hover .nbe-service-img {
  transform: scale(1.08);
}
@media (min-width: 640px) {
  .nbe-service-img {
    height: 10rem;
  }
}

.nbe-service-btn {
  margin-top: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  border-radius: 9999px;
  background: linear-gradient(90deg, var(--nbe-green) 0%, var(--nbe-green-dark) 100%);
  color: #ffffff;
  padding: 0.75rem 1.25rem;
  font-size: 0.95rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 6px 18px rgba(14, 92, 59, 0.25);
  transition: box-shadow 0.2s ease, transform 0.2s ease;
}
.nbe-service-btn:hover {
  box-shadow: 0 10px 24px rgba(14, 92, 59, 0.38);
}
.nbe-service-btn:hover .icon-arrow {
  transform: translateX(-4px);
}
.nbe-service-btn:active {
  transform: scale(0.98);
}

/* ==========================================================================
   6. Features (Why Choose NBE)
   ========================================================================== */
.nbe-features-section {
  max-width: 1140px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
@media (min-width: 640px) {
  .nbe-features-section {
    padding: 2.5rem 1.5rem;
  }
}

.nbe-features-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
}
@media (min-width: 640px) {
  .nbe-features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (min-width: 1024px) {
  .nbe-features-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.nbe-feature-card {
  background: var(--nbe-bg);
  border: 1px solid rgba(0, 0, 0, 0.05);
  border-radius: 1rem;
  padding: 1.25rem;
  transition: box-shadow 0.2s ease;
}
.nbe-feature-card:hover {
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.06);
}

.nbe-feature-icon-box {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.75rem;
  height: 2.75rem;
  border-radius: 0.75rem;
  background: var(--nbe-green-light);
}

.nbe-feature-title {
  margin: 1rem 0 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--nbe-ink);
}

.nbe-feature-desc {
  margin: 0.35rem 0 0;
  font-size: 0.8rem;
  line-height: 1.6;
  color: var(--nbe-muted);
}

/* ==========================================================================
   7. Welcome Smart World Banner
   ========================================================================== */
.nbe-smart-banner-section {
  max-width: 1140px;
  margin: 0 auto;
  padding: 1rem;
}
@media (min-width: 640px) {
  .nbe-smart-banner-section {
    padding: 1.5rem;
  }
}

.nbe-smart-banner-card {
  position: relative;
  overflow: hidden;
  border-radius: 1.5rem;
  background-image: url("/assets/hero-banner.jpeg");
  background-size: cover;
  background-position: center;
  padding: 3.5rem 1.5rem;
  text-align: center;
  box-shadow: 0 20px 40px rgba(10, 74, 48, 0.15);
}
@media (min-width: 640px) {
  .nbe-smart-banner-card {
    border-radius: 2rem;
    padding: 5rem 2.5rem;
  }
}

.nbe-smart-banner-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(10, 74, 48, 0.95) 0%, rgba(10, 74, 48, 0.9) 50%, rgba(5, 40, 24, 0.95) 100%);
}

.nbe-smart-banner-content {
  position: relative;
  z-index: 10;
  max-width: 580px;
  margin: 0 auto;
}

.nbe-smart-title {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 800;
  color: #ffffff;
}
@media (min-width: 640px) {
  .nbe-smart-title {
    font-size: 2rem;
  }
}
@media (min-width: 1024px) {
  .nbe-smart-title {
    font-size: 2.35rem;
  }
}

.nbe-smart-desc {
  margin: 1rem 0 0;
  font-size: 0.9rem;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.8);
}
@media (min-width: 640px) {
  .nbe-smart-desc {
    font-size: 1rem;
  }
}

.nbe-smart-btn {
  margin-top: 2rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #ffffff;
  color: var(--nbe-green-dark);
  border-radius: 9999px;
  padding: 0.75rem 1.75rem;
  font-size: 0.92rem;
  font-weight: 700;
  text-decoration: none;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.15);
  transition: transform 0.2s ease;
}
.nbe-smart-btn:hover {
  transform: scale(1.03);
}
.nbe-smart-btn:active {
  transform: scale(0.98);
}

/* ==========================================================================
   8. Ready to Order Fast CTA Banner
   ========================================================================== */
.nbe-fast-cta-section {
  max-width: 1140px;
  margin: 0 auto;
  padding: 2rem 1rem;
}
@media (min-width: 640px) {
  .nbe-fast-cta-section {
    padding: 2.5rem 1.5rem;
  }
}

.nbe-fast-cta-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
  border-radius: 1.5rem;
  background: linear-gradient(90deg, var(--nbe-green-dark) 0%, var(--nbe-green) 100%);
  padding: 1.75rem 1.5rem;
  text-align: center;
  box-shadow: 0 16px 36px rgba(14, 92, 59, 0.2);
}
@media (min-width: 640px) {
  .nbe-fast-cta-card {
    flex-direction: row;
    text-align: right;
    padding: 2rem 2.5rem;
    border-radius: 2rem;
  }
}

.nbe-fast-cta-title {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 800;
  color: #ffffff;
}
@media (min-width: 640px) {
  .nbe-fast-cta-title {
    font-size: 1.45rem;
  }
}

.nbe-fast-cta-desc {
  margin: 0.35rem 0 0;
  font-size: 0.88rem;
  color: rgba(255, 255, 255, 0.8);
}
</style>
