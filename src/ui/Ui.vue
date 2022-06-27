<script setup lang="ts">
import Stats from "./Stats.vue";
import Menu from "./Menu.vue";
import Controls from "./Controls.vue";
import Zoom from "./Zoom.vue";
import DrawButton from "./DrawButton.vue";
</script>

<template>
  <Stats class="top-right" />
  <div class="top-left">
    <Menu />
    <DrawButton />
  </div>
  <Controls class="bottom-left" />
  <Zoom class="bottom-right" />
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
