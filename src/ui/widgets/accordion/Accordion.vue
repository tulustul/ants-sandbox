<script setup lang="ts">
import { provide, reactive } from "vue";
import type { AccordionState } from "./types";

const props = defineProps({
  openedByDefault: String,
});

const state: AccordionState = reactive({
  items: [],
  openedItem: props.openedByDefault ?? "",
});

provide("accordionProvider", state);
</script>

<template>
  <div class="accordion">
    <slot />
  </div>
</template>

<style scoped>
.accordion {
  margin: 0 -10px -10px -10px;
}
</style>
