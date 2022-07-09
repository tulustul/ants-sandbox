<script setup lang="ts">
import { inject, ref, watch } from "vue";

import { Modal, Spinner } from "@/ui/widgets";
import type { Simulation } from "../simulation";

let simulation = inject<Simulation>("simulation")!;

const data = ref("");
const error = ref("");
const waiting = ref(false);

const importModalVisible = ref(false);

watch(importModalVisible, () => {
  data.value = "";
  error.value = "";
});

async function importMap() {
  waiting.value = true;
  try {
    await simulation.load(data.value);
    close();
  } catch {
    error.value = "Broken map string. Unable to import the map.";
  }
  waiting.value = false;
}

function close() {
  importModalVisible.value = false;
  error.value = "";
}
</script>

<template>
  <button class="btn grow" :onclick="() => (importModalVisible = true)">
    Import
  </button>

  <Modal v-model="importModalVisible" header="Map import">
    <template v-slot:content>
      <p>Paste the map string below.</p>

      <textarea rows="10" v-model="data"></textarea>

      <div v-if="error" class="danger">{{ error }}</div>
    </template>

    <template v-slot:actions>
      <button class="btn" @click="close">Cancel</button>
      <Spinner v-if="waiting" />
      <button v-else class="btn btn-primary" @click="importMap">Import</button>
    </template>
  </Modal>
</template>

<style scoped>
textarea {
  width: 100%;
  margin-top: 10px;
}
</style>
