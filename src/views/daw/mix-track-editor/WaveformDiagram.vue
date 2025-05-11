<script setup>
const props = defineProps({
  id: {
    type: String,
    default: "",
  },
})
</script>

<template>
  <div :id="id" class="waveform-container"></div>
</template>

<style scoped></style>
