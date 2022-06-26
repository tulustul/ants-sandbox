<script setup lang="ts">
import Tooltip from "../widgets/Tooltip.vue";
defineProps({
  label: String,
  contentVisible: {
    type: Boolean,
    default: true,
  },
  tooltip: String,
});
</script>

<template>
  <div class="group">
    <div class="row">
      <Tooltip v-if="tooltip">{{ tooltip }}</Tooltip>
      <label class="grow">
        <strong>
          {{ label }}
        </strong>
        <slot name="header"></slot>
      </label>
    </div>
    <div class="column" v-if="contentVisible">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.group {
  padding: 10px 10px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background-color: rgba(0, 0, 0, 0.1);
}
label {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 16px;
}
.column {
  margin-top: 10px;
}
</style>
