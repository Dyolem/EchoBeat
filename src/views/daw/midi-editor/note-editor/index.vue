<script setup>
import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  ref,
  useTemplateRef,
  watchEffect,
} from "vue"
import NotePad from "@/views/daw/midi-editor/note-editor/NotePad.vue"
import EditorWorkspace from "@/views/daw/midi-editor/note-editor/EditorWorkspace.vue"

import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import { useAudioStore } from "@/store/daw/audio/index.js"
import { useTrackFeatureMapStore } from "@/store/daw/track-feature-map/index.js"
import { usePianoKeySizeStore } from "@/store/daw/pianoKeySize.js"
import { storeToRefs } from "pinia"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import { useSelectionStore } from "@/store/daw/selection.js"
import { snapshotYSharedData } from "@/core/history/index.js"

const zoomRatioStore = useZoomRatioStore()
const trackFeatureMapStore = useTrackFeatureMapStore()
const noteItems = useNoteItemStore()
const audioStore = useAudioStore()
const beatControllerStore = useBeatControllerStore()
const { pixelsPerTick } = storeToRefs(beatControllerStore)
const { isSelectMode, isInsertMode } = storeToRefs(zoomRatioStore)
const selectionStore = useSelectionStore()
const { deleteAllSelectedNoteId, addSelectedNoteIds } = selectionStore
const props = defineProps({
  notePadWidth: {
    type: Number,
  },
  notePadHeight: {
    type: Number,
  },
  zoomRatio: {
    type: Number,
    default: 1,
  },
  editableViewWidth: {
    type: Number,
  },
  editableViewHeight: {
    type: Number,
  },
  trackRulerHeight: {
    type: Number,
    default: 50,
  },
})
const editorId = inject("subordinateEditorId")

const { filterEffect } = inject("playableAudioTrack")

const pianoKeySizeStore = usePianoKeySizeStore()
const { octaveItemHeight, chromaticInfo, noteTrackHeight } =
  storeToRefs(pianoKeySizeStore)
const { selectedAudioTrackId } = inject("selectedAudioTrackId")
const noteEditorContainerRef = useTemplateRef("noteEditorContainerRef")
const noteEditorRegionRef = useTemplateRef("noteEditorRegionRef")
const workspacePlaceHolderHeight = inject("workspacePlaceHolderHeight", ref(20))

const workspaceMap = computed(() => {
  return (
    trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      audioTrackId: selectedAudioTrackId.value,
    }) ?? []
  )
})

const svgHeight = computed(() => {
  return octaveItemHeight.value * chromaticInfo.value.octaveCount
})

const { updateCanvasContentHeight } = inject("canvasContentHeight")
watchEffect(() => {
  updateCanvasContentHeight(svgHeight.value + workspacePlaceHolderHeight.value)
})

const insertNoteController = new AbortController()
const clearSelectedNotesController = new AbortController()
onMounted(() => {
  if (!noteEditorContainerRef.value) return
  noteEditorContainerRef.value.addEventListener(
    "insert-note",
    (event) => {
      const { x: insertX, y: insertY } = event.detail.insertPosition
      insertNote({ x: insertX, y: insertY })
    },
    {
      signal: insertNoteController.signal,
    },
  )
  noteEditorContainerRef.value.addEventListener(
    "mouseup",
    () => {
      deleteAllSelectedNoteId()
    },
    { signal: clearSelectedNotesController.signal },
  )
})
onUnmounted(() => {
  clearSelectedNotesController.abort()
  insertNoteController.abort()
})

const { noteMainSelectedId } = inject("noteMainSelectedId")

const getCursorPositionInNoteEditorRegion = (event) => {
  if (!event) return
  const x =
    event.clientX - noteEditorRegionRef.value.getBoundingClientRect().left
  const y =
    event.clientY - noteEditorRegionRef.value.getBoundingClientRect().top
  return { x, y }
}
function insertNote({ x: insertX, y: insertY }) {
  if (insertX === undefined || insertY === undefined) return
  const insertedItemInfo = noteItems.insertNoteItem(
    {
      editorId: editorId.value,
      audioTrackId: selectedAudioTrackId.value,
      x: insertX / pixelsPerTick.value(editorId.value),
      y: insertY,
    },
    true,
  )
  if (!insertedItemInfo) return
  noteMainSelectedId.value = insertedItemInfo.id
  deleteAllSelectedNoteId()
  addSelectedNoteIds({
    audioTrackId: insertedItemInfo.audioTrackId,
    workspaceId: insertedItemInfo.workspaceId,
    noteId: insertedItemInfo.id,
  })
  audioStore
    .generateSingleAudioNode({
      noteId: insertedItemInfo.id,
      workspaceId: insertedItemInfo.workspaceId,
      audioTrackId: selectedAudioTrackId.value,
      audioContext: audioStore.audioContext,
    })
    .then(
      (controller) => {
        noteItems.simulatePlaySpecifiedNote(
          insertedItemInfo.pitchName,
          controller.signal,
        )
        snapshotYSharedData()
      },
      () => {},
    )
}
function triggerCustomizedInsertEvent({ x, y }) {
  noteEditorRegionRef.value.dispatchEvent(
    new CustomEvent("insert-note", {
      detail: {
        insertPosition: {
          x,
          y,
        },
      },
      bubbles: true,
    }),
  )
}
function noteEditorMousedownHandler(event) {
  if (isInsertMode.value) {
    const { x, y } = getCursorPositionInNoteEditorRegion(event)
    triggerCustomizedInsertEvent({ x, y })
  }
}
function noteEditorDblClickHandler(event) {
  if (isSelectMode.value) {
    const { x, y } = getCursorPositionInNoteEditorRegion(event)
    triggerCustomizedInsertEvent({ x, y })
  }
}
</script>

