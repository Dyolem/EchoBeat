<script setup>
import MixTrack from "@/views/daw/mix-track/index.vue"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { computed, ref } from "vue"
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
const mixTrackManagementContainerWidth = computed(() => {
  return props.width * props.zoomRatio
})
</script>

<template>
  <div class="mix-track-management-container">
    <MixTrack
      v-for="[id, trackUnit] in mixTrackEditorStore.mixTrackUnitMap"
      :key="id"
      :id="id"
      :track-width="trackUnit.trackWidth * zoomRatio"
      :track-height="trackUnit.trackHeight"
    >
      <template #mix-content-thumbnail> </template>
    </MixTrack>
  </div>
</template>

<style scoped>
.mix-track-management-container {
  width: v-bind(mixTrackManagementContainerWidth + "px");
  height: v-bind(height + "px");
}
</style>
