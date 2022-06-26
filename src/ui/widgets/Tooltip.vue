<script setup lang="ts">
import { InformationCircleIcon } from "@heroicons/vue/solid";
import { computed } from "vue";
import { ref, watch } from "vue";

const btnRef = ref<HTMLElement>();
const isHovered = ref(false);
const isToggled = ref(false);
const isShowing = computed(() => isHovered.value || isToggled.value);
const style = ref();

watch(isShowing, () => {
  if (!isShowing.value) {
    return;
  }
  const box = btnRef.value?.getBoundingClientRect()!;
  let left = box.left + box.width / 2;
  const overflow = left + 250 > window.outerWidth;
  if (overflow) {
    left -= left + 250 - window.outerWidth;
  }
  if (left < 125) {
    left = 125;
  }

  let topTransform = "-100%";
  let top = box.top;
  if (box.top < 100) {
    topTransform = "10px";
    top = box.bottom;
  }

  style.value = {
    left: `${left}px`,
    top: `${top}px`,
    transform: `translate(${overflow ? "0" : "-50%"}, ${topTransform})`,
  };
});
</script>

<template>
  <div class="wrapper">
    <button
      ref="btnRef"
      class="btn btn-icon"
      @click="isToggled = !isToggled"
      @mouseenter="isHovered = true"
      @mouseleave="isHovered = false"
    >
      <InformationCircleIcon />
    </button>
    <Teleport v-if="isShowing" to="body">
      <div class="tooltip" :style="style" @click="isToggled = false">
        <slot />
        <div v-if="isToggled" class="toggle-info">(click to close)</div>
      </div>
    </Teleport>
  </div>
</template>

<style scoped>
.wrapper {
  position: relative;
}
.tooltip {
  position: absolute;
  z-index: 30;
  max-width: 250px;
  margin-top: -5px;
  background-color: black;
  padding: 10px;
  border-radius: 10px;
  border: var(--border-width) solid var(--border-color);
  box-shadow: 0 0 5px 0 #000000;
  font-size: 14px;
}
.toggle-info {
  text-align: right;
  font-size: 12px;
  font-weight: 300;
  color: lightgray;
}
</style>
