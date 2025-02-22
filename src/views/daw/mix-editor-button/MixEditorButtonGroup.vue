<script setup>
import { toRef, provide, useTemplateRef, computed } from "vue"

const props = defineProps({
  size: {
    type: String,
    default: "default",
  },
})
const buttonGroupRef = useTemplateRef("buttonGroupRef")
const height = computed(() => {
  return buttonGroupRef.value?.getBoundingClientRect().height ?? 0
})
provide("size", toRef(props, "size"))
provide("round", false)
provide("circle", false)
</script>

<template>
  <div class="button-group-container" ref="buttonGroupRef">
    <slot></slot>
  </div>
</template>

<style scoped>
.button-group-container {
  --button-group-container-height: v-bind(height + "px");
  height: fit-content;
  border-radius: var(--button-group-container-height);
  padding: 0 calc(var(--button-group-container-height) / 2);
  display: flex;
  align-items: center;
  background-color: #191b1e;
}
</style>
