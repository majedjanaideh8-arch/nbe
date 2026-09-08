<template>
  <transition name="rejection-banner-fade">
    <div v-if="visible" class="rejection-banner" role="alert" aria-live="assertive">
      <div class="rejection-banner-inner">
        <div class="rejection-banner-icon-wrap">
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="white"
            stroke-width="2.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div class="rejection-banner-text">
          <div class="rejection-banner-title">{{ title }}</div>
          <div v-if="message" class="rejection-banner-message">{{ message }}</div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
interface Props {
  visible: boolean;
  title: string;
  message?: string;
}

withDefaults(defineProps<Props>(), {
  message: "",
});
</script>

<style scoped>
.rejection-banner {
  background: linear-gradient(135deg, #ff6b6b, #ee5a6f);
  border: none;
  border-radius: 12px;
  padding: 16px 20px;
  margin-top: 16px;
  margin-bottom: 12px;
  box-shadow: 0 4px 15px rgba(238, 90, 111, 0.3);
  animation: slideDown 0.3s ease-out;
  width: 100%;
  box-sizing: border-box;
}

.rejection-banner-inner {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rejection-banner-icon-wrap {
  width: 42px;
  height: 42px;
  background: rgba(255, 255, 255, 0.25);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.rejection-banner-text {
  flex: 1;
  text-align: right;
  min-width: 0;
}

.rejection-banner-title {
  color: #ffffff;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 4px;
  line-height: 1.4;
}

.rejection-banner-message {
  color: rgba(255, 255, 255, 0.92);
  font-size: 13px;
  line-height: 1.5;
  font-weight: 500;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.rejection-banner-fade-enter-active {
  animation: slideDown 0.3s ease-out;
}

.rejection-banner-fade-leave-active {
  transition: all 0.25s ease-in;
}

.rejection-banner-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

@media (max-width: 480px) {
  .rejection-banner {
    padding: 14px 16px;
  }
  .rejection-banner-icon-wrap {
    width: 38px;
    height: 38px;
  }
  .rejection-banner-title {
    font-size: 14px;
  }
  .rejection-banner-message {
    font-size: 12.5px;
  }
}
</style>
