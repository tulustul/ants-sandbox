<script setup lang="ts">
  import {inject, onMounted, ref} from 'vue'

  import type{Simulation} from './simulation';

  const name = ref('')

  const scenarios:Set<string> = new Set(JSON.parse(localStorage.getItem('scenarios') ?? '[]'))

  let simulation = inject<Simulation>('simulation')!;

  function dump() {
    if (!name.value) {
      return;
    }
    const dumpedSim = simulation.dump();
    localStorage.setItem(`scenario:${name.value}`, dumpedSim);
    scenarios.add(name.value)
    saveScenariosNames()
    name.value=''
  }

  function load(name:string) {
    const data = localStorage.getItem(`scenario:${name}`)!
    simulation.load(data);
  }

  function remove(name:string) {
    localStorage.removeItem(`scenario:${name}`)
    scenarios.delete(name);
    saveScenariosNames()
  }

  function saveScenariosNames() {
    localStorage.setItem('scenarios', JSON.stringify(Array.from(scenarios)));
  }
</script>

<template>
  <div class="row">
    <input class="grow" type="text" placeholder="Scenario name" v-model="name">
    <button class="btn" :onclick="dump">Save</button>
  </div>
  <div class="row" v-for="scenario in scenarios">
    <div class="grow">{{scenario}}</div>
    <button :onclick="()=>remove(scenario)">Remove</button>
    <button :onclick="()=>load(scenario)">Load</button>
  </div>
</template>

<style>
</style>
