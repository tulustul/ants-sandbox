<script setup lang="ts">
import { inject } from "vue";
import type { RadioGroupState } from "./state";

const props = defineProps({
  label: String,
  value: {
    type: String,
    required: true,
  },
});

const state = inject<RadioGroupState>("radioProvider")!;

function select() {
  state.value = props.value;
}
</script>

<template>
  <div
    class="radio"
    role="button"
    :onclick="select"
    :class="{ selected: state.value === value }"
  >
    {{ label }}
  </div>
</template>

<style scoped>
.radio {
  background-color: var(--field-color);
  flex: 1;
  text-align: center;
  padding: 3px 10px;
  cursor: pointer;
  display: flex;
  justify-content: center;
  align-items: center;
}
.radio:not(:last-child) {
  border-right: var(--border-width) solid var(--field-color-hover);
}
.radio:not(.selected):hover {
  --field-color: var(--field-color-hover);
}
.radio:not(.selected):active,
.selected {
  box-shadow: inset 0 0 10px 0px rgba(0, 0, 0, 0.4);
}
.selected {
  --field-color: var(--field-primary-color);
}
.radio:first-child {
  border-radius: 10px 0 0 10px;
}
.radio:last-child {
  border-radius: 0 10px 10px 0;
}
</style>
