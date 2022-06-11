<script setup lang="ts">
import { computed } from "vue";
import { inject, onBeforeMount } from "vue";
import type { TabsState } from "./tabsState";

const props = defineProps({
  label: String,
});

const tabsProvider = inject<TabsState>("tabsProvider")!;

const isVisible = computed(() => tabsProvider.selectedTab === props.label);

onBeforeMount(() => {
  tabsProvider.tabs.push(props.label!);
});
</script>

<template>
  <section class="tab" v-if="isVisible">
    <slot />
  </section>
</template>

<style scoped>
.tab {
  display: flex;
  flex-direction: column;
  padding: 10px;
  width: 350px;
  max-width: 100%;
  max-height: calc(100vh - 130px);
  overflow-y: auto;
  gap: 10px;
  background-color: var(--tab-active-background);
  border: var(--border-width) solid var(--border-color);
  border-top: 0;
  border-radius: 0 0 10px 10px;
  margin-left: calc(var(--border-width) * -1);
  backdrop-filter: var(--filter);
}
@media only screen and (max-width: 450px) {
  .tab {
    border-right: 0;
    border-bottom-right-radius: 0;
  }
}
</style>
