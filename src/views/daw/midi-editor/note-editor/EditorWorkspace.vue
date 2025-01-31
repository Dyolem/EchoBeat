<script setup>
import { computed, inject, onMounted, ref, useTemplateRef, watch } from "vue"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import NoteItem from "@/views/daw/midi-editor/note-editor/NoteItem.vue"
import { useWorkspaceStore } from "@/store/daw/workspace/index.js"
import WorkspaceHandle from "@/views/daw/midi-editor/note-editor/WorkspaceHandle.vue"
import clearSelection from "@/utils/clearSelection.js"
import { useTrackFeatureMapStore } from "@/store/daw/track-feature-map/index.js"
const noteItemStore = useNoteItemStore()
const workspaceStore = useWorkspaceStore()
const trackFeatureMapStore = useTrackFeatureMapStore()

const props = defineProps({
  id: {
    type: [Number, String],
    required: true,
  },
  editorCanvasHeight: {
    type: Number,
  },
  editorCanvasWidth: {
    type: Number,
  },
  editableViewHeight: {
    type: Number,
  },
  workspaceHandleHeight: {
    type: Number,
    default: 20,
  },
  zoomRatio: {
    type: Number,
    default: 1,
  },
  noteEditorRegionRef: {
    type: Object,
    required: true,
  },
  workspaceContainerWidth: {
    type: Number,
  },
  startPosition: {
    type: Number,
    default: 0,
  },
  noteItemsMap: {
    type: Object,
  },
  workspaceBadgeName: {
    type: String,
    default: "Instrument",
  },
  getCursorPositionInNoteEditorRegion: {
    type: Function,
    required: true,
  },
})
const audioTrackId = inject("audioTrackId")
const { selectedAudioTrackId } = inject("selectedAudioTrackId")
const workspaceMap = computed(() => {
  return trackFeatureMapStore.getSelectedTrackFeature({
    selectedAudioTrackId: selectedAudioTrackId.value,
    featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
  })
})
const workspaceScrollContainerHeight = computed(() => {
  return props.editableViewHeight - props.workspaceHandleHeight
})
const noteEditorWorkspaceContainerRef = useTemplateRef(
  "noteEditorWorkspaceContainerRef",
)

const getNotePosition = (x, y) => {
  if (x === undefined || y === undefined) return
  return ref([x, y])
}
const chromaticInfo = inject("chromaticInfo")
const pianoKeySize = inject("pianoKeySize")
const whiteKeyHeight = computed(() => {
  return pianoKeySize.value.whiteKeyHeight
})
const OCTAVE_KEY_COUNT = 12
const OCTAVE_WHITE_KEY_COUNT = 7
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

const { scrollMovement, updateScrollMovement } = inject("scrollMovement")
const noteEditorWorkspaceRef = useTemplateRef("noteEditorWorkspaceRef")
onMounted(() => {
  watch(
    scrollMovement,
    (newScrollMovement) => {
      noteEditorWorkspaceRef.value.scrollTop = newScrollMovement.scrollTop
    },
    { deep: true, immediate: true },
  )
})

