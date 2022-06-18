<script setup lang="ts">
import { provide, reactive } from "vue";
import type { TabsState } from "./tabsState";

const state: TabsState = reactive({
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
  <section>
    <div class="tabs">
      <div class="tabs-inner">
        <div
          role="button"
          class="tab"
          :class="{ active: state.selectedTab === tab }"
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
  --tab-active-background: var(--content-background-color);
}
.tabs {
  max-height: 60vh;
  overflow-y: auto;
  z-index: 1;
}
.tabs-inner {
  backdrop-filter: var(--filter);
  display: flex;
  flex-direction: column;
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
  border-right-color: transparent;
}
.tab:not(.active):hover {
  background-color: var(--tab-hover-background);
}
.tab:not(.active) {
  background-color: var(--tab-inactive-background);
}
</style>
