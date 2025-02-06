<script setup>
import MixTrackUnit from "@/views/daw/mix-track-editor/MixTrackUnit.vue"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { computed, provide, useTemplateRef, watch } from "vue"

const mixTrackEditorStore = useMixTrackEditorStore()
const props = defineProps({
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
const mainEditorZoomRatio = computed(() => {
  return props.zoomRatio
})
provide("mainEditorZoomRatio", mainEditorZoomRatio)
watch(
  () => props.zoomRatio,
  (newZoomRatio, oldZoomRatio) => {
    mixTrackEditorStore.passivePatchUpdateAudioTracksWithZoomRatio({
      newZoomRatio,
      oldZoomRatio,
    })
  },
)

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
</script>

<template>
  <div class="mix-track-management-container" ref="mixTrackManagementContainer">
    <MixTrackUnit
      v-for="[id, trackUnit] in mixTrackEditorStore.mixTracksMap"
      :key="id"
      :id="id"
      :track-width="width"
      :track-height="trackUnit.trackHeight"
      :main-color="trackUnit.mainColor"
      :sub-track-items-map="trackUnit.subTrackItemsMap"
      :get-geometry-info-in-parent-element="
        getGeometryInfoInScrollableContainer
      "
    >
      <template #mix-content-thumbnail> </template>
    </MixTrackUnit>
  </div>
</template>

<style scoped>
.mix-track-management-container {
  position: relative;
  width: v-bind(width + "px");
  height: v-bind(height + "px");
}
</style>
