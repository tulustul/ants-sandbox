<script setup lang="ts">
import { inject, ref, watch } from "vue";
import { useIntervalFn } from "@vueuse/core";

import { state } from "./state";
import FieldGroup from "./forms/FieldGroup.vue";
import Slider from "./forms/Slider.vue";
import { vExplode } from "./widgets";
import { AntType } from "@/life/ant";
import type { Simulation } from "./simulation";

const simulation = inject<Simulation>("simulation")!;

let nest = getTrackedNest()!;

const stats = ref(nest.stats);
const warCoef = ref(nest.warCoef);

const freedom = ref(nest.freedom);
const aggresiveness = ref(nest.aggresiveness);

watch(state, () => {
  if (!state.trackedNest) {
    return;
  }
  nest = getTrackedNest()!;
  freedom.value = nest.freedom;
  aggresiveness.value = nest.aggresiveness;
});
watch(freedom, () => (nest.freedom = freedom.value));
watch(aggresiveness, () => (nest.aggresiveness = aggresiveness.value));

useIntervalFn(() => {
  stats.value = { ...nest.stats };
  warCoef.value = nest.warCoef;
}, 200);

function getTrackedNest() {
  return simulation.garden.nests.find((nest) => nest.id === state.trackedNest);
}

function destroyNest() {
  nest.destroy();
  state.trackedNest = null;
}

function addFood() {
  nest.addFood(1000);
}

function removeFood() {
  nest.removeFood(1000);
}

function addWorkers() {
  (nest as any).addAnts(AntType.worker, 100);
}

function removeWorkers() {
  nest.killAnts(AntType.worker, 100);
}

function addSoldiers() {
  nest.addAnts(AntType.soldier, 25);
}

function removeSoldiers() {
  nest.killAnts(AntType.soldier, 25);
}

function move() {
  state.movingNest = !state.movingNest;
}
</script>

<template>
  <div class="column">
    <FieldGroup label="Food">
      <div class="row space-between">
        <span
          >Current <strong>{{ stats.food.toFixed(0) }}</strong></span
        >
        <span
          >Total <strong>{{ stats.totalFood }}</strong></span
        >
      </div>

      <div class="row">
        <button class="btn btn-primary grow" v-explode :onclick="addFood">
          Add 1000 food
        </button>
        <button class="btn btn-danger grow" v-explode :onclick="removeFood">
          Remove 1000 food
        </button>
      </div>
    </FieldGroup>

    <FieldGroup label="Ants">
      <div class="row space-between">
        <span
          >Workers <strong>{{ stats.workers }}</strong></span
        >
        <span
          >Soldiers <strong>{{ stats.soldiers }}</strong></span
        >
      </div>

      <div class="row">
        <div class="column grow">
          <button class="btn btn-primary grow" v-explode :onclick="addWorkers">
            Add 100 workers
          </button>
          <button
            class="btn btn-danger grow"
            v-explode
            :onclick="removeWorkers"
          >
            Kill 100 workers
          </button>
        </div>
        <div class="column grow">
          <button class="btn btn-primary grow" v-explode :onclick="addSoldiers">
            Add 25 soldiers
          </button>
          <button
            class="btn btn-danger grow"
            v-explode
            :onclick="removeSoldiers"
          >
            Kill 25 soldiers
          </button>
        </div>
      </div>
    </FieldGroup>

    <FieldGroup label="Parameters">
      <Slider
        label="Ants freedom"
        v-model="freedom"
        :min="0.0002"
        :max="0.01"
        :step="0.0001"
      />

      <Slider
        label="Aggresiveness"
        v-model="aggresiveness"
        :min="0"
        :max="1"
        :step="0.01"
      />
    </FieldGroup>

    <FieldGroup label="Stats">
      <div class="row space-between">
        <span
          >Total ants <strong>{{ stats.totalAnts }}</strong></span
        >
        <span
          >Starved ants <strong>{{ stats.starvedAnts }}</strong></span
        >
      </div>
      <div class="row space-between">
        <span
          >Killed ants <strong>{{ stats.killedAnts }}</strong></span
        >
        <span
          >Killed enemy ants <strong>{{ stats.killedEnemyAnts }}</strong></span
        >
      </div>
      <span
        >War coefficient <strong>{{ warCoef.toFixed(3) }}</strong></span
      >
    </FieldGroup>

    <div class="row">
      <button class="btn grow" :onclick="move">
        <span v-if="state.movingNest">Click on the map...</span>
        <span v-else>Move</span>
      </button>
      <button class="btn btn-danger grow" :onclick="destroyNest">
        Destroy
      </button>
    </div>
  </div>
</template>

<style></style>
