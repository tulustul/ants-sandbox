<script setup lang="ts">
import type { PropType } from "vue";
import { Slider } from "../forms";
import type { PheromoneVisualSettings } from "@/life/settings";
import FieldGroup from "../forms/FieldGroup.vue";

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
});
</script>

<template>
  <FieldGroup :label="label" :contentVisible="settings.enabled">
    <template v-if="toggleable" v-slot:header>
      <input type="checkbox" v-model="settings.enabled" />
    </template>

    <template v-if="settings.enabled">
      <Slider
        label="Exposure"
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
        label="Intensity"
        v-model="settings.intensity"
        :default="defaults.intensity"
        :min="0.0"
        :max="1"
        :step="0.01"
      />
    </template>
  </FieldGroup>
</template>

<style scoped></style>
