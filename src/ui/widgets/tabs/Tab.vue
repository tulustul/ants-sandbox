<script setup lang="ts">
import { computed } from "vue";
import { inject, onBeforeMount } from "vue";
import type { TabsState } from "./tabsState";

const props = defineProps({
  label: {
    type: String,
    required: true,
  },
  decorations: {
    type: Boolean,
    default: true,
  },
  paddings: {
    type: Boolean,
    default: true,
  },
});

const tabsProvider = inject<TabsState>("tabsProvider")!;

const isVisible = computed(() => tabsProvider.selectedTab === props.label);

onBeforeMount(() => {
  if (tabsProvider.selectFirst && !tabsProvider.selectedTab) {
    tabsProvider.selectedTab = props.label;
  }
  tabsProvider.tabs.push(props.label);
});
</script>

<template>
  <section class="tab" :class="{ decorations, paddings }" v-if="isVisible">
    <slot />
  </section>
</template>

<style scoped>
.tab {
  display: flex;
  flex-direction: column;
  width: 350px;
  max-width: 100%;
  max-height: calc(100vh - 130px);
  overflow-y: auto;
  gap: 10px;
}
.paddings {
  padding: 10px;
}
.decorations {
  background-color: var(--tab-active-background);
  border: var(--border-width) solid var(--border-color);
  border-top: 0;
  border-radius: 0 0 10px 10px;
  backdrop-filter: var(--filter);
  margin-left: calc(var(--border-width) * -1);
}
@media only screen and (max-width: 450px) {
  .tab {
    border-right: 0;
    border-bottom-right-radius: 0;
  }
}
</style>
