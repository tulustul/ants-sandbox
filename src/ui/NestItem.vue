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
}
h3:hover:not(.tracked) {
  cursor: pointer;
  background-color: #444;
}
.color-box {
  width: 30px;
  height: 30px;
}
.tracked {
  background-color: #666;
}
.item-left {
  display: flex;
  gap: 10px;
}
</style>
