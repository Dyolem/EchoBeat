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
const noteMainSelectedId = ref("")
const getNotePosition = (x, y) => {
  if (x === undefined || y === undefined) return
  return ref([x, y])
}
const getCursorPositionInNoteEditorRegion = (event) => {
  if (!event) return
  const x =
    event.clientX - noteEditorRegionRef.value.getBoundingClientRect().left
  const y =
    event.clientY - noteEditorRegionRef.value.getBoundingClientRect().top
  return { x, y }
}
function noteEditorClickHandler(event) {
  if (noteItems.editorMode === "select") {
    if (noteMainSelectedId.value !== "") {
      noteMainSelectedId.value = ""
    }
  } else if (noteItems.editorMode === "insert") {
    const { x: insertX, y: insertY } =
      getCursorPositionInNoteEditorRegion(event)
    noteMainSelectedId.value = noteItems.insertNoteItem({
      x: insertX,
      y: insertY,
    })
  }
}
function noteEditorDblClickHandler(event) {
  if (noteItems.editorMode === "select") {
    const { x: insertX, y: insertY } =
      getCursorPositionInNoteEditorRegion(event)
    noteMainSelectedId.value = noteItems.insertNoteItem({
      x: insertX,
      y: insertY,
    })
  }
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
    @dblclick="noteEditorDblClickHandler"
    ref="noteEditorRegionRef"
    :class="{
      'is-inserted': noteItems.editorMode === 'insert',
    }"
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
        v-model:note-main-selected-id="noteMainSelectedId"
        :noteEditorRegionRef="noteEditorRegionRef"
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
.is-inserted:hover {
  cursor:
    url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCA3MiA3MiI+PHBhdGggZmlsbD0iIzliOWI5YSIgZD0ibTU5LjQxIDE3LjU4bC0yLjU5OC0yLjU0MWwtMi41NS0yLjU4OXMtMTEuNTEgNy4wOTgtMTkuMTIgMTUuMjhjLTEwLjQxIDExLjE5LTE0LjU5IDE3LjItMTQuNTkgMTcuMmw2LjQ5NyA2LjQ3NWEyMTggMjE4IDAgMCAwIDE3LjE1LTE0LjY1YzguMTg4LTcuNjEzIDE1LjIyLTE5LjE4IDE1LjIyLTE5LjE4eiIvPjxwYXRoIGZpbGw9IiMzZjNmM2YiIGQ9Ik0zMC43NCAzMi44N2MtMy43NDYgMy43MDYtNy4wNzEgNy44MTItMTAuMTkgMTIuMDZsNi40NjYgNi4zNjRjNC4zMDgtMy4wNSA4LjI3Ny02LjQzNiAxMi4wNS0xMC4xM3oiLz48cGF0aCBmaWxsPSIjZDBjZmNlIiBzdHJva2U9IiNkMGNmY2UiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIyIiBkPSJtMjcuMDIgNTEuMjlsLTUuNjM4IDYuMzZsLTcuNzk0Ljc3bC42My03LjgwN2w2LjMzNy01LjY4NyIvPjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiIGQ9Im0xNy43NyA1NC4xMWwtMi45NyAzLjEybTkuNDktMi43NGwtMi45MDggMy4xNjRsLTcuNzk0Ljc3bC42My03LjgwN2wzLjIxNy0yLjk4NE01OS4xNCAxNy4yM2wtMi42MTYtMi41MjNsLTIuNTY5LTIuNTcxcy0xMS40NiA3LjE4MS0xOS4wMSAxNS40MmMtMTAuMzMgMTEuMjctMTQuNDcgMTcuMzEtMTQuNDcgMTcuMzFsNi41NDMgNi40MjhhMjE4IDIxOCAwIDAgMCAxNy4wNS0xNC43OGM4LjEzMy03LjY3MiAxNS4wOC0xOS4yOCAxNS4wOC0xOS4yOHpNMzguOTcgNDAuOTdsLTguMzkxLTguMjQzIi8+PC9zdmc+)
      4 19.75,
    auto;
}
</style>
