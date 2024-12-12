<script setup>
import { computed, inject, ref, useTemplateRef } from "vue"
import NotePad from "@/views/daw/midi-editor/note-editor/NotePad.vue"
import NoteItem from "@/views/daw/midi-editor/note-editor/NoteItem.vue"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
const noteItems = useNoteItemStore()

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
const noteEditorRegionRef = useTemplateRef("noteEditorRegionRef")
const editorContentContainerRef = inject("editorContentContainerRef")
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
noteItems.noteHeight = noteHeight.value
const isNoteMainSelected = ref(false)
const getNotePosition = (x, y) => {
  if (x === undefined || y === undefined) return
  return ref([x, y])
}
function noteEditorClickHandler(event) {
  isNoteMainSelected.value = false
  const insertX =
    event.clientX - noteEditorRegionRef.value.getBoundingClientRect().left
  const insertY =
    event.clientY - noteEditorRegionRef.value.getBoundingClientRect().top
  noteItems.insertNoteItem({ x: insertX, y: insertY })
  // const count = noteItems.noteItemsMap.get("c4").noteItems.length
  // const insertToSpecifiedPitchName = "c4"
  // noteItems.noteItemsMap.get("c4").noteItems.push({
  //   id: `${insertToSpecifiedPitchName}-${count}`,
  //   width: 20,
  //   height: 10,
  //   x: insertX,
  //   y: insertY,
  //   backGroundColor: "lightblue",
  // })
  console.log(insertX, insertY)
  console.log(noteEditorRegionRef.value.getBoundingClientRect().top)
}
</script>

<template>
  <note-pad
    :note-pad-width="notePadWidth"
    :note-pad-height="notePadHeight"
    :octave-count="chromaticInfo.octaveCount"
  ></note-pad>
  <div
    class="note-editor-region"
    @click="noteEditorClickHandler"
    ref="noteEditorRegionRef"
  >
    <template
      class="note-editor-track"
      v-for="[pitchName, noteTrack] in noteItems.noteItemsMap"
      :style="{ transform: `translateY(${noteTrack.positionY}px)` }"
      :id="pitchName"
    >
      <note-item
        v-for="noteItem in noteTrack.noteItems"
        :key="noteItem.id"
        :id="noteItem.id"
        :belonged-pitch-name="pitchName"
        :note-height="noteHeight"
        :note-pad-width="notePadWidth"
        :note-pad-height="notePadHeight"
        :note-position="getNotePosition(noteItem.x, noteItem.y)"
        v-model:is-note-main-selected="isNoteMainSelected"
      ></note-item>
    </template>
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
.note-editor-track {
  position: absolute;
  width: v-bind(notePadWidth + "px");
  height: v-bind(noteHeight + "px");
  background-color: gold;
}
</style>
