<template>
  <section class="section">
    <div class="container">
      <div class="section-title" :class="{ center }">
        <span v-if="eyebrow" class="badge">
          {{ eyebrow }}
        </span>
        <h1 v-if="level === 1">{{ title }}</h1>
        <h2 v-else>{{ title }}</h2>
        <p v-if="description">{{ description }}</p>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
  description?: string;
  eyebrow?: string;
  center?: boolean;
  level?: 1 | 2;
}>();
</script>

<style scoped>
.section {
  padding-bottom: 8px;
}

h1,
h2 {
  margin-top: 14px;
  font-size: clamp(1.9rem, 3vw, 3.1rem);
}
</style>
