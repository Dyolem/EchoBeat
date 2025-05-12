<script setup>
const props = defineProps({
  id: {
    type: String,
    default: "",
  },
  width: {
    type: Number,
  },
})
</script>

<template>
  <div
    :id="id"
    class="waveform-container"
    :style="{ width: `${width}px` }"
  ></div>
</template>

<style scoped></style>
