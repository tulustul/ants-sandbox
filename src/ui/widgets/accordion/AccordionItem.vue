<script setup lang="ts">
import { computed } from "vue";
import { ChevronDownIcon, ChevronUpIcon } from "@heroicons/vue/solid";
import { inject, onBeforeMount } from "vue";
import type { AccordionState } from "./types";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
});

const accordionProvider = inject<AccordionState>("accordionProvider")!;

const isVisible = computed(() => accordionProvider.openedItem === props.label);

onBeforeMount(() => {
  accordionProvider.items.push(props.label);
});

function toggleItem() {
  if (accordionProvider.openedItem === props.label) {
    accordionProvider.openedItem = "";
  } else {
    accordionProvider.openedItem = props.label;
  }
}
</script>

<template>
  <div class="item" role="button" @click="toggleItem">
    <span>{{ label }}</span>
    <ChevronUpIcon v-if="isVisible" />
    <ChevronDownIcon v-else />
  </div>

  <div v-if="isVisible" class="content">
    <div class="content-shadow shadow-top" />
    <slot />
    <div class="content-shadow shadow-bottom" />
  </div>
</template>

<style scoped>
.item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 18px;
  padding: 3px 10px;
  background-color: #444;
  cursor: pointer;
}
.item:not(:last-child) {
  border-bottom: 2px solid var(--border-color);
}
.item:hover {
  background-color: #555;
}
.item svg {
  width: 25px;
}
.content {
  background-color: rgba(0, 0, 0, 0.1);
  padding: 10px;
}
.content-shadow {
  position: absolute;
  left: 0;
  width: 100%;
  height: 20px;
  background: linear-gradient(#00000050, transparent);
  z-index: -1;
}
.shadow-top {
  top: 0;
}
.shadow-bottom {
  bottom: 0;
  transform: rotate(180deg);
}
</style>
