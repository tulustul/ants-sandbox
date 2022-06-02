<script setup lang="ts">
import { provide, reactive, type ComponentInternalInstance } from 'vue';
import type { TabsState } from './tabsState';

  const state: TabsState = reactive({
    selectedTab: '',
    tabs: [],
  });

  provide('tabsProvider', state);

  function openTab(tab: string) {
    if (state.selectedTab === tab) {
      tab = ''
    }
    state.selectedTab = tab
  }
</script>

<template>
<section>
  <div class="tabs">
    <div
      role="button"
      class="tab"
      :class="{active: state.selectedTab === tab}"
      v-for="tab in state.tabs"
      :onclick="() => openTab(tab)"
    >
      {{tab}}
    </div>
  </div>
  <slot/>
</section>

</template>

<style scoped>
section {
  display: flex;
}
.tabs {
  display: flex;
  flex-direction: column;
  justify-content: stretch;
}
.tab {
  flex: 1;
  text-align: center;
  padding: 10px;
  cursor: pointer;
  min-height: 50px;
  max-height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.tab:not(.active):hover {
  background-color: rgba(0,0,0,0.4);
}
.tab:not(.active) {
  background-color: rgba(0,0,0,0.8);
  border-bottom: 1px solid grey;

}
</style>
