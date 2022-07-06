<script setup lang="ts">
import type { PropType } from "vue";

import type { PheromoneVisualSettings } from "@/simulation";
import { Slider, FieldGroup } from "@/ui/forms";

defineProps({
  label: {
    type: String,
    required: true,
  },
  settings: {
    type: Object as PropType<PheromoneVisualSettings>,
    required: true,
  },
  defaults: {
    type: Object as PropType<PheromoneVisualSettings>,
    required: true,
  },
  toggleable: {
    type: Boolean,
    default: true,
  },
  tooltip: {
    type: String,
    required: true,
  },
});
</script>

<template>
  <FieldGroup
    :label="label"
    :contentVisible="settings.enabled"
    :tooltip="tooltip"
  >
    <template v-if="toggleable" v-slot:header>
      <input type="checkbox" v-model="settings.enabled" />
    </template>

    <template v-if="settings.enabled">
      <Slider
        label="Brightness"
        v-model="settings.exposure"
        :default="defaults.exposure"
        :min="0.2"
        :max="5"
        :step="0.2"
      />
      <Slider
        label="Contrast"
        v-model="settings.contrast"
        :default="defaults.contrast"
        :min="0.4"
        :max="2"
        :step="0.1"
      />
      <Slider
        label="Density"
        v-model="settings.density"
        :default="defaults.density"
        :min="0.0"
        :max="1"
        :step="0.01"
        tooltip="A layer showing how often the path is used. Ants don't use this information. This is purely for presentational purposes."
      />
      <Slider
        label="Intensity"
        v-model="settings.intensity"
        :default="defaults.intensity"
        :min="0.0"
        :max="1"
        :step="0.01"
        tooltip="A layer showing the intensity of pheromone trails. This is the information used by ants to navigate. The longer the ant walks, the weaker trail it drops."
      />
    </template>
  </FieldGroup>
</template>

<style scoped></style>
