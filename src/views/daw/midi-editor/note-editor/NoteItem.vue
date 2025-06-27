<script setup>
import { inject, ref, useTemplateRef, watch } from "vue"
import clearSelection from "@/utils/clearSelection.js"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import { useAudioGeneratorStore } from "@/store/daw/audio/audioGenerator.js"
import { ZIndex } from "@/constants/daw/index.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { storeToRefs } from "pinia"
import { useAudioStore } from "@/store/daw/audio/index.js"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import { useSelectionStore } from "@/store/daw/selection.js"
import { snapshotYSharedData } from "@/core/history/index.js"

const audioStore = useAudioStore()
const beatControllerStore = useBeatControllerStore()
const { pixelsPerTick } = storeToRefs(beatControllerStore)
const zoomRatioStore = useZoomRatioStore()
const noteItemMap = useNoteItemStore()
const audioGenerator = useAudioGeneratorStore()
const { isSelectMode, isInsertMode } = storeToRefs(zoomRatioStore)
const selectionStore = useSelectionStore()
const { selectionRectMap, whetherInSelectionBox, selectedNotesIdMap } =
  storeToRefs(selectionStore)
const { addSelectedNoteIds, deleteSelectedNoteId, deleteAllSelectedNoteId } =
  selectionStore
const editorNoteRef = useTemplateRef("editorNoteRef")
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  workspaceId: {
    type: String,
    required: true,
  },
  audioTrackId: {
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
  x: {
    type: Number,
    default: 0,
  },
  y: {
    type: Number,
    default: 0,
  },
  noteEditorRegionRef: {
    type: Object,
    default: null,
  },
  workspaceStartPosition: {
    type: Number,
    default: 0,
  },
})
const midiEditorId = inject("subordinateEditorId")
const { selectedAudioTrackId } = inject("selectedAudioTrackId")
const editorNoteZIndex = ref(ZIndex.EDITOR_NOTE)
const { noteMainSelectedId, updateNoteMainSelectedId } =
  inject("noteMainSelectedId")

watch(
  selectionRectMap,
  () => {
    let isOverlap = false
    const noteItemId = props.id
    const _pixelsPerTick = pixelsPerTick.value(midiEditorId.value)
    const noteItemRect = {
      startX: (props.x + props.workspaceStartPosition) * _pixelsPerTick,
      startY: props.y + 20,
      width: props.noteWidth * _pixelsPerTick,
      height: props.noteHeight,
    }
    isOverlap = whetherInSelectionBox.value(midiEditorId.value, noteItemRect)
    if (isOverlap) {
      addSelectedNoteIds({
        audioTrackId: props.audioTrackId,
        workspaceId: props.workspaceId,
        noteId: props.id,
      })
    } else {
      deleteSelectedNoteId(noteItemId)
    }
  },
  { deep: true },
)

