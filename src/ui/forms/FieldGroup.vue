<script setup lang="ts">
defineProps({
  label: String,
});
</script>

<template>
  <div class="group">
    <h3>{{ label }}</h3>
    <div class="fields">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.group {
  padding: 10px;
  padding-top: 0;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.1);
}
h3 {
  margin-bottom: 10px;
}
.fields {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
