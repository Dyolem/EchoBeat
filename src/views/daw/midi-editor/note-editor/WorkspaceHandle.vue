<script setup>
import { ref, useTemplateRef } from "vue"
import clearSelection from "@/utils/clearSelection.js"
import { useWorkspaceStore } from "@/store/daw/workspace/index.js"
const workspaceStore = useWorkspaceStore()

const props = defineProps({
  id: {
    type: [Number, String],
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

const grabbingWorkspaceHandleRef = useTemplateRef("grabbingWorkspaceHandleRef")
function workspaceGrabbingHandler(e) {
  isMovementHandleActive.value = true
  const mousedownPositionXInWorkSpace =
    e.clientX - grabbingWorkspaceHandleRef.value.getBoundingClientRect().left
  const controller = new AbortController()
  const clearSelectionController = clearSelection()

  document.addEventListener(
    "mousemove",
    (event) => {
      const workspaceStartPosition =
        event.clientX -
        props.noteEditorRegionRef.getBoundingClientRect().left -
        mousedownPositionXInWorkSpace

      workspaceStore.updateWorkspacePosition({
        workspaceId: props.id,
        startPosition: workspaceStartPosition,
        positionScale: [0, props.notePadWidth - props.workspaceContainerWidth],
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
  display: flex;
  align-items: center;
  border-top-left-radius: 8px;
  border-top-right-radius: 8px;
  width: v-bind(workspaceContainerWidth + "px");
  height: 100%;
  background-color: rgb(97, 9, 138);
  pointer-events: initial;
  cursor: grab;
}
.workspace-badge-name {
  color: #ffffff;
  background-color: rgb(78, 7, 110);
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
</style>
