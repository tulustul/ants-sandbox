<script setup lang="ts">
import { Tabs, Tab } from "./widgets";
import Simulation from "./Simulation.vue";
import Draw from "./Draw.vue";
import Maps from "./maps/Maps.vue";
import Visuals from "./Visuals.vue";
import Colonies from "./colonies/Colonies.vue";
import NewGarden from "./NewGarden.vue";
import ColoniesStats from "./ColoniesStats.vue";
</script>

<template>
  <div class="menu">
    <Tabs>
      <Tab label="New">
        <NewGarden />
      </Tab>
      <Tab label="Maps">
        <Maps />
      </Tab>
      <Tab label="Draw">
        <Draw />
      </Tab>
      <Tab label="Colonies">
        <Colonies />
      </Tab>
      <Tab label="Stats">
        <ColoniesStats />
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
