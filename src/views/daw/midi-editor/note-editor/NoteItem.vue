<script setup>
import { onMounted, useTemplateRef, watch } from "vue"
import clearSelection from "@/utils/clearSelection.js"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
const noteItemMap = useNoteItemStore()

const editorNoteRef = useTemplateRef("editorNoteRef")
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  belongedPitchName: {
    type: String,
    required: true,
  },
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
  notePosition: {
    type: Object,
    default: () => [0, 0],
  },
  noteEditorRegionRef: {
    type: Object,
    required: true,
  },
})

const isNoteMainSelected = defineModel("isNoteMainSelected", {
  type: Boolean,
  default: false,
})

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
function draggableRegionHandler(event) {
  if (!isNoteMainSelected.value) return
  const selectionController = clearSelection()
  const mousedownX =
    event.clientX - editorNoteRef.value.getBoundingClientRect().left
  const mousedownY =
    event.clientY - editorNoteRef.value.getBoundingClientRect().top
  function mouseMoveHandler(event) {
    translateXDistance =
      event.clientX - props.noteEditorRegionRef.getBoundingClientRect().left
    if (!noteItemMap.isSnappedToHorizontalGrid) {
      translateXDistance -= mousedownX
    }
    translateYDistance =
      event.clientY - props.noteEditorRegionRef.getBoundingClientRect().top

    if (isLegalTranslateDistance(translateXDistance, translateYDistance)) {
      noteItemMap.updateNoteItemPosition(props.id, props.belongedPitchName, [
        translateXDistance,
        translateYDistance,
      ])
    }
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

onMounted(() => {
  watch(
    () => props.notePosition,
    (newPosition) => {
      const [newX, newY] = newPosition.value
      // console.log(isLegalTranslateDistance(newX, newY))
      if (isLegalTranslateDistance(newX, newY) && editorNoteRef.value) {
        editorNoteRef.value.style.transform = `translate(${newX}px,${newY}px)`
      }
    },
    { deep: true, immediate: true },
  )
})
function stretchEditorNoteLength(event) {}
</script>

<template>
  <div
    class="editor-note"
    :class="{ 'is-selected': isNoteMainSelected }"
    ref="editorNoteRef"
    @mousedown="draggableRegionHandler"
  >
    <div
      class="editor-note-left draggable-region"
      @mousedown="stretchEditorNoteLength"
    ></div>
    <div class="editor-note-main" @click.stop="isNoteMainSelected = true"></div>
    <div
      class="editor-note-right draggable-region"
      @mousedown="stretchEditorNoteLength"
    ></div>
  </div>
</template>

<style scoped>
.editor-note {
  --note-background-color: v-bind(noteBackGroundColor);
  box-sizing: border-box;
  position: absolute;
  overflow: hidden;
  display: flex;
  width: 20px;
  height: v-bind(noteHeight + "px");
  padding: 0 2px;
  background-color: var(--note-background-color);
  border-radius: 2px;
}
.editor-note-main {
  flex-grow: 1;
  height: 100%;
  background-color: var(--note-background-color);
}
.draggable-region {
  width: 4px;
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