let translateXDistance = 0
let translateYDistance = 0
function isLegalTranslateDistance(translateXDistance, translateYDistance) {
  return (
    translateXDistance >= 0 &&
    translateXDistance <=
      (props.notePadWidth - props.noteWidth) *
        pixelsPerTick.value(midiEditorId.value) &&
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

function playNoteAudioSample({ audioTrackId, pitchName }) {
  const audioController = audioGenerator.generateAudio({
    audioTrackId,
    noteName: pitchName,
  })
  setTimeout(() => {
    audioController?.abort()
  }, 100)
}

function draggableRegionHandler(event) {
  if (isInsertMode.value) return
  if (noteMainSelectedId.value !== props.id) updateNoteMainSelectedId(props.id)
  if (!selectedNotesIdMap.value.has(props.id)) {
    deleteAllSelectedNoteId()
    addSelectedNoteIds({
      audioTrackId: props.audioTrackId,
      workspaceId: props.workspaceId,
      noteId: props.id,
    })
  }

  const selectionController = clearSelection()
  const id = props.id
  const belongedPitchName = props.belongedPitchName
  const mousedownX =
    event.clientX - editorNoteRef.value.getBoundingClientRect().left
  const mousedownY =
    event.clientY - editorNoteRef.value.getBoundingClientRect().top
  let lastPitchName = props.belongedPitchName
  /*
   * Reserve in the future need to achieve vertical smooth movement effect
   * const mousedownY = event.clientY - editorNoteRef.value.getBoundingClientRect().top
   * */

  let hasMoved = false
  function mouseMoveHandler(event) {
    translateXDistance =
      event.clientX -
      props.noteEditorRegionRef.getBoundingClientRect().left -
      mousedownX

    translateYDistance =
      event.clientY -
      props.noteEditorRegionRef.getBoundingClientRect().top -
      mousedownY

    if (isLegalTranslateDistance(translateXDistance, translateYDistance)) {
      hasMoved = true
      const audioTrackId = selectedAudioTrackId.value
      noteItemMap
        .updateNoteItemPosition({
          editorId: midiEditorId.value,
          id,
          selectedNotesIdMap: selectedNotesIdMap.value,
          audioTrackId,
          workspaceId: props.workspaceId,
          pitchName: belongedPitchName,
          x: translateXDistance / pixelsPerTick.value(midiEditorId.value),
          y: translateYDistance,
        })
        .then(
          ({ newPitchName }) => {
            if (newPitchName !== lastPitchName) {
              playNoteAudioSample({
                audioTrackId,
                pitchName: newPitchName,
              })
              noteItemMap.simulatePlaySpecifiedNote(newPitchName)
              lastPitchName = newPitchName
            }
          },
          (error) => {
            console.warn(error)
          },
        )
    }
  }
  document.addEventListener("mousemove", mouseMoveHandler)
  document.addEventListener(
    "mouseup",
    (e) => {
      e.stopPropagation()
      document.removeEventListener("mousemove", mouseMoveHandler)
      selectionController.abort()
      if (hasMoved) {
        snapshotYSharedData()
        hasMoved = true
      }
    },
    {
      once: true,
      capture: true,
    },
  )
}

function stretchEditorNoteLength(event) {
  if (noteMainSelectedId.value !== props.id) updateNoteMainSelectedId(props.id)
  if (!selectedNotesIdMap.value.has(props.id)) {
    deleteAllSelectedNoteId()
    addSelectedNoteIds({
      audioTrackId: props.audioTrackId,
      workspaceId: props.workspaceId,
      noteId: props.id,
    })
  }

  const selectionController = clearSelection()
  const { x: mousedownStartX } = getMovementInNoteEditorRegion(event)
  const initWidth = props.noteWidth
  const initX = props.x

  let hasMoved = false
  function mousemoveHandler(event) {
    hasMoved = true
    const { x: moveX } = getMovementInNoteEditorRegion(event)
    const deltaX = moveX - mousedownStartX
    const pixelsWorkspaceStartPosition =
      props.workspaceStartPosition * pixelsPerTick.value(midiEditorId.value)
    const pixelsInitX = initX * pixelsPerTick.value(midiEditorId.value)
    const pixelsInitWidth = initWidth * pixelsPerTick.value(midiEditorId.value)
    const mousedownXInNote =
      mousedownStartX - (pixelsInitX + pixelsWorkspaceStartPosition)
    const tickDeltaX = deltaX / pixelsPerTick.value(midiEditorId.value)
    if (mousedownXInNote < pixelsInitWidth / 2) {
      noteItemMap
        .updateNoteLeftEdge({
          editorId: midiEditorId.value,
          id: props.id,
          selectedNotesId: selectedNotesIdMap.value,
          audioTrackId: selectedAudioTrackId.value,
          workspaceId: props.workspaceId,
          absoluteX: initX + props.workspaceStartPosition + tickDeltaX,
          initRightEdgeX: initX + initWidth + props.workspaceStartPosition,
        })
        .catch(() => {})
    } else {
      noteItemMap
        .updateNoteRightEdge({
          editorId: midiEditorId.value,
          id: props.id,
          selectedNotesId: selectedNotesIdMap.value,
          audioTrackId: selectedAudioTrackId.value,
          workspaceId: props.workspaceId,
          absoluteX:
            initX + props.workspaceStartPosition + initWidth + tickDeltaX,
          initLeftEdgeX: initX + props.workspaceStartPosition,
        })
        .catch(() => {})
    }
  }
  document.addEventListener("mousemove", mousemoveHandler)
  document.addEventListener(
    "mouseup",
    (e) => {
      e.stopPropagation()
      document.removeEventListener("mousemove", mousemoveHandler)
      selectionController.abort()
      if (hasMoved) {
        snapshotYSharedData()
        hasMoved = false
      }
    },
    {
      once: true,
      capture: true,
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
    if (isInsertMode.value) {
      noteItemMap.deleteNoteItem({
        id: props.id,
        workspaceId: props.workspaceId,
        audioTrackId: selectedAudioTrackId.value,
        pitchName: props.belongedPitchName,
      })
      updateNoteMainSelectedId("")
      snapshotYSharedData()
    } else {
      /*
       * In selected mode, a single click will play the corresponding sound name
       * */
      audioStore
        .generateSingleAudioNode({
          noteId: props.id,
          workspaceId: props.workspaceId,
          audioTrackId: props.audioTrackId,
          audioContext: audioStore.audioContext,
        })
        .then(
          (controller) => {
            noteItemMap.simulatePlaySpecifiedNote(
              props.belongedPitchName,
              controller.signal,
            )
          },
          () => {},
        )
    }
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
      (e) => {
        e.stopPropagation()
        if (!isMoved) {
          noteItemMap.deleteNoteItem({
            id: props.id,
            workspaceId: props.workspaceId,
            audioTrackId: selectedAudioTrackId.value,
            pitchName: props.belongedPitchName,
          })
          snapshotYSharedData()
        } else {
          isMoved = false
        }
      },
      {
        once: true,
        capture: true,
      },
    )
  }
}
</script>

<template>
  <div
    class="editor-note"
    :class="{
      'is-edited': selectedNotesIdMap.has(id),
      'is-selected': selectedNotesIdMap.has(id) && isSelectMode,
    }"
    ref="editorNoteRef"
    @click.stop="() => {}"
    @dblclick.stop="() => {}"
    @mouseup.stop="() => {}"
    @mousedown.stop="draggableRegionHandler"
  >
    <div
      class="editor-note-left draggable-region"
      @mousedown.stop="stretchEditorNoteLength"
    ></div>
    <div class="editor-note-main" @mousedown="noteMainMousedownHandler"></div>
    <div
      class="editor-note-right draggable-region"
      @mousedown.stop="
        (event) => {
          stretchEditorNoteLength(event)
        }
      "
    ></div>
  </div>
</template>

<style scoped>
.editor-note {
  --note-background-color: v-bind(noteBackGroundColor);
  --translateX: v-bind(x * pixelsPerTick(midiEditorId) + "px");
  --translateY: v-bind(y + "px");
  --note-width: v-bind(noteWidth * pixelsPerTick(midiEditorId) + "px");
  box-sizing: border-box;
  position: absolute;
  overflow: hidden;
  display: flex;
  width: var(--note-width);
  height: v-bind(noteHeight + "px");
  background-color: var(--note-background-color);
  border-radius: 2px;
  z-index: v-bind(editorNoteZIndex);
  border: 1px solid
    color-mix(in srgb, var(--note-background-color), #ffffff 50%);
  transform: translate(var(--translateX), var(--translateY));
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
}
</style>
