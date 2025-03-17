<script setup>
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
import MixEditorButtonGroup from "@/views/daw/mix-editor-button/MixEditorButtonGroup.vue"
import { ref } from "vue"
import { ZIndex, ZOOM_THRESHOLD } from "@/constants/daw/index.js"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import { storeToRefs } from "pinia"

const zoomRatioStore = useZoomRatioStore()
const { isSnappedToHorizontalGrid, currentEditorZoomRatio } =
  storeToRefs(zoomRatioStore)

const props = defineProps({
  editorId: {
    type: String,
    required: true,
  },
})
const trackRulerZIndex = ref(ZIndex.TRACK_RULER)
function updateEditorZoom(increment) {
  const editorId = props.editorId
  zoomRatioStore.updateSpecifiedEditorZoomRatio(
    editorId,
    increment + currentEditorZoomRatio.value(editorId),
  )
}
</script>

<template>
  <div class="tools">
    <MixEditorButtonGroup>
      <MixEditorButton
        @click="isSnappedToHorizontalGrid = !isSnappedToHorizontalGrid"
      >
        <echo-bxs:magnet
          :style="{ color: isSnappedToHorizontalGrid ? '#2f93f6' : '#ffffff' }"
        ></echo-bxs:magnet>
      </MixEditorButton>
      <MixEditorButton @click="updateEditorZoom(ZOOM_THRESHOLD, editorId)">
        <echo-iconoir:zoom-in></echo-iconoir:zoom-in>
      </MixEditorButton>
      <MixEditorButton @click="updateEditorZoom(-ZOOM_THRESHOLD, editorId)">
        <echo-iconoir:zoom-out></echo-iconoir:zoom-out>
      </MixEditorButton>
    </MixEditorButtonGroup>
  </div>
</template>

<style scoped>
.tools {
  position: absolute;
  width: fit-content;
  right: 20px;
  z-index: v-bind(trackRulerZIndex + 1);
}
</style>
