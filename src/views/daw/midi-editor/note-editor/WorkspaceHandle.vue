<script setup>
import { computed, inject, ref, useTemplateRef } from "vue"
import clearSelection from "@/utils/clearSelection.js"
import { useWorkspaceStore } from "@/store/daw/workspace/index.js"
import { colorMix } from "@/utils/colorMix.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { SUBORDINATE_EDITOR_ID } from "@/constants/daw/index.js"
import { storeToRefs } from "pinia"
import { snapshotYSharedData } from "@/core/history/index.js"
const workspaceStore = useWorkspaceStore()
const mixTrackEditorStore = useMixTrackEditorStore()
const beatControllerStore = useBeatControllerStore()
const { pixelsPerTick } = storeToRefs(beatControllerStore)

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
  noteEditorRegionRef: {
    type: [Object, null],
    default: () => null,
    required: true,
  },
  notePadWidth: {
    type: Number,
  },
  workspaceBadgeName: {
    type: String,
    default: "Instruments",
  },
  startPosition: {
    type: Number,
    default: 0,
  },
  workspaceContainerWidth: {
    type: Number,
    default: 80,
  },
})
const { selectedAudioTrackId } = inject("selectedAudioTrackId")
const mainColor = inject("mainColor")
const workspaceHandleBgColor = computed(() => {
  return colorMix("srgb", mainColor.value, "#000 10%")
})
const workspaceBadgeNameBgColor = computed(() => {
  return colorMix("srgb", mainColor.value, "#000 30%")
})

const grabbingWorkspaceHandleRef = useTemplateRef("grabbingWorkspaceHandleRef")
function workspaceGrabbingHandler(e) {
  e.stopPropagation() //避免选区事件被注册，选区事件会在创建选区后禁用一切冒泡至document的mouseup事件
  isMovementHandleActive.value = true
  const mousedownPositionXInWorkSpace =
    e.clientX - grabbingWorkspaceHandleRef.value.getBoundingClientRect().left
  const controller = new AbortController()
  const clearSelectionController = clearSelection()
  const scale = [0, props.notePadWidth - props.workspaceContainerWidth]
  let hasMoved = false
  document.addEventListener(
    "mousemove",
    (event) => {
      hasMoved = true
      const workspaceStartPosition =
        event.clientX -
        props.noteEditorRegionRef.getBoundingClientRect().left -
        mousedownPositionXInWorkSpace
      const tickStartPosition =
        workspaceStartPosition / pixelsPerTick.value(editorId.value)
      workspaceStore.updateWorkspacePosition({
        editorId: SUBORDINATE_EDITOR_ID,
        workspaceId: props.id,
        selectedAudioTrackId: selectedAudioTrackId.value,
        startPosition: tickStartPosition,
        positionScale: scale,
      })

      mixTrackEditorStore.updateSubTrackItemStartPosition({
        editorId: SUBORDINATE_EDITOR_ID,
        audioTrackId: selectedAudioTrackId.value,
        subTrackItemId: props.subTrackItemId,
        startPosition: tickStartPosition,
        horizontalScale: scale,
      })
    },
    {
      signal: controller.signal,
    },
  )
  document.addEventListener(
    "mouseup",
    (e) => {
      e.stopPropagation()
      isMovementHandleActive.value = false
      clearSelectionController.abort()
      controller.abort()
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
const isMovementHandleActive = ref(false)
</script>

<template>
  <div
    class="grabbing-workspace-handle"
    ref="grabbingWorkspaceHandleRef"
    :class="isMovementHandleActive ? 'grabbing-workspace-handle-active' : ''"
    @mousedown="workspaceGrabbingHandler"
  >
    <p class="workspace-badge-name">{{ workspaceBadgeName }}</p>
  </div>
</template>

<style scoped>
.grabbing-workspace-handle {
  --workspace-handle-background-color: v-bind(workspaceBadgeNameBgColor);
  --workspace-badge-name-background-color: v-bind(workspaceBadgeNameBgColor);
  display: flex;
  align-items: center;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  width: v-bind(workspaceContainerWidth * pixelsPerTick(editorId) + "px");
  height: 100%;
  background-color: var(--workspace-handle-background-color);
  pointer-events: initial;
  cursor: grab;
}
.workspace-badge-name {
  color: #ffffff;
  background-color: var(--workspace-badge-name-background-color);
  font-size: 12px;
  height: fit-content;
  padding: 2px 6px;
  border-radius: 4px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.grabbing-workspace-handle-active {
  cursor: grabbing;
}
/* 支持color-mix的浏览器会覆盖 */
@supports (background: color-mix(in srgb, red, blue)) {
  .grabbing-workspace-handle {
    background: color-mix(
      in srgb,
      var(--workspace-handle-background-color),
      var(--darken-mix-color) 1%
    );
  }
  .workspace-badge-name {
    background: color-mix(
      in srgb,
      var(--workspace-badge-name-background-color),
      var(--darken-mix-color) 50%
    );
  }
}
</style>
