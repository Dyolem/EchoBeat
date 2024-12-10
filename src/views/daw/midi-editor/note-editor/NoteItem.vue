<script setup>
import { inject, onMounted, useTemplateRef } from "vue"
import clearSelection from "@/utils/clearSelection.js"

const editorNoteRef = useTemplateRef("editorNoteRef")
const props = defineProps({
  noteWidth: {
    type: Number,
    default: 30,
  },
  noteHeight: {
    type: Number,
  },
  noteBackGroundColor: {
    type: String,
    default: "lightblue",
  },
  notePadWidth: {
    type: Number,
    required: true,
  },
  notePadHeight: {
    type: Number,
    required: true,
  },
})
const editorContentContainerRef = inject("editorContentContainerRef")
const trackRulerHeight = inject("trackRulerHeight")

let translateXDistance = 0
let translateYDistance = 0
function isLegalTranslateDistance(translateXDistance, translateYDistance) {
  return (
    translateXDistance >= 0 &&
    translateXDistance <= props.notePadWidth - props.noteWidth &&
    translateYDistance >= 0 &&
    translateYDistance <= props.notePadHeight - props.noteHeight
  )
}
function draggableRegionHandler(event) {}
const isNoteMainSelected = defineModel("isNoteMainSelected", {
  type: Boolean,
  default: false,
})

onMounted(() => {})
function stretchEditorNoteLength(event) {
  if (!isNoteMainSelected.value) return
  const selectionController = clearSelection()
  const mousedownX =
    event.clientX - editorNoteRef.value.getBoundingClientRect().left
  const mousedownY =
    event.clientY - editorNoteRef.value.getBoundingClientRect().top
  function mouseMoveHandler(event) {
    const left =
      event.clientX -
      editorContentContainerRef.value.getBoundingClientRect().left
    translateXDistance =
      editorContentContainerRef.value.scrollLeft + left - mousedownX
    const top =
      event.clientY -
      editorContentContainerRef.value.getBoundingClientRect().top
    translateYDistance =
      editorContentContainerRef.value.scrollTop +
      top -
      trackRulerHeight.value -
      mousedownY
    if (isLegalTranslateDistance(translateXDistance, translateYDistance))
      editorNoteRef.value.style.transform = `translate(${translateXDistance}px,${translateYDistance}px)`
  }
  document.addEventListener("mousemove", mouseMoveHandler)
  document.addEventListener(
    "mouseup",
    () => {
      document.removeEventListener("mousemove", mouseMoveHandler)
      selectionController.abort()
    },
    {
      once: true,
    },
  )
}
</script>

<template>
  <div
    class="editor-note"
    :class="{ 'is-selected': isNoteMainSelected }"
    ref="editorNoteRef"
    @mousedown="stretchEditorNoteLength"
  >
    <div
      class="editor-note-left draggable-region"
      @mousedown="draggableRegionHandler"
    ></div>
    <div class="editor-note-main" @click.stop="isNoteMainSelected = true"></div>
    <div
      class="editor-note-right draggable-region"
      @mousedown="draggableRegionHandler"
    ></div>
  </div>
</template>

<style scoped>
.editor-note {
  --note-background-color: v-bind(noteBackGroundColor);
  box-sizing: border-box;
  overflow: hidden;
  display: flex;
  width: 30px;
  height: v-bind(noteHeight + "px");
  padding: 0 4px;
  background-color: var(--note-background-color);
  border-radius: 2px;
}
.editor-note-main {
  flex-grow: 1;
  height: 100%;
  background-color: var(--note-background-color);
}
.draggable-region {
  width: 6px;
  height: 100%;
  background-color: var(--note-background-color);
}
.draggable-region:hover {
  cursor: ew-resize;
}
.is-selected {
  border: 1px solid #fff;
}
.is-selected:hover {
  cursor: move;
}
</style>
