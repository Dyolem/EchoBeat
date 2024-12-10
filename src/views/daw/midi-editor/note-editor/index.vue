<script setup>
import { computed, inject, ref } from "vue"
import NotePad from "@/views/daw/midi-editor/note-editor/NotePad.vue"
import NoteItem from "@/views/daw/midi-editor/note-editor/NoteItem.vue"

const OCTAVE_KEY_COUNT = 12
const OCTAVE_WHITE_KEY_COUNT = 7
const props = defineProps({
  notePadWidth: {
    type: Number,
  },
  notePadHeight: {
    type: Number,
  },
})
const chromaticInfo = inject("chromaticInfo")
const pianoKeySize = inject("pianoKeySize")
const whiteKeyHeight = computed(() => {
  return pianoKeySize.value.whiteKeyHeight
})
const noteHeight = computed(() => {
  return Number(
    (
      (whiteKeyHeight.value *
        chromaticInfo.value.octaveCount *
        OCTAVE_WHITE_KEY_COUNT) /
      (OCTAVE_KEY_COUNT * chromaticInfo.value.octaveCount)
    ).toFixed(1),
  )
})
const isNoteMainSelected = ref(false)
</script>

<template>
  <note-pad
    :note-pad-width="notePadWidth"
    :note-pad-height="notePadHeight"
    :octave-count="chromaticInfo.octaveCount"
  ></note-pad>
  <div class="note-editor-region" @click="isNoteMainSelected = false">
    <note-item
      :note-height="noteHeight"
      :note-pad-width="notePadWidth"
      :note-pad-height="notePadHeight"
      v-model:is-note-main-selected="isNoteMainSelected"
    ></note-item>
  </div>
</template>

<style scoped>
.note-editor-region {
  position: absolute;
  top: 0;
  width: v-bind(notePadWidth + "px");
  height: v-bind(notePadHeight + "px");
  background-color: rgba(0, 0, 0, 0.3);
}
</style>
