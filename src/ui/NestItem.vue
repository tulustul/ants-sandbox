<script setup lang="ts">
  import { Nest } from '@/life/nest';
import { colorToHexString } from '@/utils/colors';
import { defineProps } from 'vue';
import { state } from './state';

  const props= defineProps({
    nest:{type:Nest,required:true},
  })

  const backgroundColor = colorToHexString(props.nest.color);

  function track() {
    state.trackedNest = props.nest.id;
  }
</script>

<template>
  <h3 class="row" :onclick="track" :class="{tracked: nest.id === state.trackedNest}">
    <div class="color-box" :style="{backgroundColor}"></div>Nest #{{nest.id}}
  </h3>
</template>

<style scoped>
  h3:hover:not(.tracked) {
    cursor: pointer;
    background-color: #444
  }
  .color-box {
    width: 30px;
    height: 30px;
  }
  .tracked {
    background-color: #666;
  }
</style>
