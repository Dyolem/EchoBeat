<script setup>
import { toRef, provide } from "vue"

const props = defineProps({
  height: {
    type: Number,
    default: 40,
  },
  size: {
    type: String,
    default: "default",
  },
})
provide("size", toRef(props, "size"))
provide("round", false)
provide("circle", false)
</script>

<template>
  <div class="button-group-container">
    <slot></slot>
  </div>
</template>

<style scoped>
.button-group-container {
  --button-group-container-height: v-bind(height + "px");
  height: var(--button-group-container-height);
  border-radius: var(--button-group-container-height);
  padding: 0 calc(var(--button-group-container-height) / 2);
  display: flex;
  align-items: center;
  background-color: #191b1e;
}
</style>
