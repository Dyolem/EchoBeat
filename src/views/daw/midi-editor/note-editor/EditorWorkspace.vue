<script setup>
import { computed, inject, onMounted, ref, useTemplateRef, watch } from "vue"
import NoteItem from "@/views/daw/midi-editor/note-editor/NoteItem.vue"
import { useWorkspaceStore } from "@/store/daw/workspace/index.js"
import WorkspaceHandle from "@/views/daw/midi-editor/note-editor/WorkspaceHandle.vue"
import clearSelection from "@/utils/clearSelection.js"
import { useTrackFeatureMapStore } from "@/store/daw/track-feature-map/index.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import {
  HORIZONTAL_BUFFER_ZONE_PIXELS_WIDTH,
  SUBORDINATE_EDITOR_ID,
  VERTICAL_BUFFER_ZONE_PIXELS_HEIGHT,
} from "@/constants/daw/index.js"
import { usePianoKeySizeStore } from "@/store/daw/pianoKeySize.js"
import { storeToRefs } from "pinia"
import { velocityToAlphaHex } from "@/core/audio/velocityToAlphaHex.js"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import { snapshotYSharedData } from "@/core/history/index.js"

const zoomRatioStore = useZoomRatioStore()
const workspaceStore = useWorkspaceStore()
const trackFeatureMapStore = useTrackFeatureMapStore()
const mixTrackEditorStore = useMixTrackEditorStore()
const beatControllerStore = useBeatControllerStore()
const { isSelectMode, isInsertMode } = storeToRefs(zoomRatioStore)

