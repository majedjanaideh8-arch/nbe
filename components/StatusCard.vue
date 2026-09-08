<template>
  <div class="card status-panel">
    <div>
      <h2>{{ title }}</h2>
      <p class="muted">{{ description }}</p>
    </div>
    <div class="button-row">
      <NuxtLink v-if="primaryTo" :to="primaryTo" class="button primary">
        {{ primaryLabel }}
      </NuxtLink>
      <NuxtLink v-if="secondaryTo" :to="secondaryTo" class="button secondary">
        {{ secondaryLabel }}
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description: string;
  primaryTo?: string;
  primaryLabel?: string;
  secondaryTo?: string;
  secondaryLabel?: string;
}>();
</script>

<style scoped>
h2 {
  margin: 0 0 8px;
}

p {
  margin: 0;
  max-width: 620px;
}
</style>
