<script setup lang="ts">
import { computed, ref } from "vue";
import { ClipboardCopyIcon, CheckIcon } from "@heroicons/vue/solid";
import { useTimeoutFn } from "@vueuse/core";

const props = defineProps({
  crypto: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },
  shortAddress: String,
});

const copied = ref(false);
const expanded = ref(false);

const shortAddress = computed(() => {
  if (props.shortAddress) {
    return props.shortAddress;
  }
  if (props.address.length < 10) {
    return props.address;
  }
  return `${props.address.slice(0, 5)}…${props.address.slice(-5)}`;
});

function copy() {
  navigator.clipboard.writeText(props.address);
  copied.value = true;
  useTimeoutFn(() => {
    copied.value = false;
  }, 1000);
}

function toggle() {
  expanded.value = !expanded.value;
}
</script>

<template>
  <div class="row" @click="toggle">
    <span class="grow">{{ crypto }}</span>
    <span class="light">{{ shortAddress }}</span>
    <button
      class="btn btn-icon"
      :class="{ copied }"
      tooltip="Copy"
      @click.stop="copy"
    >
      <ClipboardCopyIcon v-if="!copied" />
      <CheckIcon v-else />
    </button>
  </div>
  <div class="full-address light" v-if="expanded">
    {{ address }}
  </div>
</template>

<style scoped>
.row {
  cursor: pointer;
  padding: 5px 0;
}
.row:hover {
  background-color: rgba(0, 0, 0, 0.1);
}
.light {
  font-weight: 300;
  color: #ccc;
}
.copied {
  color: #66ff66;
}
.full-address {
  font-size: 12px;
  user-select: all;
  word-wrap: break-word;
  margin-bottom: 10px;
}
</style>
