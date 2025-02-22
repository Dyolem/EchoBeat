<script setup>
import { computed, inject, toRef } from "vue"

const props = defineProps({
  size: {
    type: String,
    default: "default",
  },
  round: {
    type: Boolean,
    default: true,
  },
  circle: {
    type: Boolean,
    default: false,
  },
  padding: {
    type: Number,
  },
})
const sizeStyleMap = {
  small: {
    height: 24,
    padding: 8,
    radius: 4,
  },
  default: {
    height: 32,
    padding: 12,
    radius: 8,
  },
  large: {
    height: 40,
    padding: 16,
    radius: 12,
  },
}

const size = inject("size", toRef(props, "size"))
const round = inject("round", true)
const circle = inject("circle", false)
const buttonSize = computed(() => {
  return sizeStyleMap[size.value].height
})
const buttonPadding = computed(() => {
  return props.padding === undefined
    ? sizeStyleMap[size.value].padding
    : props.padding
})

const buttonBorderRadius = computed(() => {
  if (props.circle || circle) {
    return sizeStyleMap[size.value].height / 2
  } else {
    return !round || !props.round ? 0 : sizeStyleMap[size.value].radius
  }
})
</script>

<template>
  <div class="mix-editor-button-box">
    <slot></slot>
  </div>
</template>

<style scoped>
.mix-editor-button-box {
  --button-box-height: v-bind(buttonSize + "px");
  --button-padding: v-bind(buttonPadding + "px");
  --border-radius: v-bind(buttonBorderRadius + "px");
  display: flex;
  align-items: center;
  height: var(--button-box-height);
  padding: 0 var(--button-padding);
  border-radius: var(--border-radius);
  background-color: #191b1e;
  color: #ffffff;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  user-select: none;
}
.mix-editor-button-box:hover {
  background-color: #3f4143;
  cursor: pointer;
}
</style>
