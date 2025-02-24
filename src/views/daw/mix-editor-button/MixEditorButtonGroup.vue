<script setup>
import { toRef, provide, useTemplateRef } from "vue"

const props = defineProps({
  size: {
    type: String,
    default: "default",
  },
})
const buttonGroupRef = useTemplateRef("buttonGroupRef")
provide("size", toRef(props, "size"))
</script>

<template>
  <div class="button-group-container" ref="buttonGroupRef">
    <slot></slot>
  </div>
</template>

<style scoped>
.button-group-container {
  height: fit-content;
  width: fit-content;
  display: flex;
  align-items: center;
}

.button-group-container :deep(.mix-editor-button-box):not(:only-child) {
  &:not(:first-child):not(:last-child) {
    border-radius: 0;
  }
  &:first-child {
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;
  }
  &:last-child {
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
  }
}
</style>
