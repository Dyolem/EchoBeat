<script setup>
import MidiOptions from "@/views/daw/midi-editor/midi-sidebar/midi-options/index.vue"
import ChromaticScale from "@/views/daw/midi-editor/midi-sidebar/chromatic-scale/index.vue"
const props = defineProps({
  chromaticScaleScrollTop: {
    type: Number,
  },
})
const emit = defineEmits(["update:chromaticScaleScrollTop"])
function updateChromaticScaleScrollTopHandler(chromaticScaleScrollTop) {
  emit("update:chromaticScaleScrollTop", chromaticScaleScrollTop)
}
</script>

<template>
  <MidiOptions></MidiOptions>
  <ChromaticScale
    :chromatic-scale-scroll-top="chromaticScaleScrollTop"
    @update:chromatic-scale-scroll-top="updateChromaticScaleScrollTopHandler"
  ></ChromaticScale>
</template>

<style scoped></style>
