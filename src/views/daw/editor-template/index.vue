<script setup>
import TrackRuler from "@/views/daw/editor-template/track-ruler/index.vue"
import InteractableLayer from "@/views/daw/editor-template/interactable-layer/index.vue"

import { computed, ref, useTemplateRef, useId, watch, onMounted } from "vue"
import TimeLine from "@/views/daw/editor-template/interactable-layer/TimeLine.vue"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
const trackRulerStore = useTrackRulerStore()
const BEATS_NUMBER = 95
const BASE_GRID_WIDTH = 20
const BASE_GRID_HEIGHT = 90
const TRACK_ZOOM_RATIO = 1

const id = useId()
const gridWidth = ref(BASE_GRID_WIDTH)
const gridHeight = ref(BASE_GRID_HEIGHT)
const trackZoomRatio = ref(TRACK_ZOOM_RATIO)
const trackAmount = ref(10)
const beatsNumber = ref(BEATS_NUMBER)
const canvasContentWidth = computed(() => {
  return gridWidth.value * trackZoomRatio.value * beatsNumber.value * 4
})
const canvasContentHeight = computed(() => {
  return gridHeight.value * trackAmount.value
})
const editorContentContainerRef = useTemplateRef("editorContentContainerRef")
const props = defineProps({
  editorViewHeight: {
    type: Number,
  },
})

onMounted(() => {
  trackRulerStore.editorViewWidth =
    editorContentContainerRef.value.getBoundingClientRect().width
  watch(
    () => trackRulerStore.timeLineInstanceMap.get(id).scrollLeft,
    (newVal) => {
      editorContentContainerRef.value.scrollLeft = newVal
    },
  )
})

const editorViewHeight = computed(() => {
  return props.editorViewHeight
})
</script>

<template>
  <section class="studio-editor" :id="id">
    <div class="editor-side-bar"></div>
    <div
      class="editor-content-container beatified-scrollbar"
      ref="editorContentContainerRef"
    >
      <div class="track-ruler-container">
        <TrackRuler
          :grid-width="gridWidth"
          :grid-height="gridHeight"
          :track-ruler-width="canvasContentWidth"
          :track-zoom-ratio="trackZoomRatio"
        ></TrackRuler>
        <TimeLine
          :id="id"
          :timeline-height="canvasContentHeight"
          :parent-container="editorContentContainerRef"
          :track-ruler-width="canvasContentWidth"
          :track-zoom-ratio="trackZoomRatio"
        ></TimeLine>
      </div>

      <div class="editor-content">
        <slot name="default-interactable-layer">
          <InteractableLayer
            :id="id"
            :canvas-width="canvasContentWidth"
            :canvas-height="canvasContentHeight"
            v-model:track-zoom-ratio="trackZoomRatio"
          ></InteractableLayer>
        </slot>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import "src/styles/scrollbar.css";
.studio-editor {
  display: flex;
  width: 100vw;
  height: v-bind(editorViewHeight + "px");
}

.editor-side-bar {
  width: 300px;
  flex-shrink: 0;
  height: 100%;
  background-color: gray;
}
.editor-content-container {
  overflow: auto;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  height: v-bind(editorViewHeight + "px");
  /**padding-left: 10px;**/
}
.track-ruler-container {
  position: sticky;
  top: 0;
  z-index: 10;
}
.editor-content {
  width: v-bind(canvasContentWidth + "px");
  height: v-bind(canvasContentHeight + "px");
  flex-grow: 1;
  background-color: black;
}
</style>
