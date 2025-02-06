<script setup>
import { computed, inject, ref, useTemplateRef } from "vue"
import clearSelection from "@/utils/clearSelection.js"
import { useWorkspaceStore } from "@/store/daw/workspace/index.js"
import { colorMix } from "@/utils/colorMix.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
const workspaceStore = useWorkspaceStore()
const mixTrackEditorStore = useMixTrackEditorStore()

const props = defineProps({
  id: {
    type: [Number, String],
    required: true,
  },
  subTrackItemId: {
    type: String,
    required: true,
  },
  zoomRatio: {
    type: Number,
    default: 1,
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
  isMovementHandleActive.value = true
  const mousedownPositionXInWorkSpace =
    e.clientX - grabbingWorkspaceHandleRef.value.getBoundingClientRect().left
  const controller = new AbortController()
  const clearSelectionController = clearSelection()
  const scale = [0, props.notePadWidth - props.workspaceContainerWidth]

  document.addEventListener(
    "mousemove",
    (event) => {
      const workspaceStartPosition =
        event.clientX -
        props.noteEditorRegionRef.getBoundingClientRect().left -
        mousedownPositionXInWorkSpace
      const [newStartPosition] = workspaceStore.updateWorkspacePosition({
        workspaceId: props.id,
        selectedAudioTrackId: selectedAudioTrackId.value,
        startPosition: workspaceStartPosition,
        positionScale: scale,
      })

      mixTrackEditorStore.updateSubTrackItemStartPosition({
        audioTrackId: selectedAudioTrackId.value,
        subTrackItemId: props.subTrackItemId,
        startPosition: newStartPosition,
        horizontalScale: scale,
        isActive: false,
      })
    },
    {
      signal: controller.signal,
    },
  )
  document.addEventListener(
    "mouseup",
    () => {
      isMovementHandleActive.value = false
      clearSelectionController.abort()
      controller.abort()
    },
    {
      once: true,
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
  width: v-bind(workspaceContainerWidth + "px");
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
