<script setup>
import { onMounted, onUnmounted, useTemplateRef, watch, watchEffect } from "vue"
import clearSelection from "@/utils/clearSelection.js"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import { useAudioGeneratorStore } from "@/store/daw/audio/audioGenerator.js"
const noteItemMap = useNoteItemStore()
const audioGenerator = useAudioGeneratorStore()

const editorNoteRef = useTemplateRef("editorNoteRef")
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  belongedPitchName: {
    type: String,
    default: "",
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
// watchEffect(() => {
//   audioGenerator.generateAudio(props.belongedPitchName)
// })

watch(
  () => props.belongedPitchName,
  (newVal) => {
    audioGenerator.generateAudio(newVal)
  },
)

onMounted(() => {
  // audioGenerator.generateAudio(props.belongedPitchName)
  watch(
    () => props.notePosition,
    (newPosition) => {
      const [newX, newY] = newPosition.value
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

function getMovementInNoteEditorRegion(event) {
  return {
    x: event.clientX - props.noteEditorRegionRef.getBoundingClientRect().left,
    y: event.clientY - props.noteEditorRegionRef.getBoundingClientRect().top,
  }
}

function draggableRegionHandler(event) {
  // 'insert' editor mode prohibit to drag note element
  if (noteItemMap.isInsertMode) return
  if (noteMainSelectedId.value !== props.id) noteMainSelectedId.value = props.id

  const selectionController = clearSelection()
  const id = props.id
  const belongedPitchName = props.belongedPitchName
  const mousedownX =
    event.clientX - editorNoteRef.value.getBoundingClientRect().left
  const mousedownY =
    event.clientY - editorNoteRef.value.getBoundingClientRect().top
  /*
   * Reserve in the future need to achieve vertical smooth movement effect
   * const mousedownY = event.clientY - editorNoteRef.value.getBoundingClientRect().top
   * */

  let newId = ""
  function mouseMoveHandler(event) {
    translateXDistance =
      event.clientX - props.noteEditorRegionRef.getBoundingClientRect().left

    translateYDistance =
      event.clientY - props.noteEditorRegionRef.getBoundingClientRect().top

    if (isLegalTranslateDistance(translateXDistance, translateYDistance)) {
      newId = noteItemMap.updateNoteItemPosition(
        id,
        belongedPitchName,
        [translateXDistance, translateYDistance],
        [mousedownX, mousedownY],
      )
    }
  }
  document.addEventListener("mousemove", mouseMoveHandler)
  document.addEventListener(
    "mouseup",
    () => {
      document.removeEventListener("mousemove", mouseMoveHandler)
      selectionController.abort()
      if (!newId) return
      noteItemMap.updateNoteItemsMap(
        id,
        newId,
        belongedPitchName,
        props.belongedPitchName,
      )
      noteMainSelectedId.value = newId
    },
    {
      once: true,
    },
  )
}

function stretchEditorNoteLength(event, stretchSide) {
  if (noteMainSelectedId.value !== props.id) noteMainSelectedId.value = props.id
  const selectionController = clearSelection()
  const { x: mousedownStartX } = getMovementInNoteEditorRegion(event)
  const initWidth = props.noteWidth
  const [initX] = props.notePosition.value
  function mousemoveHandler(event) {
    const { x: moveX } = getMovementInNoteEditorRegion(event)
    const stretchXLength = moveX - mousedownStartX

    const moveInfo = {
      id: props.id,
      pitchName: props.belongedPitchName,
      stretchXLength: stretchXLength,
      initWidth: initWidth,
      mousedownStartX,
      initX: initX,
      maxMovementRegionWidth: props.notePadWidth,
    }

    noteItemMap.stretchNoteWidth(moveInfo)
  }
  document.addEventListener("mousemove", mousemoveHandler)
  document.addEventListener(
    "mouseup",
    () => {
      document.removeEventListener("mousemove", mousemoveHandler)
      selectionController.abort()
    },
    {
      once: true,
    },
  )
}

let isMoved = false
let firstRapidMouseDown = 0
function noteMainMousedownHandler(event) {
  firstRapidMouseDown =
    firstRapidMouseDown === 0 ? event.timeStamp : firstRapidMouseDown

  const timeInterval = event.timeStamp - firstRapidMouseDown
  /*
   * If there is no second click within 300 milliseconds,
   * all the states changed by the first click will be reset
   * */
  const timer = setTimeout(() => {
    firstRapidMouseDown = 0
    isMoved = false
  }, 300)

  //A single click should execute the logic
  if (timeInterval === 0) {
    if (noteItemMap.isInsertMode) {
      noteItemMap.deleteNoteItem(props.id, props.belongedPitchName)
      noteMainSelectedId.value = ""
    }
    /*
     * For select editing mode, there is no logic that needs to be executed with a single click
     * */
  }
  //The second click(double click) should execute the logic
  if (timeInterval > 0 && timeInterval < 300) {
    /*
     * Clear the previous timer used to reset the state ,
     * because the second click was performed within 300 milliseconds
     * */
    clearTimeout(timer)

    /*
     * The following event handler function must be one-time ,
     * otherwise it will add up as the number of double clicks increases
     * */
    document.addEventListener(
      "mousemove",
      () => {
        isMoved = true
      },
      {
        once: true,
      },
    )
    document.addEventListener(
      "mouseup",
      () => {
        if (!isMoved) {
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
}
</script>

<template>
  <div
    class="editor-note"
    :class="{
      'is-edited': noteMainSelectedId === id,
      'is-selected': noteMainSelectedId === id && noteItemMap.isSelectMode,
    }"
    ref="editorNoteRef"
    @click.stop="() => {}"
    @dblclick.stop="() => {}"
    @mousedown.stop="draggableRegionHandler"
  >
    <div
      class="editor-note-left draggable-region"
      @mousedown.stop="
        (event) => {
          stretchEditorNoteLength(event, 'left')
        }
      "
    ></div>
    <div class="editor-note-main" @mousedown="noteMainMousedownHandler"></div>
    <div
      class="editor-note-right draggable-region"
      @mousedown.stop="
        (event) => {
          stretchEditorNoteLength(event, 'right')
        }
      "
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
  width: v-bind(noteWidth + "px");
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
