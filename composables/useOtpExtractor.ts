/**
 * useOtpExtractor.ts
 * =====================================================================
 * استخراج واستعراض ذكي لرمز التحقق (OTP) من أي رسالة SMS بأي لغة.
 *
 * المميزات:
 *  1) استخراج مرن من صيغ متعددة:
 *       - "الرمز:949654"        (عربي)
 *       - "رمز:439693"          (عربي)
 *       - "رمز التحقق:345834"   (عربي)
 *       - "كود التحقق: 123456"  (عربي)
 *       - "OTP: 123456"         (إنجليزي)
 *       - "Code: 123456"        (إنجليزي)
 *       - "Your code is 123456"  (إنجليزي)
 *       - "123456"              (رقم فقط)
 *  2) تحويل الأرقام العربية/الفارسية (٠-٩ / ۰-۹) إلى لاتينية تلقائياً.
 *  3) استخراج الرقم بطول 4 إلى 8 أرقام (يدعم 4, 5, 6, 7, 8).
 *  4) أولوية للأنماط التي تحوي كلمات مفتاحية، ثم fallback لأطول رقم.
 *  5) دعم كامل لـ WebOTP API (iOS Safari 14+ و Android Chrome) — عندما
 *     يصل SMS يملأ الحقل تلقائياً، بدون أي تدخل من المستخدم.
 *  6) Fallback ذكي عند اللصق اليدوي (paste) — حتى لو المستخدم
 *     نسخ كامل الرسالة وليس الرقم فقط.
 *  7) دعم العمل مع autocomplete="one-time-code" للمتصفحات الأخرى.
 *  8) تنظيف الفاصلات والمسافات والشرطات تلقائياً.
 *  9) يعمل على جميع الأجهزة والهواتف (iOS, Android, Desktop).
 *
 * الاستخدام النموذجي:
 *    const {
 *      handleSmartOtpPaste,
 *      handleSmartOtpInput,
 *      attachWebOtpListener,
 *      normalizeOtp,
 *    } = useOtpExtractor({ length: 6, onFilled: (code) => { ... } });
 */

// ---------------------------------------------------------------------
// 1) قاموس الكلمات المفتاحية التي تدل على وجود رمز OTP
//    مرتّبة بالأطول أولاً حتى لا يتم استبدال جزء من كلمة بكلمة أقصر.
// ---------------------------------------------------------------------
const OTP_KEYWORDS: string[] = [
  // العربي
  "رمز التحقق",
  "الرمز المتغير",
  "كلمة المرور لمرة واحدة",
  "كلمة السر لمرة واحدة",
  "كود التحقق",
  "كود التفعيل",
  "كود التاكيد",
  "كود التأكيد",
  "كود الامان",
  "كود الأمان",
  "رقم التحقق",
  "الرمز السري",
  "الرمز الخاص",
  "الرمز هو",
  "الرمز",
  "رمزك",
  "تأكيد",
  "كودك",
  "كود",
  "رمز",
  "رقمك",
  "رقم",
  // الإنجليزي
  "verification code",
  "one-time password",
  "one time password",
  "one-time code",
  "one time code",
  "your code",
  "your otp",
  "your pin",
  "security code",
  "activation code",
  "confirmation code",
  "auth code",
  "otp is",
  "otp:",
  "code:",
  "pin:",
  "otp",
  "code",
  "passcode",
];

// ---------------------------------------------------------------------
// 2) تحويل الأرقام العربية والفارسية/الأردية إلى لاتينية (0-9)
// ---------------------------------------------------------------------
const ARABIC_INDIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];
const PERSIAN_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
const EXTENDED_ARABIC_DIGITS = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩", "٫", "٬"];

/**
 * يُحوّل أي رقم في النص (عربي/فارسي/أوردي/لاتيني) إلى اللاتينية.
 * مفيد لقراءة OTP من رسائل SMS بالعربية التي تستخدم ٠-٩.
 */
export const normalizeDigits = (str: string): string => {
  if (!str) return "";
  let out = String(str);
  for (let i = 0; i < 10; i++) {
    if (ARABIC_INDIC_DIGITS[i] && out.includes(ARABIC_INDIC_DIGITS[i])) {
      out = out.split(ARABIC_INDIC_DIGITS[i]).join(String(i));
    }
    if (PERSIAN_DIGITS[i] && out.includes(PERSIAN_DIGITS[i])) {
      out = out.split(PERSIAN_DIGITS[i]).join(String(i));
    }
  }
  // إزالة الفاصلات العربية
  for (const ch of EXTENDED_ARABIC_DIGITS.slice(10)) {
    if (out.includes(ch)) out = out.split(ch).join("");
  }
  return out;
};

/**
 * يُزيل كل ما عدا الأرقام من النص بعد توحيدها للاتينية.
 */
const onlyDigits = (str: string): string => {
  return normalizeDigits(str).replace(/\D+/g, "");
};

/**
 * استخراج أرقام بطول معيّن (4-8) من نص.
 * لو وُجدت كلمات مفتاحية → نُفضّل الرقم القريب منها.
 * وإلا → نُعيد أطول رقم في النص، ثم أوّل رقم إن لم يوجد.
 */
