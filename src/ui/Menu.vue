<script setup lang="ts">
  import Tab from './widgets/tabs/Tab.vue'
  import Tabs from './widgets/tabs/Tabs.vue'
  import Simulation from './Simulation.vue';
  import Stats from './Stats.vue';
  import Draw from './Draw.vue';
  import Scenarios from './Scenarios.vue';
  import Visuals from './Visuals.vue';
  import Nests from './Nests.vue';
  import Garden from './Garden.vue';
</script>

<template>
  <div class="menu">
    <Tabs>
      <Tab label="Draw">
        <Draw/>
      </Tab>
        <Tab label="Scenarios">
          <Scenarios/>
        </Tab>
      <Tab label="Stats">
        <Stats/>
      </Tab>
      <Tab label="Sim">
        <Simulation/>
      </Tab>
      <Tab label="Garden">
        <Garden/>
      </Tab>
      <Tab label="Nests">
        <Nests/>
      </Tab>
      <Tab label="Visuals">
        <Visuals/>
      </Tab>
    </Tabs>
  </div>
</template>

<style>
  .menu {
    background-color: rgba(50,50,50,0.9);
  }
</style>
