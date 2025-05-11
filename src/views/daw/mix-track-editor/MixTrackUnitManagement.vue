<script setup>
import MixTrackUnit from "@/views/daw/mix-track-editor/MixTrackUnit.vue"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { ref, computed, provide, useTemplateRef, inject } from "vue"
import { GRID_OPTIONS } from "@/constants/daw/index.js"
import { storeToRefs } from "pinia"

const beatControllerStore = useBeatControllerStore()
const { pixelsPerTick } = storeToRefs(beatControllerStore)
const mixTrackEditorStore = useMixTrackEditorStore()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  width: {
    type: Number,
    required: true,
  },
  height: {
    type: Number,
    required: true,
  },
  zoomRatio: {
    type: Number,
    default: 1,
  },
})
const mixTrackContextMenu = ref([
  { value: "paste", label: "Paste", disable: true },
  {
    value: "gridSize",
    label: "GridSize",
    children: Object.keys(GRID_OPTIONS).map((type) => ({
      value: type,
      label: type.toUpperCase(),
    })),
  },
])
const mainEditorZoomRatio = computed(() => {
  return props.zoomRatio
})
provide("mainEditorZoomRatio", mainEditorZoomRatio)

const mixTrackManagementContainer = useTemplateRef(
  "mixTrackManagementContainer",
)
function createGetGeometryInfoInScrollableContainer(scrollableContainer) {
  return function (event) {
    const scrollableContainerRect = scrollableContainer.getBoundingClientRect()
    const x = event.clientX - scrollableContainerRect.left
    const y = event.clientY - scrollableContainerRect.top
    return {
      self: scrollableContainer,
      position: [scrollableContainerRect.left, scrollableContainerRect.top],
      cursorPosition: [x, y],
      scrollTop: scrollableContainer.scrollTop,
      scrollLeft: scrollableContainer.scrollLeft,
    }
  }
}
const getGeometryInfoInScrollableContainer = computed(() => {
  return createGetGeometryInfoInScrollableContainer(
    mixTrackManagementContainer.value,
  )
})

const { isFolded, totalAudioTracksHeight, unfoldHeight, foldHeight } =
  inject("foldedAudioTrack")
</script>

<template>
  <div class="mix-track-management-container" ref="mixTrackManagementContainer">
    <MixTrackUnit
      v-for="[id, trackUnit] in mixTrackEditorStore.mixTracksMap"
      :key="id"
      :id="id"
      :audio-track-type="trackUnit.audioTrackType"
      :track-width="width"
      :track-height="isFolded(id) ? foldHeight : unfoldHeight"
      :main-color="trackUnit.mainColor"
      :sub-track-items-map="trackUnit.subTrackItemsMap"
      :get-geometry-info-in-parent-element="
        getGeometryInfoInScrollableContainer
      "
      :context-menu="mixTrackContextMenu"
    >
    </MixTrackUnit>
  </div>
</template>

<style scoped>
.mix-track-management-container {
  position: relative;
  width: v-bind(width * pixelsPerTick(id) + "px");
  height: v-bind(totalAudioTracksHeight + "px");
}
</style>
