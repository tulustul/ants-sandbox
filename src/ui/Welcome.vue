<script setup lang="ts">
import { inject } from "vue";
import predefinedMaps from "./maps/predefinedMaps";
import { loadMap } from "./maps/utils";
import type { Simulation } from "./simulation";
import { state } from "./state";
import Modal from "./widgets/Modal.vue";

let simulation = inject<Simulation>("simulation")!;

function startTour() {
  state.tourMode = true;
  hideWelcome();
  loadMap(simulation, "1: Single ant", predefinedMaps.tour);
}

function skipTour() {
  state.tourMode = false;
  hideWelcome();
}

function hideWelcome() {
  state.isWelcomed = true;
  localStorage.setItem("isWelcomed", "true");
}
</script>

<template>
  <Modal :show-header="false" :showActions="false">
    <template v-slot:content>
      <h1>Welcome to Ants&nbsp;Sandbox</h1>

      <p>
        This is a simple and completely useless simulation of an ants colony.
      </p>

      <div class="actions">
        <button class="btn btn-primary" @click="startTour">Take a tour</button>

        <button class="btn" @click="skipTour">Skip tour</button>
      </div>
    </template>
  </Modal>
</template>

<style scoped>
h1 {
  text-align: center;
}
p {
  margin: 20px 0;
  text-align: center;
}
.actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}
.btn-primary {
  padding: 20px;
  font-size: 20px;
}
</style>
