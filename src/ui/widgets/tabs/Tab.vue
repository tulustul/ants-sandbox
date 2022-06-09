<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { inject, onBeforeMount,getCurrentInstance } from 'vue';
import type { TabsState } from './tabsState';

const props = defineProps({
  label:String,
})

const tabsProvider = inject<TabsState>('tabsProvider')!

const isVisible = computed(()=>tabsProvider.selectedTab===props.label);

onBeforeMount(() => {
  tabsProvider.tabs.push(props.label!)
})
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
  width:350px;
  max-width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  gap: 10px
}
</style>
