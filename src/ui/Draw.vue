<script setup lang="ts">
import { state, type DrawingType } from "./state";
import { Slider, Checkbox } from "./forms";
import { onUnmounted } from "vue";
import { isMobile } from "@/utils/responsiveness";

onUnmounted(() => {
  if (!isMobile()) {
    state.drawing.type = null;
    state.drawing.erasing = false;
  }
});

function toggleDraw(type: DrawingType) {
  if (state.drawing.type === type) {
    state.drawing.type = null;
  } else {
    state.drawing.type = type;
  }
}
</script>

<template>
  <div class="row">
    <button
      class="btn grow"
      :class="{ 'btn-primary': state.drawing.type === 'food' }"
      :onclick="() => toggleDraw('food')"
    >
      Draw food
    </button>
    <button
      class="btn grow"
      :class="{ 'btn-primary': state.drawing.type === 'rock' }"
      :onclick="() => toggleDraw('rock')"
    >
      Draw rock
    </button>

    <div class="eraser">
      <button
        class="btn"
        :class="{ 'btn-primary': state.drawing.erasing }"
        :onclick="() => (state.drawing.erasing = !state.drawing.erasing)"
      >
        Erase
      </button>
    </div>
  </div>

  <Slider
    label="Radius"
    v-model="state.drawing.radius"
    :min="1"
    :max="30"
    :step="1"
  />

  <Slider
    label="Food richness"
    v-if="state.drawing.type === 'food'"
    v-model="state.drawing.intensity"
    :min="1"
    :max="100"
    :step="1"
  />

  <Checkbox
    label="Horizontal mirror"
    v-model="state.drawing.horizontalMirror"
  />
  <Checkbox label="Vertical mirror" v-model="state.drawing.verticalMirror" />
</template>

<style scoped>
.eraser {
  padding-left: 10px;
  border-left: 2px solid var(--border-color);
}
</style>
