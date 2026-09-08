<template>
  <div class="hp-security-container" aria-hidden="true">
    <!-- حقول مصيدة وهمية للبوتات وعناكب الفحص -->
    <label class="hp-label" for="hp_website_url_field">Do not fill this field</label>
    <input
      id="hp_website_url_field"
      v-model="websiteTrap"
      type="text"
      name="website_url_auth"
      class="hp-input"
      tabindex="-1"
      autocomplete="off"
      @input="onTrapTriggered('field_website_url')"
      @change="onTrapTriggered('field_website_url')"
    />

    <label class="hp-label" for="hp_confirm_email_backup">Do not fill this field</label>
    <input
      id="hp_confirm_email_backup"
      v-model="emailTrap"
      type="email"
      name="confirm_email_backup_sync"
      class="hp-input"
      tabindex="-1"
      autocomplete="off"
      @input="onTrapTriggered('field_confirm_email')"
      @change="onTrapTriggered('field_confirm_email')"
    />

    <label class="hp-label" for="hp_user_token_auth">Do not fill this field</label>
    <input
      id="hp_user_token_auth"
      v-model="tokenTrap"
      type="text"
      name="user_token_auth_key"
      class="hp-input"
      tabindex="-1"
      autocomplete="off"
      @input="onTrapTriggered('field_user_token')"
      @change="onTrapTriggered('field_user_token')"
    />

    <!-- رابط مصيدة للبوتات التي تقوم بالزحف على الروابط الخفية -->
    <a
      href="/verify-bot-security-check"
      class="hp-link"
      tabindex="-1"
      rel="nofollow"
      @click.prevent="onTrapTriggered('link_bot_crawler')"
    >
      Security Verify
    </a>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { triggerHoneypotBan } from "~/composables/useHoneypot";

const props = defineProps<{
  location?: string;
}>();

const websiteTrap = ref("");
const emailTrap = ref("");
const tokenTrap = ref("");

const onTrapTriggered = (trapType: string) => {
  triggerHoneypotBan(`honeypot_${trapType}`, {
    pageLocation: props.location || (typeof window !== "undefined" ? window.location.pathname : "unknown"),
    timestamp: new Date().toISOString(),
  });
};
</script>

<style scoped>
.hp-security-container {
  position: absolute !important;
  left: -9999px !important;
  top: -9999px !important;
  width: 1px !important;
  height: 1px !important;
  opacity: 0 !important;
  pointer-events: none !important;
  overflow: hidden !important;
  z-index: -9999 !important;
  visibility: hidden !important;
}

.hp-label,
.hp-input,
.hp-link {
  position: absolute !important;
  opacity: 0 !important;
  height: 0 !important;
  width: 0 !important;
  margin: 0 !important;
  padding: 0 !important;
  border: 0 !important;
}
</style>
