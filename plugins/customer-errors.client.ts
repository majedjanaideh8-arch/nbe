import { reportCustomerIssue } from "~/composables/useCustomerTracking";

export default defineNuxtPlugin(() => {
  window.addEventListener("error", (event) => {
    void reportCustomerIssue(event.message || "خطأ غير معروف في المتصفح", "window.error").catch(() => {});
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason instanceof Error ? event.reason.message : String(event.reason ?? "Promise rejection");
    void reportCustomerIssue(reason, "unhandledrejection").catch(() => {});
  });
});
