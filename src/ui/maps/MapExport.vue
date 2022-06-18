<script setup lang="ts">
import { inject, ref, watch } from "vue";

import { Modal } from "@/ui/widgets";
import type { Simulation } from "../simulation";

let simulation = inject<Simulation>("simulation")!;

const exportModalVisible = ref(false);
const isCopied = ref(false);
const data = ref("");

watch(exportModalVisible, () => {
  if (exportModalVisible.value) {
    data.value = simulation.dump();
  }
});

async function copyToClipboard() {
  await navigator.clipboard.writeText(data.value);
  isCopied.value = true;
}
</script>

<template>
  <button class="btn grow" :onclick="() => (exportModalVisible = true)">
    Export
  </button>

  <Modal v-model="exportModalVisible" header="Map export">
    <template v-slot:content>
      <p>
        Below you can find a map string that can be imported by other users.
      </p>

      <div class="data">{{ data }}</div>
    </template>

    <template v-slot:actions>
      <div v-if="isCopied" class="success" @click="() => (isCopied = false)">
        Copied
      </div>
      <button v-else class="btn btn-primary" @click="copyToClipboard">
        Copy
      </button>
      <button class="btn" @click="exportModalVisible = false">Close</button>
    </template>
  </Modal>
</template>

<style scoped>
.data {
  user-select: all;
  margin-top: 10px;
  background-color: rgba(0, 0, 0, 0.2);
  padding: 10px;
  word-break: break-all;
  max-height: 250px;
  overflow-y: auto;
  font-family: monospace;
}
</style>
