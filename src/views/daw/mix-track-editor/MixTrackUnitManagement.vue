<script setup>
import MixTrackUnit from "@/views/daw/mix-track-editor/MixTrackUnit.vue"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { computed, provide } from "vue"
import { useTrackFeatureMapStore } from "@/store/daw/track-feature-map/index.js"
const mixTrackEditorStore = useMixTrackEditorStore()
const trackFeatureMapStore = useTrackFeatureMapStore()
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
const mixTrackManagementContainerWidth = computed(() => {
  return props.width * props.zoomRatio
})
function getWorkspaceMap(audioTrackId) {
  return (
    trackFeatureMapStore.getSelectedTrackWorkspaceMap({
      selectedAudioTrackId: audioTrackId,
      featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
    }) ?? []
  )
}
</script>

<template>
  <div class="mix-track-management-container">
    <MixTrackUnit
      v-for="[id, trackUnit] in mixTrackEditorStore.mixTracksMap"
      :key="id"
      :id="id"
      :track-height="trackUnit.trackHeight"
      :main-color="trackUnit.mainColor"
      :audio-track-start-position="trackUnit.startPosition"
      :workspace-map="getWorkspaceMap(id)"
    >
      <template #mix-content-thumbnail> </template>
    </MixTrackUnit>
  </div>
</template>

<style scoped>
.mix-track-management-container {
  width: v-bind(mixTrackManagementContainerWidth + "px");
  height: v-bind(height + "px");
}
</style>