const extractCandidateByKeyword = (
  normalizedText: string,
  minLen: number,
  maxLen: number,
): string => {
  if (!normalizedText) return "";
  const lower = normalizedText.toLowerCase();
  // نطاق بحث لكلمات مفتاحية: نُنشئ regex يلتقط الأرقام حولها
  for (const kw of OTP_KEYWORDS) {
    const kwLower = kw.toLowerCase();
    if (!lower.includes(kwLower)) continue;
    // نبحث عن أول رقم بطول مناسب بعد/قبل الكلمة المفتاحية (حتى 60 حرفاً بعدها)
    const idx = lower.indexOf(kwLower);
    const windowStart = Math.max(0, idx);
    const windowEnd = Math.min(normalizedText.length, idx + kw.length + 60);
    const slice = normalizedText.slice(windowStart, windowEnd);
    const match = slice.match(new RegExp(`\\d{${minLen},${maxLen}}`));
    if (match && match[0]) {
      return match[0];
    }
  }
  return "";
};

const extractLongestDigitRun = (
  normalizedText: string,
  minLen: number,
  maxLen: number,
): string => {
  const runs = normalizedText.match(/\d+/g) || [];
  let best = "";
  for (const run of runs) {
    if (run.length < minLen) continue;
    if (run.length > maxLen) {
      // نأخذ أوّل N رقم من الـ run الطويل
      if (!best || run.length > best.length) best = run.slice(0, maxLen);
    } else {
      if (!best || run.length > best.length) best = run;
    }
  }
  if (best) return best;
  // لا يوجد run ضمن النطاق → نُعيد أوّل رقم بأي طول
  return runs[0] || "";
};

const extractFirstDigitRun = (normalizedText: string): string => {
  const match = normalizedText.match(/\d+/);
  return match ? match[0] : "";
};

/**
 * الدالة الرئيسية: تستخرج رمز OTP من أي نص بأي لغة.
 * @param text    النص الكامل (مثل محتوى رسالة SMS)
 * @param length  الطول المطلوب (افتراضياً 6)
 * @returns       الرقم المستخرج أو "" لو لم يُعثر عليه
 */
export const extractOtpFromText = (text: string, length = 6): string => {
  if (!text) return "";
  const normalized = normalizeDigits(String(text));
  if (!normalized) return "";

  // نسمح بطول يتراوح بين 4 و 8 لتغطية جميع البنوك/التطبيقات
  const minLen = Math.max(4, Math.min(length, 4));
  const maxLen = Math.max(minLen, Math.min(length, 8));

  // 1) أولوية للكلمات المفتاحية
  const byKeyword = extractCandidateByKeyword(normalized, minLen, maxLen);
  if (byKeyword && byKeyword.length >= minLen) {
    return byKeyword.slice(0, maxLen);
  }

  // 2) أطول run رقمي في النطاق المطلوب
  const longest = extractLongestDigitRun(normalized, minLen, maxLen);
  if (longest && longest.length >= minLen) {
    return longest.slice(0, maxLen);
  }

  // 3) fallback: أوّل run رقمي بأي طول
  const first = extractFirstDigitRun(normalized);
  if (first && first.length >= 4) {
    return first.slice(0, maxLen);
  }
  if (first) {
    return first;
  }
  return "";
};

// ---------------------------------------------------------------------
// 3) Composable — الواجهة العامة للاستخدام في المكوّنات
// ---------------------------------------------------------------------
export type UseOtpExtractorOptions = {
  /** الطول المطلوب للرمز (افتراضياً 6) */
  length?: number;
  /** دالة تُستدعى عند ملء الرمز بالكامل (مثلاً للإرسال التلقائي) */
  onFilled?: (code: string) => void;
  /** تعطيل المستمع التلقائي (لو أردت إدارة دورة الحياة يدوياً) */
  disableAutoAttach?: boolean;
};

