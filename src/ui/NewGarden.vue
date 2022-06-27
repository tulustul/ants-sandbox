<script setup lang="ts">
import { inject, ref } from "vue";
import type { Simulation } from "./simulation";
import { state } from "./state";
import { defaultGardenSettings } from "@/life/settings";
import { transferFields } from "@/utils/object";
import {
  RadioGroup,
  RadioOption,
  FieldGroup,
  Checkbox,
  Slider,
} from "@/ui/forms";

const simulation = inject<Simulation>("simulation")!;

const imageFile = ref();

function makeNewGarden() {
  simulation.restart();
}

function reset() {
  transferFields(state.gardenSettings, defaultGardenSettings);
}

function onImageChange(event: Event) {
  state.imageFile = (event as any).target.files[0];
}
</script>

<template>
  <button class="btn btn-primary" :onclick="makeNewGarden">New garden</button>

  <RadioGroup v-model="state.gardenSettings.type">
    <RadioOption label="Random" value="random" />
    <RadioOption label="Empty" value="empty" />
    <RadioOption label="Image" value="image" />
  </RadioGroup>

  <FieldGroup label="Image" v-if="state.gardenSettings.type === 'image'">
    <input type="file" ref="imageFile" :onchange="onImageChange" />

    <p>
      Red channel - rock.<br />
      Green channel - food.<br />
      <br />
      Maximum resolution - 500x500px
    </p>
  </FieldGroup>

  <FieldGroup label="Size" v-if="state.gardenSettings.type !== 'image'">
    <Slider
      label="Garden width"
      v-model="state.gardenSettings.width"
      :default="defaultGardenSettings.width"
      :min="1000"
      :max="15000"
      :step="1000"
    />

    <Slider
      label="Garden height"
      v-model="state.gardenSettings.height"
      :default="defaultGardenSettings.height"
      :min="1000"
      :max="15000"
      :step="1000"
    />
  </FieldGroup>

  <FieldGroup label="Colonies" v-if="state.gardenSettings.type !== 'empty'">
    <Slider
      label="Number of colonies"
      v-model="state.gardenSettings.numberOfColonies"
      :default="defaultGardenSettings.numberOfColonies"
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

  <FieldGroup
    label="Food"
    v-if="state.gardenSettings.type !== 'empty'"
    :contentVisible="state.gardenSettings.foodEnabled"
  >
    <template v-slot:header>
      <input type="checkbox" v-model="state.gardenSettings.foodEnabled" />
    </template>

    <Slider
      label="Scale"
      v-if="state.gardenSettings.type === 'random'"
      v-model="state.gardenSettings.foodScale"
      :default="defaultGardenSettings.foodScale"
      :min="0.01"
      :max="1"
      :step="0.01"
      tooltip="Overall scale of food and distance between patches."
    />

    <Slider
      label="Coverage"
      v-model="state.gardenSettings.foodSize"
      :default="defaultGardenSettings.foodSize"
      :min="0.3"
      :max="0.7"
      :step="0.01"
      tooltip="How much of the map is covered with food."
    />

    <Slider
      label="Richness"
      v-model="state.gardenSettings.foodRichness"
      :default="defaultGardenSettings.foodRichness"
      :min="1"
      :max="100"
      :step="1"
      tooltip="How much units of food a single pixel holds."
    />
  </FieldGroup>

  <FieldGroup
    label="Rocks"
    v-if="state.gardenSettings.type !== 'empty'"
    :contentVisible="state.gardenSettings.rockEnabled"
  >
    <template v-slot:header>
      <input type="checkbox" v-model="state.gardenSettings.rockEnabled" />
    </template>

    <Slider
      label="Scale"
      v-if="state.gardenSettings.type === 'random'"
      v-model="state.gardenSettings.rockScale"
      :default="defaultGardenSettings.rockScale"
      :min="0.1"
      :max="2"
      :step="0.1"
      tooltip="Overall scale of rocks and distance between them."
    />

    <Slider
      label="Coverage"
      v-model="state.gardenSettings.rockSize"
      :default="defaultGardenSettings.rockSize"
      :min="0"
      :max="0.5"
      :step="0.01"
      tooltip="How much of the map is covered with rocks."
    />
  </FieldGroup>

  <div v-if="state.gardenSettings.type === 'random'">
    <Checkbox
      label="Horizontal mirror"
      v-model="state.gardenSettings.horizontalMirror"
    />
    <Checkbox
      label="Vertical mirror"
      v-model="state.gardenSettings.verticalMirror"
    />
  </div>

  <button class="btn" :onclick="reset">Reset to defaults</button>
</template>

<style></style>
