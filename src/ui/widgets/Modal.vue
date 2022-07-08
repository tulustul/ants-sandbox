<script setup lang="ts">
import { XIcon } from "@heroicons/vue/solid";
import { onMounted, onUnmounted } from "vue";

const props = defineProps({
  header: String,
  modelValue: {
    type: Boolean,
    default: null,
  },
  allowClose: {
    type: Boolean,
    default: true,
  },
  showHeader: {
    type: Boolean,
    default: true,
  },
  showActions: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["update:modelValue"]);

onMounted(() => window.addEventListener("keydown", onKeyDown));
onUnmounted(() => window.removeEventListener("keydown", onKeyDown));

function onKeyDown(event: KeyboardEvent) {
  if (props.modelValue && event.key === "Escape") {
    close();
  }
}

function close() {
  if (props.allowClose) {
    emit("update:modelValue", false);
  }
}
</script>

<template>
  <Teleport v-if="modelValue || modelValue === null" to="body">
    <div class="backdrop" @click.self="close">
      <div class="modal">
        <div v-if="showHeader" class="header">
          <span>{{ header }}</span>
          <XIcon v-if="allowClose" class="close-icon" @click="close" />
        </div>
        <div class="content">
          <slot name="content" />
        </div>
        <div v-if="showActions" class="actions">
          <slot name="actions" />
        </div>
      </div></div
  ></Teleport>
</template>

<style scoped>
.backdrop {
  position: absolute;
  width: 100%;
  height: 100%;
  left: 0;
  top: 0;
  background-color: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(3px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 30;
}
.header {
  font-size: 24px;
  font-weight: 600;
  border-bottom: 2px solid var(--border-color);
  padding: 10px;
  display: flex;
  justify-content: space-between;
}
.close-icon {
  max-width: 30px;
  cursor: pointer;
  transition: 0.1s linear;
}
.close-icon:hover {
  transform: scale(1.2);
}
.modal {
  display: flex;
  flex-direction: column;
  width: 450px;
  max-width: 100%;
  max-height: 100%;
  overflow-y: auto;
  background-color: rgb(50, 50, 50);
  border: var(--border-width) solid var(--border-color);
  border-radius: 10px;
  box-shadow: 0 0 20px 5px black;
}
.content {
  padding: 10px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  padding: 10px;
  border-top: 2px solid var(--border-color);
}
</style>
