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

const noteMainSelectedId = defineModel("noteMainSelectedId", {
  type: String,
  default: "",
})
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
  console.log(2)
  if (noteItemMap.editorMode === "insert") return
  if (noteMainSelectedId.value !== props.id) noteMainSelectedId.value = props.id
  const selectionController = clearSelection()
  const mousedownX =
    event.clientX - editorNoteRef.value.getBoundingClientRect().left
  const mousedownY =
    event.clientY - editorNoteRef.value.getBoundingClientRect().top
  function mouseMoveHandler(event) {
    console.log("move")
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

function stretchEditorNoteLength(event) {}

let isMoved = false
let firstRapidMouseDown = 0
let secondRapidMouseDown = 0
const noteMainMousedown = new AbortController()
function noteMainMousedownHandler(event) {
  console.log(isMoved)
  console.log(event.timeStamp)
  firstRapidMouseDown =
    firstRapidMouseDown === 0 ? event.timeStamp : firstRapidMouseDown
  console.log("firstRapidMouseDown:" + firstRapidMouseDown)
  const timeInterval = event.timeStamp - firstRapidMouseDown
  const timer = setTimeout(() => {
    console.log("reset")
    firstRapidMouseDown = 0
    isMoved = false
  }, 300)
  if (timeInterval === 0) {
    if (noteItemMap.editorMode === "insert") {
      noteItemMap.deleteNoteItem(props.id, props.belongedPitchName)
      noteMainSelectedId.value = ""
    }
  }
  if (timeInterval > 0 && timeInterval < 300) {
    clearTimeout(timer)
    console.log("time")
    document.addEventListener(
      "mousemove",
      (event) => {
        isMoved = true
      },
      {
        once: true,
      },
    )
    document.addEventListener(
      "mouseup",
      (event) => {
        if (!isMoved) {
          console.log("delete")
          noteItemMap.deleteNoteItem(props.id, props.belongedPitchName)
        } else {
          isMoved = false
        }
      },
      {
        once: true,
      },
    )
  }
  // if (noteItemMap.editorMode === "insert") {
  //   noteItemMap.deleteNoteItem(props.id, props.belongedPitchName)
  // } else if (noteItemMap.editorMode === "select") {
  //   noteMainSelectedId.value = props.id
  // }
}
function noteMainDblClickHandler() {
  if (isMoved) return
  noteItemMap.deleteNoteItem(props.id, props.belongedPitchName)
  isMoved = false
}
</script>

<template>
  <div
    class="editor-note"
    :class="{
      'is-edited': noteMainSelectedId === id,
      'is-selected':
        noteMainSelectedId === id && noteItemMap.editorMode === 'select',
    }"
    ref="editorNoteRef"
    @click.stop="() => {}"
    @dblclick.stop="() => {}"
    @mousedown.stop="draggableRegionHandler"
  >
    <div
      class="editor-note-left draggable-region"
      @mousedown="stretchEditorNoteLength"
    ></div>
    <div class="editor-note-main" @mousedown="noteMainMousedownHandler"></div>
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

.is-selected:hover {
  cursor: move;
}
.is-edited {
  border: 1px solid #fff;
  z-index: 1;
}
</style>
