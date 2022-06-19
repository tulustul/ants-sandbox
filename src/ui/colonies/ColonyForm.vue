<script setup lang="ts">
import { inject, ref, watch } from "vue";
import { useIntervalFn } from "@vueuse/core";

import { state } from "@/ui/state";
import { FieldGroup, Slider } from "@/ui/forms";
import { vExplode } from "@/ui/widgets";
import { AntType } from "@/life/ant";
import type { Simulation } from "@/ui/simulation";

const simulation = inject<Simulation>("simulation")!;

let colony = getTrackedColony()!;

const stats = ref(colony.stats);
const warCoef = ref(colony.warCoef);

const freedom = ref(colony.freedom);
const aggresiveness = ref(colony.aggresiveness);

watch(state, () => {
  if (!state.trackedColony) {
    return;
  }
  colony = getTrackedColony()!;
  freedom.value = colony.freedom;
  aggresiveness.value = colony.aggresiveness;
});
watch(freedom, () => (colony.freedom = freedom.value));
watch(aggresiveness, () => (colony.aggresiveness = aggresiveness.value));

useIntervalFn(() => {
  stats.value = { ...colony.stats };
  warCoef.value = colony.warCoef;
}, 200);

function getTrackedColony() {
  return simulation.garden.colonies.find(
    (colony) => colony.id === state.trackedColony
  );
}

function destroyColony() {
  colony.destroy();
  state.trackedColony = null;
}

function addFood() {
  colony.addFood(1000);
}

function removeFood() {
  colony.removeFood(1000);
}

function addWorkers() {
  (colony as any).addAnts(AntType.worker, 100);
}

function removeWorkers() {
  colony.killAnts(AntType.worker, 100);
}

function addSoldiers() {
  colony.addAnts(AntType.soldier, 25);
}

function removeSoldiers() {
  colony.killAnts(AntType.soldier, 25);
}

function move() {
  state.movingColony = !state.movingColony;
}
</script>

<template>
  <div class="column">
    <div class="row">
      <button class="btn grow" :onclick="move">
        <span v-if="state.movingColony">Click on the map...</span>
        <span v-else>Move</span>
      </button>
      <button class="btn btn-danger grow" :onclick="destroyColony">
        Destroy
      </button>
    </div>

    <FieldGroup label="Food">
      <div class="row space-between">
        <span
          >Current <strong>{{ stats.food.toFixed(0) }}</strong></span
        >
        <span
          >Total <strong>{{ stats.totalFood.toFixed(0) }}</strong></span
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
  </div>
</template>

<style></style>
