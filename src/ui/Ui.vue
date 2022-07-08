<script setup lang="ts">
import Stats from "./Stats.vue";
import Menu from "./Menu.vue";
import Controls from "./Controls.vue";
import Zoom from "./Zoom.vue";
import DrawButton from "./DrawButton.vue";
import Tour from "./Tour.vue";
import { state } from "./state";
import Welcome from "./Welcome.vue";
</script>

<template>
  <Tour />
  <Stats class="top-right" />
  <Controls class="bottom-left" />

  <template v-if="!state.tourMode">
    <div class="top-left">
      <Menu />
      <DrawButton />
    </div>
    <Zoom class="bottom-right" />
  </template>

  <Welcome v-if="!state.isWelcomed" />
</template>

<style>
.top-left {
  position: absolute;
  left: 0;
  top: 0;
  display: flex;
  gap: 10px;
}
.top-right {
  position: absolute;
  right: 0;
  top: 0;
}
.bottom-left {
  position: fixed;
  left: 5px;
  bottom: 5px;
}
.bottom-right {
  position: fixed;
  right: 5px;
  bottom: 5px;
}
</style>
