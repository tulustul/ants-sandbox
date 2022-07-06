<script setup lang="ts">
import { inject, ref, watch } from "vue";
import { useIntervalFn } from "@vueuse/core";

import { AntType } from "@/simulation";
import { state } from "@/ui/state";
import { FieldGroup, Slider } from "@/ui/forms";
import { vExplode } from "@/ui/widgets";
import type { Simulation } from "@/ui/simulation";
import { Tooltip } from "@/ui/widgets";

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
        <div class="row">
          <Tooltip>
            Food currently stored in the nest.<br />
            Food is used to feed ants when they visit the nest. When enough food
            is accumulated, a new ant is being born. When the ants cannot be
            fed, they eventually die of hunger.
          </Tooltip>
          <span
            >Stored <strong>{{ stats.food.toFixed(0) }}</strong></span
          >
        </div>

        <div class="row">
          <span
            >Total <strong>{{ stats.totalFood.toFixed(0) }}</strong></span
          >
          <Tooltip> Total amount of food ever produced by the colony. </Tooltip>
        </div>
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
        <div class="row">
          <Tooltip>
            Workers seek for food, collect it and bring it to the nest. They
            cannot fight with other ants. When they see the enemy they flee to
            the nest.
          </Tooltip>
          <span
            >Workers <strong>{{ stats.workers }}</strong></span
          >
        </div>

        <div class="row">
          <span
            >Soldiers <strong>{{ stats.soldiers }}</strong></span
          >
          <Tooltip>
            The rate of soldiers birth depends on war coefficient. They follow
            "to enemy" pheromone and seek for enemies. Only soldiers can fight
            other ants.
          </Tooltip>
        </div>
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
        label="Aggresiveness"
        v-model="aggresiveness"
        :min="0"
        :max="1"
        :step="0.01"
        tooltip="The higher the value the faster war coefficient increases and the slower it decays."
      />
    </FieldGroup>

    <FieldGroup label="Stats">
      <div class="row space-between">
        <div class="row">
          <Tooltip>
            Total number of ants in the colony that every lived.
          </Tooltip>
          <span
            >Total ants <strong>{{ stats.totalAnts }}</strong></span
          >
        </div>

        <div class="row">
          <span
            >Starved ants <strong>{{ stats.starvedAnts }}</strong></span
          >
          <Tooltip> Number of ants that died because of starvation. </Tooltip>
        </div>
      </div>

      <div class="row space-between">
        <div class="row">
          <Tooltip>
            Number of ants in this colony that were killed by other ants.
          </Tooltip>
          <span
            >Killed <strong>{{ stats.killedAnts }}</strong></span
          >
        </div>

        <div class="row">
          <span
            >Kills <strong>{{ stats.killedEnemyAnts }}</strong></span
          >
          <Tooltip> Number of enemy ants killed by this colony. </Tooltip>
        </div>
      </div>
      <div class="row">
        <Tooltip>
          Increases when the ant that saw an enemy visits the nest. Higher
          values increase the chance of a soldier being born instead of a normal
          worker. Takes values between 0 and 1.
        </Tooltip>
        <span
          >War coefficient <strong>{{ warCoef.toFixed(3) }}</strong></span
        >
      </div>
    </FieldGroup>
  </div>
</template>

<style></style>
