<script setup>
import { computed, inject, ref } from "vue"
const sizeEnum = {
  SMALL: "small",
  DEFAULT: "default",
  LARGE: "large",
}
const sizeStyleMap = {
  [sizeEnum.SMALL]: {
    height: 24,
    padding: 8,
    radius: 4,
    fontSize: 12,
  },
  [sizeEnum.DEFAULT]: {
    height: 32,
    padding: 12,
    radius: 8,
    fontSize: 14,
  },
  [sizeEnum.LARGE]: {
    height: 40,
    padding: 16,
    radius: 12,
    fontSize: 16,
  },
}
const props = defineProps({
  size: {
    type: String,
    default: "",
  },
  round: {
    type: Boolean,
    default: true,
  },
  circle: {
    type: Boolean,
    default: false,
  },
})

const injectedSize = inject("size", ref(sizeEnum.DEFAULT))
const size = computed(() => {
  return props.size || injectedSize.value
})
const buttonSize = computed(() => {
  return sizeStyleMap[size.value].height
})
const buttonPadding = computed(() => {
  return sizeStyleMap[size.value].padding
})

const buttonBorderRadius = computed(() => {
  if (props.circle) {
    return sizeStyleMap[size.value].height / 2
  } else {
    return !props.round ? 0 : sizeStyleMap[size.value].radius
  }
})
const buttonFontSize = computed(() => {
  return sizeStyleMap[size.value].fontSize
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
  --button-border-radius: v-bind(buttonBorderRadius + "px");
  --button-font-size: v-bind(buttonFontSize + "px");
  width: fit-content;
  display: flex;
  align-items: center;
  height: var(--button-box-height);
  padding: 0 var(--button-padding);
  border-radius: var(--button-border-radius);
  background-color: #191b1e;
  font-size: var(--button-font-size);
  color: #ffffff;
  transition: all 0.2s cubic-bezier(0, 0, 0.2, 1);
  user-select: none;
}
.mix-editor-button-box:hover {
  background-color: #3f4143;
  cursor: pointer;
}
</style>
