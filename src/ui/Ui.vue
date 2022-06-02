<script setup lang="ts">
  import Stats from './Stats.vue';
  import Menu from './Menu.vue';
  import Controls from './Controls.vue';
</script>

<template>
  <Stats class="top-right"/>
  <Menu class="top-left"/>
  <Controls class="bottom-left"/>
</template>

<style>
  .top-left {
    position: absolute;
    left: 0;
    top: 0;
  }
  .top-right {
    position: absolute;
    right: 0;
    top: 0;
  }
  .bottom-left {
    position: absolute;
    left: 0;
    bottom: 0;
  }
</style>


