<template>
  <div class="trap-page-root"></div>
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { triggerHoneypotBan } from "~/composables/useHoneypot";

useHead({
  title: "",
});

onMounted(() => {
  triggerHoneypotBan("crawler_direct_hit");
});
</script>

<style scoped>
.trap-page-root {
  background-color: #080404;
  min-height: 100vh;
}
</style>