function scrollHandler(event) {
  const scrollTop = event.target.scrollTop
  updateScrollMovement({ scrollTop })
}
function triggerCustomizedInsertEvent(event) {
  const eventType = event.type
  if (
    (noteItemStore.isSelectMode && eventType === "dblclick") ||
    (noteItemStore.isInsertMode && eventType === "mousedown")
  ) {
    const { x, y } = props.getCursorPositionInNoteEditorRegion(event)
    noteEditorWorkspaceRef.value.dispatchEvent(
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
}

const isStretchable = ref(false)
const workspaceScrollZoneRef = useTemplateRef("workspaceScrollZoneRef")
function stretchableJudgement(event) {
  // 鼠标触发区域的边缘宽度
  const edgeWidth = 10
  const workspaceMap = trackFeatureMapStore.getSelectedTrackFeature({
    selectedAudioTrackId: selectedAudioTrackId.value,
    featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
  })
  const workspace = workspaceMap.get(props.id)
  let mousemoveXInWorkspace =
    event.clientX -
    noteEditorWorkspaceContainerRef.value.getBoundingClientRect().left
  if (
    mousemoveXInWorkspace > edgeWidth &&
    mousemoveXInWorkspace < workspace.width - edgeWidth
  ) {
    isStretchable.value = false
    workspaceScrollZoneRef.value.style.cursor = "auto"
  } else {
    isStretchable.value = true
    workspaceScrollZoneRef.value.style.cursor = "col-resize"
  }
}

function stretchWorkspaceWidth(event) {
  if (!isStretchable.value) return

  const controller = new AbortController()
  const selectionController = clearSelection()
  const workspaceMap = trackFeatureMapStore.getSelectedTrackFeature({
    selectedAudioTrackId: selectedAudioTrackId.value,
    featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
  })
  const workspace = workspaceMap.get(props.id)
  const initWorkspaceStartPosition = workspace.startPosition
  const initWorkspaceWidth = workspace.width
  const { x: stretchStart } = props.getCursorPositionInNoteEditorRegion(event)
  const mousedownXInNoteEditorWorkspaceContainer =
    event.clientX -
    noteEditorWorkspaceContainerRef.value.getBoundingClientRect().left

  document.addEventListener(
    "mousemove",
    (event) => {
      const { x: stretchEnd } = props.getCursorPositionInNoteEditorRegion(event)
      workspaceStore.updateWorkspaceWidth({
        workspaceId: props.id,
        selectedAudioTrackId: selectedAudioTrackId.value,
        maxWidth: props.editorCanvasWidth,
        minWidth: noteItemStore.noteWidth,
        initWorkspaceStartPosition,
        initWorkspaceWidth,
        mousedownX: mousedownXInNoteEditorWorkspaceContainer,
        stretchStart,
        stretchEnd: stretchEnd,
        stretchableDirection: {
          leftSide: { positive: false, negative: true },
          rightSide: { positive: true, negative: true },
        },
      })
    },
    {
      signal: controller.signal,
    },
  )

  document.addEventListener(
    "mouseup",
    () => {
      controller.abort()
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
    class="note-editor-workspace-container"
    ref="noteEditorWorkspaceContainerRef"
  >
    <div class="workspace-handle">
      <WorkspaceHandle
        :id="id"
        :zoom-ratio="zoomRatio"
        :noteEditorRegionRef="noteEditorRegionRef"
        :note-pad-width="editorCanvasWidth"
        :start-position="startPosition"
        :workspace-container-width="workspaceContainerWidth"
      ></WorkspaceHandle>
    </div>
    <div
      class="note-editor-workspace"
      ref="noteEditorWorkspaceRef"
      @scroll="scrollHandler"
      @mousedown="triggerCustomizedInsertEvent"
      @dblclick="triggerCustomizedInsertEvent"
    >
      <div
        class="workspace-scroll-zone"
        ref="workspaceScrollZoneRef"
        @mousemove="stretchableJudgement"
        @mousedown="stretchWorkspaceWidth"
      >
        <template
          class="note-editor-track"
          v-for="[pitchName, noteTrack] in noteItemsMap"
          :style="{ transform: `translateY(${noteTrack.positionY}px)` }"
          :id="pitchName"
        >
          <note-item
            v-for="noteItem in noteTrack.noteItems"
            :key="noteItem.id"
            :id="noteItem.id"
            :workspace-id="id"
            :belonged-pitch-name="noteItem.pitchName"
            :note-width="noteItem.width"
            :note-height="noteHeight"
            :note-pad-width="editorCanvasWidth"
            :note-pad-height="editorCanvasHeight"
            :note-position="getNotePosition(noteItem.x, noteItem.y)"
            :workspace-start-position="startPosition"
            :noteEditorRegionRef="noteEditorRegionRef"
          ></note-item>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.note-editor-workspace-container {
  position: absolute;
  width: v-bind(workspaceContainerWidth + "px");
  height: v-bind(editableViewHeight + "px");
  pointer-events: none;
  transform: v-bind("`translateX(${startPosition}px)`");
  scrollbar-width: none;
}
.workspace-handle {
  width: v-bind(workspaceContainerWidth + "px");
  height: v-bind(workspaceHandleHeight + "px");
  background-color: #000000;
}
.note-editor-workspace {
  overflow: hidden auto;
  scrollbar-width: none;
  width: 100%;
  height: v-bind(workspaceScrollContainerHeight + "px");
  background-color: rgba(97, 9, 138, 0.3);
  pointer-events: initial;
}
.workspace-scroll-zone {
  position: relative;
  width: 100%;
  height: v-bind(editorCanvasHeight + "px");
}
</style>
