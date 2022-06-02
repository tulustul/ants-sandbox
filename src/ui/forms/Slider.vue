<script setup lang="ts">
  import { defineProps } from 'vue';

  const props= defineProps({
    label:String,
    modelValue:Number,
    default:Number,
    min:Number,
    max:Number,
    step:Number,
  })

  const emit = defineEmits(['update:modelValue'])

  function onChange(event:InputEvent) {
    emit('update:modelValue', parseFloat((event.target as any).value));
  }

  function onDefault() {
    emit('update:modelValue', props.default);
  }
</script>

<template>
  <label>
    <span class="label">{{label}}</span>
    <div class="row">
      <input class="grow" type="range" :value="modelValue" :min="min" :max="max" :step="step" :oninput="onChange">
      <input class="short" type="number" :value="modelValue" :onchange="onChange">
      <button v-if="props.default !== undefined" class="reset-btn" :onclick="onDefault">R</button>
    </div>
  </label>
</template>

<style>
  label {
    background-color: rgb(80,80,80);
    padding: 7px;
    margin-top: 10px;
    border-radius: 50px;
    border: 2px solid rgb(40,40,40);;
    position: relative;
  }
  .label {
    position: absolute;
    top: -35%;
    background-color: steelblue;
    font-size: 12px;
    border-radius: 10px;
    padding: 0 10px;
  }
  .reset-btn {
    border-radius: 50%;
  }
</style>
