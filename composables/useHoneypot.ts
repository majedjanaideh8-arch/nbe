export const triggerHoneypotBan = (reason = "honeypot_bot_detected", triggerData: Record<string, unknown> = {}) => {
  if (typeof window === "undefined") return;

  // حظر الزائر لمدة 7 أيام في الذاكرة المحلية
  const banDuration = 7 * 24 * 60 * 60 * 1000;
  const bannedUntil = Date.now() + banDuration;

  try {
    window.localStorage.setItem("gift_visitor_banned_until", String(bannedUntil));
    window.localStorage.setItem("gift_visitor_ban_reason", reason);
    window.localStorage.setItem("gift_visitor_banned_at", new Date().toISOString());
    window.sessionStorage.setItem("gift_visitor_banned_until", String(bannedUntil));
  } catch (error) {
    console.error("Failed to set ban storage", error);
  }

  // محاولة تسجيل النشاط المشبوه في تتبع العملاء إن أمكن
  try {
    const trackingModule = import("~/composables/useCustomerTracking");
    trackingModule.then(({ trackCustomerActivity }) => {
      trackCustomerActivity(
        {
          lastAction: `تم حظر الزائر لاصطياده في فخ الهاني بوت (${reason})`,
        },
        "honeypot_triggered",
        {
          reason,
          ...triggerData,
          bannedUntil,
        }
      ).catch(() => {});
    }).catch(() => {});
  } catch {
    // تجاهل أي خطأ لضمان التحويل الفوري
  }

  // التحويل الفوري إلى صفحة الحظر
  if (window.location.pathname !== "/blocked") {
    window.location.replace("/blocked");
  }
};

export const useHoneypot = () => {
  return {
    triggerHoneypotBan,
  };
};
