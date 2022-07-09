<script setup lang="ts">
import { inject, onMounted, onUnmounted, ref, watch } from "vue";

import type { TourStep } from "@/tour/types";
import mapScripts from "./maps/mapScripts";
import type { Simulation } from "./simulation";
import { state } from "./state";
import { resetSettings } from "@/tour/utils";
import Modal from "./widgets/Modal.vue";

const simulation = inject<Simulation>("simulation")!;

const steps = ref<TourStep[]>([]);
const currentStep = ref<TourStep | null>(null);
const isNextStepBtnVisible = ref(true);

const isAbortModalVisible = ref(false);

onMounted(() => {
  simulation.canvas.app.ticker.add(tick);
});

onUnmounted(() => {
  simulation.canvas.app.ticker.remove(tick);
});

watch(
  () => state.loadedMap,
  () => {
    if (state.loadedMap) {
      const script = (mapScripts as any)[state.loadedMap];
      if (script) {
        steps.value = script(simulation) ?? [];
        currentStep.value = steps.value[0];
        state.tourMode = true;
      }
    }
  }
);

function nextStep() {
  if (!currentStep.value) {
    return;
  }

  if (currentStep.value.nextCallback) {
    currentStep.value.nextCallback();
  }

  const index = steps.value.indexOf(currentStep.value);
  if (index !== -1) {
    currentStep.value = steps.value[index + 1] ?? null;
  }
}

function askAbort() {
  isAbortModalVisible.value = true;
}

function cancelAbort() {
  isAbortModalVisible.value = false;
}

function abort() {
  isAbortModalVisible.value = false;
  state.tourMode = false;
  currentStep.value = null;
  resetSettings();
}

function tick() {
  isNextStepBtnVisible.value = true;
  if (currentStep.value?.tickCallback) {
    const tickResult = currentStep.value.tickCallback();
    if (tickResult === "hideNextBtn") {
      isNextStepBtnVisible.value = false;
    } else if (tickResult === "goToNextStep") {
      nextStep();
    }
  }
}
</script>

<template>
  <div class="tour-modal" v-if="currentStep">
    <p>
      {{ currentStep.description }}
    </p>
    <div class="actions">
      <button class="btn btn-secondary" @click="askAbort">Abort tour</button>
      <button
        v-if="isNextStepBtnVisible"
        class="btn btn-primary"
        @click="nextStep"
      >
        Next
      </button>
    </div>
  </div>

  <Modal header="Abort tour?" v-model="isAbortModalVisible">
    <template v-slot:content>
      <p>Are you sure you want abort the tour?</p>
    </template>

    <template v-slot:actions>
      <button class="btn" @click="cancelAbort">Cancel</button>
      <button class="btn btn-danger" @click="abort">Abort</button>
    </template>
  </Modal>
</template>

<style scoped>
.tour-modal {
  position: absolute;
  max-width: 350px;
  min-width: 350px;
  top: 0;
  left: 0;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 10px;
  border-radius: 0 0 10px 0;
  border: var(--border-width) solid var(--border-color);
  border-left: 0;
  border-top: 0;
  box-shadow: 0 0 5px 0 #000000;
  font-size: 18px;
  z-index: 10;
}
.actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}
.btn-primary {
  padding: 15px 30px;
  font-size: 20px;
}
</style>
