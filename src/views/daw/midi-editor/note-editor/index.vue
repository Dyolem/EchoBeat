<script setup>
import {
  computed,
  inject,
  onMounted,
  onUnmounted,
  provide,
  ref,
  useTemplateRef,
  watch,
  watchEffect,
} from "vue"
import NotePad from "@/views/daw/midi-editor/note-editor/NotePad.vue"
import EditorWorkspace from "@/views/daw/midi-editor/note-editor/EditorWorkspace.vue"

import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import { useWorkspaceStore } from "@/store/daw/workspace/index.js"
import { useEditorGridParametersStore } from "@/store/daw/editor-parameters/index.js"
import { useAudioGeneratorStore } from "@/store/daw/audio/audioGenerator.js"
import { useTrackFeatureMapStore } from "@/store/daw/track-feature-map/index.js"

const editorGridParametersStore = useEditorGridParametersStore()
const trackFeatureMapStore = useTrackFeatureMapStore()
const noteItems = useNoteItemStore()
const workspaceStore = useWorkspaceStore()
const audioGenerator = useAudioGeneratorStore()

const OCTAVE_KEY_COUNT = 12
const OCTAVE_WHITE_KEY_COUNT = 7
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
  workspaceBadgeName: {
    type: String,
    default: "Instruments",
  },
})

const { selectedAudioTrackId } = inject("selectedAudioTrackId")
watchEffect(() => {
  console.log(selectedAudioTrackId.value)
})
const noteEditorContainerRef = useTemplateRef("noteEditorContainerRef")
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
    ).toFixed(3),
  )
})
const workspaceMap = computed(() => {
  return (
    trackFeatureMapStore.getSelectedTrackFeature({
      selectedAudioTrackId: selectedAudioTrackId.value,
      featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
    }) ?? []
  )
})

const controller = new AbortController()
onMounted(() => {
  if (!noteEditorContainerRef.value) return
  noteEditorContainerRef.value.addEventListener(
    "insert-note",
    (event) => {
      const { x: insertX, y: insertY } = event.detail.insertPosition
      insertNote({ x: insertX, y: insertY })
    },
    {
      signal: controller.signal,
    },
  )
})
onUnmounted(() => {
  controller.abort()
})
watch(
  noteHeight,
  (newVal) => {
    noteItems.noteHeight = newVal
    editorGridParametersStore.minGridVerticalMovement = newVal
  },
  { immediate: true },
)
watchEffect(() => {
  editorGridParametersStore.editorWidth = props.notePadWidth
})

const noteMainSelectedId = ref("")
function updateNoteMainSelectedId(newVal) {
  noteMainSelectedId.value = newVal
}
provide("noteMainSelectedId", { noteMainSelectedId, updateNoteMainSelectedId })
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
      audioTrackId: selectedAudioTrackId.value,
      x: insertX,
      y: insertY,
    },
    true,
  )
  if (!insertedItemInfo) return
  noteMainSelectedId.value = insertedItemInfo.id

  audioGenerator
    .generateAudio(insertedItemInfo.pitchName)
    .then((controller) => {
      controller?.abort()
    })
  noteItems.simulatePlaySpecifiedNote(insertedItemInfo.pitchName)
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
  console.log(event)
  if (noteItems.isSelectMode) {
    if (noteMainSelectedId.value !== "") {
      noteMainSelectedId.value = ""
    }
  } else if (noteItems.isInsertMode) {
    const { x, y } = getCursorPositionInNoteEditorRegion(event)
    triggerCustomizedInsertEvent({ x, y })
  }
}
function noteEditorDblClickHandler(event) {
  if (noteItems.isSelectMode) {
    const { x, y } = getCursorPositionInNoteEditorRegion(event)
    triggerCustomizedInsertEvent({ x, y })
  }
}
watch(
  () => props.zoomRatio,
  (newTrackZoomRatio, oldTrackZoomRatio) => {
    noteItems.patchUpdateNoteItemsWidth({
      audioTrackId: selectedAudioTrackId.value,
      newTrackZoomRatio,
      oldTrackZoomRatio,
    })
    workspaceStore.patchUpdateWorkspaceWithZoomRatio(workspaceMap.value, {
      newZoomRatio: newTrackZoomRatio,
      oldZoomRatio: oldTrackZoomRatio,
    })
  },
)

const workspacePlaceHolderHeight = inject("workspacePlaceHolderHeight", 20)
</script>

<template>
  <div class="note-editor-container" ref="noteEditorContainerRef">
    <div class="workplace-track-placeholder">
      <EditorWorkspace
        v-for="[workspaceId, workspace] in workspaceMap"
        :key="workspaceId"
        :id="workspaceId"
        :editable-view-height="editableViewHeight"
        :editor-canvas-height="notePadHeight"
        :editor-canvas-width="notePadWidth"
        :workspace-handle-height="workspacePlaceHolderHeight"
        :zoom-ratio="zoomRatio"
        :noteEditorRegionRef="noteEditorRegionRef"
        :workspace-container-width="workspace.width"
        :start-position="workspace.startPosition"
        :note-items-map="workspace.noteItemsMap"
        :workspace-badge-name="workspaceBadgeName"
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
      :class="{
        'is-inserted': noteItems.isInsertMode,
      }"
    >
      <div class="note-pad-container" ref="notePadContainerRef">
        <note-pad
          :note-pad-width="notePadWidth"
          :note-pad-height="notePadHeight"
          :octave-count="chromaticInfo.octaveCount"
        ></note-pad>
      </div>
    </div>
  </div>
</template>

<style scoped>
.note-editor-container {
  width: v-bind(notePadWidth + "px");
}

.note-editor-region {
  position: relative;
  display: flex;
  width: v-bind(notePadWidth + "px");
  height: v-bind(notePadHeight + "px");
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
