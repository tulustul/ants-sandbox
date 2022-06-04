<script setup lang="ts">
  import { defineProps } from 'vue';

  defineProps({
    label:String,
  })
</script>

<template>
  <div class="group">
    <h3>{{label}}</h3>
    <div class="fields"><slot/></div>
  </div>
</template>

<style scoped>
  .group {
    padding: 10px;
    padding-top: 0;
    border: 1px solid black;
    border-radius: 10px;
  }
  h3 {
    margin-bottom: 10px;
  }
  .fields {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }
</style>
