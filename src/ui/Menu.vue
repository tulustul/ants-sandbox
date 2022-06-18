<script setup lang="ts">
import { Tabs, Tab } from "./widgets";
import Simulation from "./Simulation.vue";
import Draw from "./Draw.vue";
import Maps from "./maps/Maps.vue";
import Visuals from "./Visuals.vue";
import Nests from "./Nests.vue";
import Garden from "./Garden.vue";
import NestsStats from "./NestsStats.vue";
</script>

<template>
  <div class="menu">
    <Tabs>
      <Tab label="Garden">
        <Garden />
      </Tab>
      <Tab label="Maps">
        <Maps />
      </Tab>
      <Tab label="Draw">
        <Draw />
      </Tab>
      <Tab label="Nests">
        <Nests />
      </Tab>
      <Tab label="Stats">
        <NestsStats />
      </Tab>
      <Tab label="Sim">
        <Simulation />
      </Tab>
      <Tab label="Visuals">
        <Visuals />
      </Tab>
    </Tabs>
  </div>
</template>

<style>
.menu {
  max-width: 100vw;
}
</style>
