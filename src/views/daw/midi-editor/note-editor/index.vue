<script setup>
import NotePad from "@/views/daw/midi-editor/note-editor/NotePad.vue"
import { inject } from "vue"
const props = defineProps({
  notePadWidth: {
    type: Number,
  },
  notePadHeight: {
    type: Number,
  },
})
const chromaticInfo = inject("chromaticInfo")
</script>

<template>
  <note-pad
    :note-pad-width="notePadWidth"
    :note-pad-height="notePadHeight"
    :octave-count="chromaticInfo.octaveCount"
  ></note-pad>
</template>

<style scoped></style>
