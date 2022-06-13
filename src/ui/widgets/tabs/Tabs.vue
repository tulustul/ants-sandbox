<script setup lang="ts">
import { provide, reactive, type PropType } from "vue";
import type { TabsState } from "./tabsState";

const props = defineProps({
  direction: {
    type: String as PropType<"vertical" | "horizontal">,
    default: "vertical",
  },
  selectFirst: {
    type: Boolean,
    default: false,
  },
});

const state: TabsState = reactive({
  selectFirst: props.selectFirst,
  selectedTab: "",
  tabs: [],
});

provide("tabsProvider", state);

function openTab(tab: string) {
  if (state.selectedTab === tab) {
    tab = "";
  }
  state.selectedTab = tab;
}
</script>

<template>
  <section
    :class="direction"
    :style="{
      flexDirection: direction === 'horizontal' ? 'column' : 'row',
    }"
  >
    <div
      class="tabs"
      :style="{
        width: direction === 'horizontal' ? '100%' : 'auto',
      }"
    >
      <div
        class="tabs-inner"
        :style="{
          flexDirection: direction === 'horizontal' ? 'row' : 'column',
        }"
      >
        <div
          role="button"
          class="tab"
          :class="{ active: state.selectedTab === tab }"
          :style="{
            borderRightColor:
              state.selectedTab === tab && direction === 'vertical'
                ? 'transparent'
                : 'var(--border-color)',
            borderBottomColor:
              state.selectedTab === tab && direction === 'horizontal'
                ? 'transparent'
                : 'var(--border-color)',
          }"
          v-for="tab in state.tabs"
          v-bind:key="tab"
          :onclick="() => openTab(tab)"
        >
          {{ tab }}
        </div>
      </div>
    </div>
    <slot />
  </section>
</template>

<style scoped>
section {
  display: flex;
  --filter: blur(15px);
  --tab-inactive-background: rgba(20, 20, 20, 0.8);
  --tab-hover-background: rgba(40, 40, 40, 0.8);
  --tab-active-background: rgba(50, 50, 50, 0.8);
}
.tabs {
  max-height: 60vh;
  overflow-y: auto;
  z-index: 1;
}
.tabs-inner {
  backdrop-filter: var(--filter);
  display: flex;
  justify-content: stretch;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 10px;
  cursor: pointer;
  min-height: 40px;
  max-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-right: var(--border-width) solid var(--border-color);
  border-bottom: var(--border-width) solid var(--border-color);
}
.tab.active {
  background-color: var(--tab-active-background);
}
.tab:not(.active):hover {
  background-color: var(--tab-hover-background);
}
.tab:not(.active) {
  background-color: var(--tab-inactive-background);
}
</style>
