<script setup lang="ts">
import { inject } from "vue";
import type { Simulation } from "./simulation";
import Slider from "./forms/Slider.vue";
import { state } from "./state";
import { defaultGardenSettings } from "@/life/settings";
import Checkbox from "./forms/Checkbox.vue";
import FieldGroup from "./forms/FieldGroup.vue";
import { transferFields } from "@/utils/object";

const simulation = inject<Simulation>("simulation")!;

function makeNewGarden() {
  simulation.restart();
}

function reset() {
  transferFields(state.gardenSettings, defaultGardenSettings);
}
</script>

<template>
  <button class="btn btn-primary" :onclick="makeNewGarden">New garden</button>

  <FieldGroup>
    <Slider
      label="Garden width"
      v-model="state.gardenSettings.width"
      :default="defaultGardenSettings.width"
      :min="1000"
      :max="20000"
      :step="1000"
    />

    <Slider
      label="Garden height"
      v-model="state.gardenSettings.height"
      :default="defaultGardenSettings.height"
      :min="1000"
      :max="20000"
      :step="1000"
    />
  </FieldGroup>

  <FieldGroup>
    <Slider
      label="Number of nests"
      v-model="state.gardenSettings.numberOfNests"
      :default="defaultGardenSettings.numberOfNests"
      :min="1"
      :max="5"
      :step="1"
    />

    <Slider
      label="Number of ants at start"
      v-model="state.gardenSettings.startingAnts"
      :default="defaultGardenSettings.startingAnts"
      :min="1"
      :max="2000"
      :step="20"
    />

    <Slider
      label="Colony size limit"
      v-model="state.gardenSettings.colonySizeLimit"
      :default="defaultGardenSettings.colonySizeLimit"
      :min="100"
      :max="2000"
      :step="50"
    />
  </FieldGroup>

  <FieldGroup>
    <Checkbox label="Food enabled" v-model="state.gardenSettings.foodEnabled" />

    <Slider
      label="Food scale"
      v-model="state.gardenSettings.foodScale"
      :default="defaultGardenSettings.foodScale"
      :min="0.01"
      :max="1"
      :step="0.01"
    />

    <Slider
      label="Food size"
      v-model="state.gardenSettings.foodSize"
      :default="defaultGardenSettings.foodSize"
      :min="0.3"
      :max="0.7"
      :step="0.01"
    />

    <Slider
      label="Food richness"
      v-model="state.gardenSettings.foodRichness"
      :default="defaultGardenSettings.foodRichness"
      :min="1"
      :max="100"
      :step="1"
    />
  </FieldGroup>

  <FieldGroup>
    <Checkbox label="Rock enabled" v-model="state.gardenSettings.rockEnabled" />

    <Slider
      label="Rock scale"
      v-model="state.gardenSettings.rockScale"
      :default="defaultGardenSettings.rockScale"
      :min="0.1"
      :max="2"
      :step="0.1"
    />

    <Slider
      label="Rock size"
      v-model="state.gardenSettings.rockSize"
      :default="defaultGardenSettings.rockSize"
      :min="0"
      :max="0.5"
      :step="0.01"
    />
  </FieldGroup>

  <button class="btn" :onclick="reset">Reset All</button>
</template>

<style></style>
