<template>
  <transition name="btn-pop">
    <button
      v-if="showScrollTop"
      type="button"
      class="nbe-scroll-top-btn"
      aria-label="الرجوع لأعلى الصفحة"
      @click="scrollToTop"
    >
      <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="m5 12 7-7 7 7" />
        <path d="M12 19V5" />
      </svg>
    </button>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

const showScrollTop = ref(false);

const handleScroll = () => {
  if (typeof window !== "undefined") {
    showScrollTop.value = window.scrollY > 350;
  }
};

const scrollToTop = () => {
  if (typeof window !== "undefined") {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll, { passive: true });
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});
</script>

<style scoped>
.icon-sm {
  width: 1.25rem;
  height: 1.25rem;
}

.nbe-scroll-top-btn {
  position: fixed;
  bottom: 1.5rem;
  left: 1.5rem;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 9999px;
  background: linear-gradient(135deg, #0e5c3b 0%, #0a4a30 100%);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.25);
  box-shadow: 0 10px 25px rgba(14, 92, 59, 0.35);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.nbe-scroll-top-btn:hover {
  transform: scale(1.08);
  box-shadow: 0 14px 30px rgba(14, 92, 59, 0.45);
}
.nbe-scroll-top-btn:active {
  transform: scale(0.92);
}

.btn-pop-enter-active,
.btn-pop-leave-active {
  transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.btn-pop-enter-from,
.btn-pop-leave-to {
  opacity: 0;
  transform: scale(0.6) translateY(12px);
}
</style>
