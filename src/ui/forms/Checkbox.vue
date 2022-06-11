<script setup lang="ts">
defineProps({
  label: String,
  modelValue: Boolean,
});

const emit = defineEmits(["update:modelValue"]);

function onChange(event: InputEvent) {
  emit("update:modelValue", (event.target as any).checked);
}
</script>

<template>
  <label>
    <span class="label">{{ label }}</span>
    <input type="checkbox" :checked="modelValue" :onchange="onChange" />
  </label>
</template>

<style scoped>
label {
  display: flex;
  justify-content: space-between;
}
</style>
