<template>
  <transition name="splash-fade">
    <div
      v-if="isVisible"
      class="nbe-splash-screen"
      role="status"
      aria-live="polite"
      aria-label="جاري التحميل"
    >
      <img
        src="/assets/logo-loading-transparent.png"
        alt="NBE Mobile"
        class="nbe-splash-logo-img"
        fetchpriority="high"
      />
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";

const isVisible = ref(true);

onMounted(() => {
  // Splash screen stays for 2.5s then smoothly transitions away
  setTimeout(() => {
    isVisible.value = false;
  }, 2500);
});
</script>

<style scoped>
.nbe-splash-screen {
  position: fixed;
  inset: 0;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  padding: 1.5rem;
  background: #ffffff;
  font-family: "Cairo", "Segoe UI", Tahoma, Arial, sans-serif;
  direction: rtl;
}

.nbe-splash-logo-img {
  display: block;
  width: clamp(110px, 22vw, 180px);
  max-width: 100%;
  max-height: min(28vh, 160px);
  height: auto;
  object-fit: contain;
  background: transparent;
  border: 0;
  box-shadow: none;
  filter: none;
  animation: nbe-logo-pulse 2.2s ease-in-out infinite;
  transform-origin: center;
  will-change: transform;
}

@keyframes nbe-logo-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.025);
  }
}

.splash-fade-leave-active {
  transition: opacity 0.45s ease;
}

.splash-fade-leave-to {
  opacity: 0;
}

@media (max-width: 480px) {
  .nbe-splash-screen {
    padding: 1.25rem;
  }

  .nbe-splash-logo-img {
    width: min(100%, 150px);
  }
}

@media (prefers-reduced-motion: reduce) {
  .nbe-splash-logo-img {
    animation: none;
  }
}
</style>
