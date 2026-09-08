<template>
  <div class="page nbe-shell">
    <main class="nbe-main-content">
      <slot />
    </main>

    <ScrollTopButton />
  </div>
</template>

<script setup lang="ts">
// Universal shell for the main content area
</script>

<style scoped>
.nbe-shell {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f6f7f6;
  font-family: "Cairo", "Segoe UI", Tahoma, Arial, sans-serif;
  direction: rtl;
}

.nbe-main-content {
  flex: 1;
}
</style>
