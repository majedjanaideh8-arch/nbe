<template>
  <div class="card safe-note safe-notice">
    <p>{{ text }}</p>
  </div>
</template>

<script setup lang="ts">
defineProps({
  text: {
    type: String,
    default: "هذه نسخة frontend فقط؛ لا تطلب كلمات مرور أو رموز تحقق أو أرقام بطاقات.",
  },
});
</script>

<style scoped>
.safe-notice {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 18px;
}

.safe-notice p {
  margin: 0;
  line-height: 1.7;
  font-weight: 700;
}
</style>