const editorId = inject("subordinateEditorId")
const props = defineProps({
  id: {
    type: [Number, String],
    required: true,
  },
  subTrackItemId: {
    type: String,
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
  editableViewWidth: {
    type: Number,
  },
  workspaceHandleHeight: {
    type: Number,
    default: 20,
  },
  currentWorkspaceZoomRatio: {
    type: Number,
    default: 1,
  },
  noteEditorRegionRef: {
    type: Object,
    default: null,
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
const { pixelsPerTick } = storeToRefs(beatControllerStore)

const pianoKeySizeStore = usePianoKeySizeStore()
const { noteTrackHeight: noteHeight } = storeToRefs(pianoKeySizeStore)

const { selectedAudioTrackId } = inject("selectedAudioTrackId")
const mainColor = inject("mainColor")
const noteBgColor = computed(() => {
  return (velocity) => {
    return `${mainColor.value}${velocityToAlphaHex(velocity)}`
  }
})
const workspacePlaceHolderHeight = inject("workspacePlaceHolderHeight", ref(20))

const workspaceMap = computed(() => {
  return trackFeatureMapStore.getSelectedTrackWorkspaceMap({
    selectedAudioTrackId: selectedAudioTrackId.value,
    featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
  })
})
const workspaceScrollContainerHeight = computed(() => {
  return props.editableViewHeight - props.workspaceHandleHeight
})
const workspaceScrollZoneHeight = computed(() => {
  return props.editorCanvasHeight - workspacePlaceHolderHeight.value
})
const noteEditorWorkspaceContainerRef = useTemplateRef(
  "noteEditorWorkspaceContainerRef",
)

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

const horizontalBufferZoneWidth = computed(
  () =>
    (props.editableViewWidth + HORIZONTAL_BUFFER_ZONE_PIXELS_WIDTH) /
    pixelsPerTick.value(editorId.value),
)
const safeZoneWidth = computed(() => {
  const scrollLeft = scrollMovement.value.scrollLeft
  return [
    scrollLeft / pixelsPerTick.value(editorId.value) -
      horizontalBufferZoneWidth.value,
    (scrollLeft + props.editableViewWidth) /
      pixelsPerTick.value(editorId.value) +
      horizontalBufferZoneWidth.value,
  ]
})
const safeZoneHeight = computed(() => {
  const scrollTop = scrollMovement.value.scrollTop
  return [
    scrollTop - VERTICAL_BUFFER_ZONE_PIXELS_HEIGHT,
    scrollTop + props.editableViewHeight + VERTICAL_BUFFER_ZONE_PIXELS_HEIGHT,
  ]
})
const isDisplay = computed(() => {
  const [minTick, maxTick] = safeZoneWidth.value
  const [minPixels, maxPixels] = safeZoneHeight.value
  return (noteStartTick, noteVerticalPixels) => {
    return (
      !(noteStartTick < minTick || noteStartTick > maxTick) &&
      !(noteVerticalPixels < minPixels || noteVerticalPixels > maxPixels)
    )
  }
})

function scrollHandler(event) {
  const scrollTop = event.target.scrollTop
  updateScrollMovement({ scrollTop })
}
function triggerCustomizedInsertEvent(event) {
  const eventType = event.type
  if (
    (isSelectMode.value && eventType === "dblclick") ||
    (isInsertMode.value && eventType === "mousedown")
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
  const workspace = workspaceMap.value.get(props.id)
  let mousemoveXInWorkspace =
    event.clientX -
    noteEditorWorkspaceContainerRef.value.getBoundingClientRect().left
  if (
    mousemoveXInWorkspace > edgeWidth &&
    mousemoveXInWorkspace <
      workspace.width * pixelsPerTick.value(editorId.value) - edgeWidth
  ) {
    isStretchable.value = false
    workspaceScrollZoneRef.value.style.cursor = "inherit"
  } else {
    isStretchable.value = true
    workspaceScrollZoneRef.value.style.cursor = "col-resize"
  }
}

function stretchWorkspaceWidth(event) {
  if (!isStretchable.value) return

  event.stopPropagation() //避免选区事件被注册，选区事件会在创建选区后禁用一切冒泡至document的mouseup事件
  const controller = new AbortController()
  const selectionController = clearSelection()
  const workspace = workspaceMap.value.get(props.id)
  const initWorkspaceStartPosition = workspace.startPosition
  const initWorkspaceWidth = workspace.width
  const initRightEdgeX = initWorkspaceStartPosition + initWorkspaceWidth
  const { x: stretchStart } = props.getCursorPositionInNoteEditorRegion(event)
  const mousedownXInNoteEditorWorkspaceContainer =
    event.clientX -
    noteEditorWorkspaceContainerRef.value.getBoundingClientRect().left

  let hasMoved = false
  document.addEventListener(
    "mousemove",
    (event) => {
      hasMoved = true
      const { x: stretchEnd } = props.getCursorPositionInNoteEditorRegion(event)

      if (
        mousedownXInNoteEditorWorkspaceContainer <
        (initWorkspaceWidth * pixelsPerTick.value(editorId.value)) / 2
      ) {
        const newLeftEdgeX =
          (stretchEnd - stretchStart) / pixelsPerTick.value(editorId.value) +
          initWorkspaceStartPosition
        workspaceStore.updateLeftEdge({
          editorId: editorId.value,
          audioTrackId: selectedAudioTrackId.value,
          workspaceId: props.id,
          x: newLeftEdgeX,
          initRightEdgeX,
        })
        mixTrackEditorStore.updateLeftEdge({
          editorId: editorId.value,
          audioTrackId: selectedAudioTrackId.value,
          subTrackItemId: props.subTrackItemId,
          x: newLeftEdgeX,
          initRightEdgeX,
        })
      } else {
        const newRightEdgeX =
          (stretchEnd - stretchStart) / pixelsPerTick.value(editorId.value) +
          initWorkspaceWidth +
          initWorkspaceStartPosition
        const initLeftEdgeX = initWorkspaceStartPosition
        workspaceStore.updateRightEdge({
          editorId: SUBORDINATE_EDITOR_ID,
          audioTrackId: selectedAudioTrackId.value,
          workspaceId: props.id,
          x: newRightEdgeX,
          initLeftEdgeX,
        })
        mixTrackEditorStore.updateRightEdge({
          editorId: SUBORDINATE_EDITOR_ID,
          audioTrackId: selectedAudioTrackId.value,
          subTrackItemId: props.subTrackItemId,
          x: newRightEdgeX,
          initLeftEdgeX,
        })
      }
    },
    {
      signal: controller.signal,
    },
  )

  document.addEventListener(
    "mouseup",
    (e) => {
      e.stopPropagation()
      controller.abort()
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
</script>

<template>
  <div
    class="note-editor-workspace-container"
    ref="noteEditorWorkspaceContainerRef"
  >
    <div class="workspace-handle">
      <WorkspaceHandle
        :id="id"
        :sub-track-item-id="subTrackItemId"
        :noteEditorRegionRef="noteEditorRegionRef"
        :note-pad-width="editorCanvasWidth"
        :start-position="startPosition"
        :workspace-container-width="workspaceContainerWidth"
        :workspace-badge-name="workspaceBadgeName"
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
          v-for="[noteId, noteItem] in noteItemsMap"
          :id="noteId"
          :key="noteId"
        >
          <note-item
            v-if="isDisplay(noteItem.relativeX + startPosition, noteItem.y)"
            :id="noteId"
            :workspace-id="id"
            :audio-track-id="noteItem.audioTrackId"
            :belonged-pitch-name="noteItem.pitchName"
            :note-width="noteItem.width"
            :note-height="noteHeight"
            :note-pad-width="editorCanvasWidth"
            :note-pad-height="editorCanvasHeight"
            :x="noteItem.relativeX"
            :y="noteItem.y"
            :workspace-start-position="startPosition"
            :noteEditorRegionRef="noteEditorRegionRef"
            :note-back-ground-color="noteBgColor(noteItem.velocity)"
          ></note-item>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.note-editor-workspace-container {
  --workspace-container-width: v-bind(
    workspaceContainerWidth * pixelsPerTick(editorId) + "px"
  );
  --workspace-start-position: v-bind(
    startPosition * pixelsPerTick(editorId) + "px"
  );
  position: absolute;
  width: var(--workspace-container-width);
  height: v-bind(editableViewHeight + "px");
  pointer-events: none;
  transform: translateX(var(--workspace-start-position));
  scrollbar-width: none;
}
.workspace-handle {
  width: var(--workspace-container-width);
  height: v-bind(workspaceHandleHeight + "px");
  background-color: #000000;
}
.note-editor-workspace {
  overflow: hidden auto;
  scrollbar-width: none;
  width: 100%;
  height: v-bind(workspaceScrollContainerHeight + "px");
  background-color: v-bind(mainColor + "22");
  pointer-events: initial;
}
.workspace-scroll-zone {
  position: relative;
  width: 100%;
  height: v-bind(workspaceScrollZoneHeight + "px");
}
</style>
