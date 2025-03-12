<script setup>
import { inject, onMounted, onUnmounted, useTemplateRef, ref } from "vue"
import TrackItem from "@/views/daw/mix-track-editor/TrackItem.vue"
import {
  BASE_GRID_WIDTH,
  BEAT_GRID_RATIO,
  BEATS_COUNT,
  FALLBACK_THEME_COLOR,
  MAIN_EDITOR_ID,
} from "@/constants/daw/index.js"
import { useWorkspaceStore } from "@/store/daw/workspace/index.js"
import { deepClone } from "@/utils/deepClone.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import clearSelection from "@/utils/clearSelection.js"
import ContextMenu from "@/views/daw/components/context-menu/ContextMenu.vue"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { storeToRefs } from "pinia"
const workspaceStore = useWorkspaceStore()
const mixTrackEditorStore = useMixTrackEditorStore()
const beatControllerStore = useBeatControllerStore()

const { pixelsPerTick } = storeToRefs(beatControllerStore)
const editorId = inject("mainEditorId")
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
  contextMenu: {
    type: Array,
    default: () => [],
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
      const stretchHandleTarget = event.target.closest(".stretch")
      const trackItemContainer = event.target.closest(".track-item-container")
      const trackItemId = trackItemContainer?.dataset["trackItemId"]
      if (!trackItemId) return

      const subTrackItemsMap = mixTrackEditorStore.getSubTrackItemsMap({
        audioTrackId: props.id,
      })
      const subTrackItem = subTrackItemsMap.get(trackItemId)
      const initSubTrackItemStartPosition = subTrackItem.startPosition
      const initSubTrackItemWidth = subTrackItem.trackItemWidth
      if (trackItemTarget) {
        // const trackItemId = trackItemTarget.dataset["trackItemId"]
        const controller = new AbortController()
        let isDragging = false
        const { cursorPosition } = props.getGeometryInfoInParentElement(event)
        let [startX, startY] = cursorPosition

        let deltaX = 0
        let deltaY = 0

        const clonedSubTrackItemId =
          mixTrackEditorStore.generateSubTrackItemId()

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
        const maxStartPosition = props.trackWidth - initSubTrackItemWidth

        let newSubTrackItemStartPosition = 0
        document.addEventListener(
          "mousemove",
          (event) => {
            isDragging = true

            const { cursorPosition } =
              props.getGeometryInfoInParentElement(event)
            const [x, y] = cursorPosition
            deltaX = (x - startX) / pixelsPerTick.value(editorId.value)
            deltaY = y - startY

            newSubTrackItemStartPosition =
              initSubTrackItemStartPosition + deltaX
            workspaceStore.updateWorkspacePosition({
              editorId: MAIN_EDITOR_ID,
              workspaceId: clonedWorkspaceId,
              selectedAudioTrackId: props.id,
              startPosition: newSubTrackItemStartPosition,
              positionScale: [minStartPosition, maxStartPosition],
            })
            mixTrackEditorStore.updateSubTrackItemStartPosition({
              editorId: MAIN_EDITOR_ID,
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
                editorId: MAIN_EDITOR_ID,
                workspaceId: workspaceId,
                selectedAudioTrackId: props.id,
                startPosition: newSubTrackItemStartPosition,
                positionScale: [minStartPosition, maxStartPosition],
              })
              mixTrackEditorStore.updateSubTrackItemStartPosition({
                editorId: MAIN_EDITOR_ID,
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
      }
      if (stretchHandleTarget) {
        const controller = new AbortController()
        const { cursorPosition } = props.getGeometryInfoInParentElement(event)
        let [startX, startY] = cursorPosition

        const subTrackItemsMap = mixTrackEditorStore.getSubTrackItemsMap({
          audioTrackId: props.id,
        })
        const subTrackItem = subTrackItemsMap.get(trackItemId)
        const workspaceId = subTrackItem.workspaceId
        const initSubTrackItemStartPosition = subTrackItem.startPosition
        const initSubTrackItemWidth = subTrackItem.trackItemWidth

        const mousedownX =
          event.clientX - trackItemContainer.getBoundingClientRect().left
        document.addEventListener(
          "mousemove",
          (event) => {
            const { cursorPosition } =
              props.getGeometryInfoInParentElement(event)
            const [x, y] = cursorPosition

            if (
              mousedownX <
              (initSubTrackItemWidth * pixelsPerTick.value(editorId.value)) / 2
            ) {
              const initRightEdgeX =
                initSubTrackItemStartPosition + initSubTrackItemWidth
              const newLeftEdgeX =
                (x - startX) / pixelsPerTick.value(editorId.value) +
                initSubTrackItemStartPosition
              mixTrackEditorStore.updateLeftEdge({
                x: newLeftEdgeX,
                initRightEdgeX,
                editorId: MAIN_EDITOR_ID,
                subTrackItemId: trackItemId,
                audioTrackId: props.id,
              })
              workspaceStore.updateLeftEdge({
                editorId: MAIN_EDITOR_ID,
                audioTrackId: props.id,
                workspaceId,
                x: newLeftEdgeX,
                initRightEdgeX,
              })
            } else {
              const newRightEdgeX =
                initSubTrackItemStartPosition +
                initSubTrackItemWidth -
                (startX - x) / pixelsPerTick.value(editorId.value)
              const initLeftEdgeX = initSubTrackItemStartPosition
              mixTrackEditorStore.updateRightEdge({
                x: newRightEdgeX,
                initLeftEdgeX,
                editorId: MAIN_EDITOR_ID,
                subTrackItemId: trackItemId,
                audioTrackId: props.id,
              })
              workspaceStore.updateRightEdge({
                x: newRightEdgeX,
                initLeftEdgeX,
                editorId: MAIN_EDITOR_ID,
                workspaceId,
                audioTrackId: props.id,
              })
            }
          },
          { signal: controller.signal },
        )
        document.addEventListener(
          "mouseup",
          () => {
            selectionController.abort()
            controller.abort()
          },
          {
            once: true,
          },
        )
      }
    },
    {
      signal: dragController.signal,
    },
  )
})
const handleSelect = (selectedOption) => {
  beatControllerStore.updateGridType(selectedOption)
}
onUnmounted(() => {
  dragController.abort()
})
</script>

<template>
  <context-menu :menu="contextMenu" @select="handleSelect">
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
  </context-menu>
</template>

<style scoped>
.track-unit-grid {
  position: relative;
  width: v-bind(trackWidth * pixelsPerTick(editorId) + "px");
  height: v-bind(trackHeight + "px");
  display: flex;
}
.track-unit-grid-selected {
  background-color: v-bind(mainColor + "22");
}
</style>
