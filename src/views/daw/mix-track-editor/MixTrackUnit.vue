<script setup>
import { inject, onMounted, onUnmounted, useTemplateRef } from "vue"
import TrackItem from "@/views/daw/mix-track-editor/TrackItem.vue"
import {
  BASE_GRID_WIDTH,
  BEAT_GRID_RATIO,
  BEATS_COUNT,
  FALLBACK_THEME_COLOR,
} from "@/constants/daw/index.js"
import { useWorkspaceStore } from "@/store/daw/workspace/index.js"
import { deepClone } from "@/utils/deepClone.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import clearSelection from "@/utils/clearSelection.js"
const workspaceStore = useWorkspaceStore()
const mixTrackEditorStore = useMixTrackEditorStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  subTrackItemsMap: {
    type: Map,
    default: () => new Map(),
  },
  trackHeight: {
    type: Number,
    default: 90,
  },
  trackWidth: {
    type: Number,
    default: BASE_GRID_WIDTH * BEATS_COUNT * BEAT_GRID_RATIO,
  },
  mainColor: {
    type: String,
    default: FALLBACK_THEME_COLOR,
  },
  getGeometryInfoInParentElement: {
    type: Function,
    required: true,
  },
})
const { selectedAudioTrackId, updateSelectedAudioTrackId } = inject(
  "selectedAudioTrackId",
  {},
)
const { updateSelectedTrackItemId } = inject("selectedTrackItemId", {})

function updateSelectedId(event) {
  updateSelectedAudioTrackId(props.id)
  const target = event.target.closest(".track-item")
  if (target) {
    const trackItemId = target.dataset["trackItemId"]
    updateSelectedTrackItemId(trackItemId)
    event.stopPropagation()
  }
}
const trackUnitGridRef = useTemplateRef("trackUnitGridRef")
const dragController = new AbortController()

onMounted(() => {
  if (!trackUnitGridRef.value) return
  trackUnitGridRef.value.addEventListener(
    "mousedown",
    (event) => {
      const selectionController = clearSelection()
      const trackItemTarget = event.target.closest(".track-item")
      if (!trackItemTarget) return
      const trackItemId = trackItemTarget.dataset["trackItemId"]
      const controller = new AbortController()
      let isDragging = false
      const { cursorPosition } = props.getGeometryInfoInParentElement(event)
      let [startX, startY] = cursorPosition

      let deltaX = 0
      let deltaY = 0

      const subTrackItemsMap = mixTrackEditorStore.getSubTrackItemsMap({
        audioTrackId: props.id,
      })
      const subTrackItem = subTrackItemsMap.get(trackItemId)
      const clonedSubTrackItemId = mixTrackEditorStore.generateSubTrackItemId()

      const workspaceMap = workspaceStore.getWorkspaceMap({
        audioTrackId: props.id,
      })
      const workspaceId = subTrackItem.workspaceId
      const workspace = workspaceMap.get(workspaceId)
      const clonedWorkspace = deepClone(workspace)
      const clonedWorkspaceId = workspaceStore.generateWorkspaceId()
      clonedWorkspace.id = clonedWorkspaceId
      clonedWorkspace.subTrackItemId = clonedSubTrackItemId
      workspaceMap.set(clonedWorkspaceId, clonedWorkspace)

      const clonedSubTrackItem = deepClone(subTrackItem)
      clonedSubTrackItem.subTrackItemId = clonedSubTrackItemId
      clonedSubTrackItem.workspaceId = clonedWorkspaceId
      subTrackItemsMap.set(clonedSubTrackItemId, clonedSubTrackItem)

      const minStartPosition = 0
      const maxStartPosition = props.trackWidth - subTrackItem.trackItemWidth

      const initSubTrackItemStartPosition = subTrackItem.startPosition
      let newSubTrackItemStartPosition = 0
      document.addEventListener(
        "mousemove",
        (event) => {
          isDragging = true

          const { cursorPosition } = props.getGeometryInfoInParentElement(event)
          const [x, y] = cursorPosition
          deltaX = x - startX
          deltaY = y - startY

          newSubTrackItemStartPosition = initSubTrackItemStartPosition + deltaX
          workspaceStore.updateWorkspacePosition({
            workspaceId: clonedWorkspaceId,
            selectedAudioTrackId: props.id,
            startPosition: newSubTrackItemStartPosition,
            positionScale: [minStartPosition, maxStartPosition],
            isActive: false,
          })
          mixTrackEditorStore.updateSubTrackItemStartPosition({
            audioTrackId: props.id,
            subTrackItemId: clonedSubTrackItemId,
            startPosition: newSubTrackItemStartPosition,
            horizontalScale: [minStartPosition, maxStartPosition],
          })
        },
        { signal: controller.signal },
      )
      document.addEventListener(
        "mouseup",
        () => {
          selectionController.abort()
          controller.abort()
          workspaceStore.deleteWorkspace({
            audioTrackId: props.id,
            workspaceId: clonedWorkspaceId,
          })

          mixTrackEditorStore.deleteSpecifiedSubTrackItem({
            audioTrackId: props.id,
            subTrackItemId: clonedSubTrackItemId,
          })
          if (isDragging) {
            workspaceStore.updateWorkspacePosition({
              workspaceId: workspaceId,
              selectedAudioTrackId: props.id,
              startPosition: newSubTrackItemStartPosition,
              positionScale: [minStartPosition, maxStartPosition],
              isActive: false,
            })
            mixTrackEditorStore.updateSubTrackItemStartPosition({
              audioTrackId: props.id,
              subTrackItemId: trackItemId,
              startPosition: newSubTrackItemStartPosition,
              horizontalScale: [minStartPosition, maxStartPosition],
            })
          }
          updateSelectedTrackItemId(trackItemId)
        },
        {
          once: true,
        },
      )
    },
    {
      signal: dragController.signal,
    },
  )
})
onUnmounted(() => {
  dragController.abort()
})
</script>

<template>
  <div
    class="track-unit-grid"
    ref="trackUnitGridRef"
    :class="selectedAudioTrackId === id ? 'track-unit-grid-selected' : ''"
    @click="updateSelectedId"
  >
    <TrackItem
      v-for="[subTrackItemId, subTrackItem] in subTrackItemsMap"
      :key="subTrackItemId"
      :id="subTrackItemId"
      :main-color="mainColor"
      :width="subTrackItem.trackItemWidth"
      :height="subTrackItem.trackItemHeight"
      :start-position="subTrackItem.startPosition"
      :track-name="subTrackItem.trackName"
      :track-zoom-ratio="subTrackItem.trackZoomRatio"
    ></TrackItem>
  </div>
</template>

<style scoped>
.track-unit-grid {
  position: relative;
  width: v-bind(trackWidth + "px");
  height: v-bind(trackHeight + "px");
  display: flex;
}
.track-unit-grid-selected {
  background-color: v-bind(mainColor + "22");
}
</style>