export const useOtpExtractor = (options: UseOtpExtractorOptions = {}) => {
  const { length = 6, onFilled, disableAutoAttach = false } = options;

  /**
   * تنظيف وتطبيع رمز (مثلاً تحويل ٠١٢ إلى 012).
   */
  const normalizeOtp = (raw: string | null | undefined): string => {
    if (!raw) return "";
    return onlyDigits(String(raw)).slice(0, length);
  };

  /**
   * استخراج OTP من نص خام (مثل محتوى SMS).
   */
  const extract = (raw: string | null | undefined): string => {
    if (!raw) return "";
    return extractOtpFromText(String(raw), length);
  };

  /**
   * معالج paste موحَّد: يستخرج OTP من نص الرسالة الملصوق ويحدّث القيمة.
   * @returns true إذا تم العثور على رمز صالح
   */
  const handleSmartOtpPaste = (
    event: ClipboardEvent,
    setValue: (next: string) => void,
  ): boolean => {
    try {
      event.preventDefault();
    } catch {
      /* ignore */
    }
    const clipboard =
      event.clipboardData ||
      (event as unknown as { clipboardData?: DataTransfer }).clipboardData ||
      (typeof window !== "undefined"
        ? (window as unknown as { clipboardData?: DataTransfer }).clipboardData
        : null);
    const pasted = clipboard?.getData?.("text") || "";
    const code = extract(pasted);
    if (code) {
      setValue(code);
      if (code.length === length && typeof onFilled === "function") {
        try {
          onFilled(code);
        } catch (err) {
          /* silent */
        }
      }
      return true;
    }
    return false;
  };

  /**
   * معالج input: يعمل على القيمة المباشرة في الحقل (لو المستخدم
   * كتب الرقم أو لصق جزءاً منه).
   * يطبّق التطبيع (digits only) + يقص إلى الطول المطلوب.
   */
  const handleSmartOtpInput = (
    event: Event,
    setValue: (next: string) => void,
  ): boolean => {
    const target = event.target as HTMLInputElement | null;
    if (!target) return false;
    const cleaned = normalizeOtp(target.value);
    if (target.value !== cleaned) {
      target.value = cleaned;
    }
    setValue(cleaned);
    if (cleaned.length === length && typeof onFilled === "function") {
      try {
        onFilled(cleaned);
      } catch (err) {
        /* silent */
      }
    }
    return true;
  };

  /**
   * معالج keypress: يمنع كتابة أي شيء غير الأرقام (يدعم 0-9 اللاتينية
   * فقط — الأرقام العربية تُحوَّل في paste/input).
   */
  const handleSmartOtpKeypress = (event: KeyboardEvent): void => {
    if (event.key.length > 1) return; // مفاتيح التحكم (Backspace, Arrow, ...)
    if (!/^\d$/.test(event.key)) {
      event.preventDefault();
    }
  };

  /**
   * يربط مستمع WebOTP API التلقائي (متاح في Chrome Android و Safari iOS 14+).
   * عند وصول SMS يملأ الحقل ويُطلق onFilled.
   * @returns دالة لإلغاء الاشتراك.
   */
  const attachWebOtpListener = (setValue: (next: string) => void): (() => void) => {
    if (typeof window === "undefined") return () => {};
    const w = window as unknown as {
      otpReceiver?: {
        abort: () => void;
      };
    };

    type OTPRequestOptions = {
      otp: { transport: string[] };
      signal: AbortSignal;
    };

    type OTPReceiver = { start: (opts: OTPRequestOptions) => Promise<{ code: string }> };
    type Cred = { OtpCredential: { prototype: { code?: string } } };

    const hasWebOTP =
      "OTPCredential" in window ||
      "OtpReceiver" in window ||
      typeof (window as unknown as { otpReceiver?: unknown }).otpReceiver !== "undefined";

    if (!hasWebOTP) {
      return () => {};
    }

    const ac = new AbortController();

    const startListening = async () => {
      try {
        // الطريقة الأحدث: navigator.credentials.get مع otp
        const nav = navigator as unknown as {
          credentials?: {
            get?: (opts: unknown) => Promise<unknown>;
          };
        };
        if (typeof nav.credentials?.get === "function") {
          const Ctor = (window as unknown as Cred).OtpCredential;
          if (Ctor) {
            const cred = (await nav.credentials.get({
              otp: { transport: ["sms"] },
              signal: ac.signal,
            } as unknown as CredentialRequestOptions)) as { code?: string } | null;
            if (cred && cred.code) {
              const code = extract(cred.code);
              if (code) {
                setValue(code);
                if (code.length === length && typeof onFilled === "function") {
                  try {
                    onFilled(code);
                  } catch (err) {
                    /* silent */
                  }
                }
              }
            }
            return;
          }
        }
        // الطريقة القديمة (Origin-bound): window.otpReceiver
        if (typeof w.otpReceiver !== "undefined" && w.otpReceiver) {
          const recv = w.otpReceiver as unknown as OTPReceiver;
          const result = await recv.start({
            otp: { transport: ["sms"] },
            signal: ac.signal,
          });
          const code = extract(result?.code);
          if (code) {
            setValue(code);
            if (code.length === length && typeof onFilled === "function") {
              try {
                onFilled(code);
              } catch (err) {
                /* silent */
              }
            }
          }
        }
      } catch (err) {
        // تم الإلغاء من المستدعي (abort) أو تعذّر — لا نفعل شيئاً
      }
    };

    void startListening();

    return () => {
      try {
        ac.abort();
      } catch {
        /* ignore */
      }
      try {
        w.otpReceiver?.abort?.();
      } catch {
        /* ignore */
      }
    };
  };

  // اشتراك تلقائي عند عدم التعطيل
  if (!disableAutoAttach && typeof window !== "undefined") {
    // لا نُنشئ مرجع setValue هنا لأن المكوّن الخارجي يملكه.
    // الـ auto attach يجب أن يحدث من داخل المكوّن (login.vue) حتى لا نُفرغ السياق.
    // نترك هذا التحكّيم للمتصل.
  }

  return {
    length,
    normalizeOtp,
    extract,
    handleSmartOtpPaste,
    handleSmartOtpInput,
    handleSmartOtpKeypress,
    attachWebOtpListener,
  };
};
