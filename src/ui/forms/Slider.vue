<script setup lang="ts">
import { RefreshIcon } from "@heroicons/vue/solid";

const props = defineProps({
  label: String,
  modelValue: Number,
  default: Number,
  min: Number,
  max: Number,
  step: Number,
});

const emit = defineEmits(["update:modelValue"]);

function onChange(event: InputEvent) {
  emit("update:modelValue", parseFloat((event.target as any).value));
}

function onDefault() {
  emit("update:modelValue", props.default);
}
</script>

<template>
  <label>
    <span class="label">{{ label }}</span>
    <div class="row">
      <input
        class="grow"
        type="range"
        :value="modelValue"
        :min="min"
        :max="max"
        :step="step"
        :oninput="onChange"
      />
      <input
        class="short"
        type="number"
        :step="step"
        :value="modelValue"
        :onchange="onChange"
      />
      <button
        v-if="props.default !== undefined"
        class="btn btn-icon"
        :onclick="onDefault"
      >
        <RefreshIcon />
      </button>
    </div>
  </label>
</template>

<style scoped>
label {
  background-color: var(--field-color);
  padding: 7px;
  margin-top: 10px;
  border-radius: 50px;
  position: relative;
}
.label {
  position: absolute;
  top: -35%;
  background-color: var(--label-color);
  font-size: 12px;
  border-radius: 10px;
  padding: 0 10px;
}
.btn-icon {
  background-color: rgba(0, 0, 0, 0.2);
}
</style>
