<script setup lang="ts">
import { inject, ref, type Ref } from "vue";

import { useIntervalFn } from "@vueuse/core";
import type { Simulation } from "./simulation";
import Tabs from "./widgets/tabs/Tabs.vue";
import Tab from "./widgets/tabs/Tab.vue";
import NestsChart from "./widgets/NestsChart.vue";
import type { Nest } from "@/life/nest";

const simulation = inject<Simulation>("simulation")!;

const nests = ref(simulation.garden.nests) as Ref<Nest[]>;

useIntervalFn(() => {
  nests.value = simulation.garden.nests;
}, 200);
</script>

<template>
  <Tabs direction="horizontal" :selectFirst="true">
    <Tab label="Current" :decorations="false">
      <NestsChart
        :nests="nests"
        label="Current food"
        field="food"
        :yAxisPrecision="0"
      />
      <NestsChart :nests="nests" label="Living ants" field="livingAnts" />
      <NestsChart :nests="nests" label="Workers" field="workers" />
    </Tab>

    <Tab label="Warfare" :decorations="false">
      <NestsChart :nests="nests" label="Killed ants" field="killedAnts" />
      <NestsChart
        :nests="nests"
        label="Killed enemy ants"
        field="killedEnemyAnts"
      />
      <NestsChart :nests="nests" label="Warriors" field="warriors" />
      <NestsChart
        :nests="nests"
        label="War coefficient"
        field="warCoef"
        :yAxisPrecision="3"
      />
    </Tab>

    <Tab label="Totals" :decorations="false">
      <NestsChart :nests="nests" label="Total food" field="totalFood" />
      <NestsChart :nests="nests" label="Total ants" field="totalAnts" />
      <NestsChart :nests="nests" label="Starved ants" field="starvedAnts" />
    </Tab>
  </Tabs>
</template>

<style scoped></style>
