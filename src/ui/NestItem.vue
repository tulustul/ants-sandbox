<script setup lang="ts">
import { ref } from "vue";
import { useIntervalFn } from "@vueuse/core";

import { Nest } from "@/life/nest";
import { colorToHexString } from "@/utils/colors";
import { state } from "./state";

const props = defineProps({
  nest: { type: Nest, required: true },
});

const antsCount = ref(props.nest.ants.length);

useIntervalFn(() => (antsCount.value = props.nest.ants.length), 200);

const backgroundColor = colorToHexString(props.nest.color);

function track() {
  state.trackedNest = props.nest.id;
}
</script>

<template>
  <h3
    class="row"
    role="button"
    :onclick="track"
    :class="{ tracked: nest.id === state.trackedNest }"
  >
    <span class="item-left">
      <span class="color-box" :style="{ backgroundColor }" />
      <span>Nest #{{ nest.id }}</span>
    </span>
    <span>{{ antsCount }} Ants</span>
  </h3>
</template>

<style scoped>
.row {
  justify-content: space-between;
  background-color: var(--field-color);
  border-radius: 10px;
  padding: 0 5px;
  cursor: pointer;
}
.row:active,
.tracked {
  box-shadow: inset 0 0 10px 0px rgba(0, 0, 0, 0.4);
}
.row.tracked {
  background-color: var(--field-primary-color);
}
.row:hover:not(.tracked) {
  --field-color: var(--field-color-hover);
}
.color-box {
  width: 20px;
  height: 20px;
  border-radius: 50%;
}
.item-left {
  display: flex;
  align-items: center;
  gap: 10px;
}
</style>
