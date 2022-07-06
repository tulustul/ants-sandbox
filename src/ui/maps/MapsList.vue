<script setup lang="ts">
import { inject, ref, type PropType } from "vue";
import { TrashIcon } from "@heroicons/vue/solid";

import { Modal, Spinner } from "@/ui/widgets";
import type { Simulation } from "../simulation";
import { state } from "../state";
import { loadMap, saveMapsNames } from "./utils";

const props = defineProps({
  maps: Array as PropType<string[]>,
  source: Object as PropType<Record<string, string>>,
});

const canRemove = !props.source;

const emit = defineEmits(["select"]);

let simulation = inject<Simulation>("simulation")!;

const mapLoading = ref<string | null>(null);
const mapToRemove = ref<string | null>(null);
const isRemoveModalVisible = ref(false);

let maps = props.maps;
if (!maps && props.source) {
  maps = Object.keys(props.source);
}

async function load(name: string) {
  mapLoading.value = name;
  try {
    await loadMap(simulation, name, props.source);
  } finally {
    mapLoading.value = null;
  }
}

function askForRemoval(name: string) {
  mapToRemove.value = name;
  isRemoveModalVisible.value = true;
}

function remove() {
  if (!mapToRemove.value || !maps) {
    return;
  }

  localStorage.removeItem(`map:${name}`);
  const index = maps.indexOf(mapToRemove.value);
  if (index !== -1) {
    maps.splice(index, 1);
  }
  saveMapsNames(maps);
  cancelRemove();
}

function cancelRemove() {
  isRemoveModalVisible.value = false;
  mapToRemove.value = null;
}
</script>

<template>
  <p v-if="maps?.length === 0">No maps.</p>

  <ul v-else>
    <li
      v-for="map in maps"
      v-bind:key="map"
      :onclick="() => emit('select', map)"
    >
      <button
        v-if="canRemove"
        class="btn btn-icon btn-danger"
        :onclick="() => askForRemoval(map)"
      >
        <TrashIcon />
      </button>

      <div class="row grow">
        <span class="map-name">{{ map }}</span>
        <span class="success" v-if="map === state.loadedMap">(loaded)</span>
      </div>

      <Spinner v-if="mapLoading === map" />
      <button v-else class="btn" :onclick="() => load(map)">Load</button>
    </li>
  </ul>

  <Modal header="Deleting map" v-model="isRemoveModalVisible">
    <template v-slot:content>
      <p>
        Are you sure you want to delete the map
        <strong>{{ mapToRemove }}</strong
        >?
      </p>
    </template>

    <template v-slot:actions>
      <button class="btn" @click="cancelRemove">Cancel</button>
      <button class="btn btn-danger" @click="remove">Delete</button>
    </template>
  </Modal>
</template>

<style scoped>
ul {
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 5px;
}
li {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}
.li:hover {
  background-color: rgba(0, 0, 0, 0.2);
}
.map-name {
  word-break: break-all;
}
</style>