<template>
  <div
    class="note-editor-container"
    ref="noteEditorContainerRef"
    :style="{
      filter: filterEffect(selectedAudioTrackId),
    }"
    :class="{
      'is-inserted': isInsertMode,
    }"
  >
    <div class="workplace-track-placeholder">
      <EditorWorkspace
        v-for="[workspaceId, workspace] in workspaceMap"
        :key="workspaceId"
        :id="workspaceId"
        :sub-track-item-id="workspace.subTrackItemId"
        :editable-view-height="editableViewHeight"
        :editable-view-width="editableViewWidth"
        :editor-canvas-height="notePadHeight"
        :editor-canvas-width="notePadWidth"
        :workspace-handle-height="workspacePlaceHolderHeight"
        :current-workspace-zoom-ratio="zoomRatio"
        :noteEditorRegionRef="noteEditorRegionRef"
        :workspace-container-width="workspace.width"
        :start-position="workspace.startPosition"
        :note-items-map="workspace.noteItemsMap"
        :workspace-badge-name="workspace.workspaceBadgeName"
        :get-cursor-position-in-note-editor-region="
          getCursorPositionInNoteEditorRegion
        "
      ></EditorWorkspace>
    </div>
    <div
      class="note-editor-region"
      @dblclick="noteEditorDblClickHandler"
      @mousedown="noteEditorMousedownHandler"
      ref="noteEditorRegionRef"
    >
      <div class="note-pad-container" ref="notePadContainerRef">
        <note-pad
          :note-pad-width="notePadWidth"
          :note-pad-height="notePadHeight"
          :note-track-height="noteTrackHeight"
          :svg-height="svgHeight"
          :octave-count="chromaticInfo.octaveCount"
        ></note-pad>
      </div>
    </div>
  </div>
</template>

<style scoped>
.note-editor-container {
  --note-editor-width: v-bind(notePadWidth * pixelsPerTick(editorId) + "px");
  width: var(--note-editor-width);
}

.note-editor-region {
  position: relative;
  display: flex;
  width: var(--note-editor-width);
  height: v-bind(notePadHeight - workspacePlaceHolderHeight + "px");
  background-color: rgba(0, 0, 0, 0.3);
}

.is-inserted:hover {
  cursor:
    url(data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCA3MiA3MiI+PHBhdGggZmlsbD0iIzliOWI5YSIgZD0ibTU5LjQxIDE3LjU4bC0yLjU5OC0yLjU0MWwtMi41NS0yLjU4OXMtMTEuNTEgNy4wOTgtMTkuMTIgMTUuMjhjLTEwLjQxIDExLjE5LTE0LjU5IDE3LjItMTQuNTkgMTcuMmw2LjQ5NyA2LjQ3NWEyMTggMjE4IDAgMCAwIDE3LjE1LTE0LjY1YzguMTg4LTcuNjEzIDE1LjIyLTE5LjE4IDE1LjIyLTE5LjE4eiIvPjxwYXRoIGZpbGw9IiMzZjNmM2YiIGQ9Ik0zMC43NCAzMi44N2MtMy43NDYgMy43MDYtNy4wNzEgNy44MTItMTAuMTkgMTIuMDZsNi40NjYgNi4zNjRjNC4zMDgtMy4wNSA4LjI3Ny02LjQzNiAxMi4wNS0xMC4xM3oiLz48cGF0aCBmaWxsPSIjZDBjZmNlIiBzdHJva2U9IiNkMGNmY2UiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIgc3Ryb2tlLXdpZHRoPSIyIiBkPSJtMjcuMDIgNTEuMjlsLTUuNjM4IDYuMzZsLTcuNzk0Ljc3bC42My03LjgwN2w2LjMzNy01LjY4NyIvPjxwYXRoIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBzdHJva2Utd2lkdGg9IjIiIGQ9Im0xNy43NyA1NC4xMWwtMi45NyAzLjEybTkuNDktMi43NGwtMi45MDggMy4xNjRsLTcuNzk0Ljc3bC42My03LjgwN2wzLjIxNy0yLjk4NE01OS4xNCAxNy4yM2wtMi42MTYtMi41MjNsLTIuNTY5LTIuNTcxcy0xMS40NiA3LjE4MS0xOS4wMSAxNS40MmMtMTAuMzMgMTEuMjctMTQuNDcgMTcuMzEtMTQuNDcgMTcuMzFsNi41NDMgNi40MjhhMjE4IDIxOCAwIDAgMCAxNy4wNS0xNC43OGM4LjEzMy03LjY3MiAxNS4wOC0xOS4yOCAxNS4wOC0xOS4yOHpNMzguOTcgNDAuOTdsLTguMzkxLTguMjQzIi8+PC9zdmc+)
      4 19.75,
    auto;
}
.note-pad-container {
  position: absolute;
}
.workplace-track-placeholder {
  position: sticky;
  top: v-bind(trackRulerHeight + "px");
  display: flex;
  width: 100%;
  height: v-bind(workspacePlaceHolderHeight + "px");
  background-color: #000000;
  z-index: 10;
}
</style>
