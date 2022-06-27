<script setup lang="ts">
import { isMobile } from "@/utils/responsiveness";
import { state } from "./state";

function disableDrawing() {
  state.drawing.type = null;
  state.drawing.erasing = false;
}
</script>

<template>
  <div class="wrapper">
    <button
      class="btn btn-primary"
      v-if="state.drawing.type && isMobile()"
      @click="disableDrawing"
    >
      Stop drawing
    </button>
  </div>
</template>

<style scoped>
.wrapper {
  display: flex;
  align-items: flex-start;
  pointer-events: none;
}
.btn {
  pointer-events: all;
}
</style>
