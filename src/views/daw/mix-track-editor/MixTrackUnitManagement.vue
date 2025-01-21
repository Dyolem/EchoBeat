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
const selectedId = ref("")
const mixTrackManagementContainerWidth = computed(() => {
  return props.width * props.zoomRatio
})
</script>

<template>
  <div class="mix-track-management-container">
    <div
      class="track-unit-grid"
      v-for="[id, trackUnit] in mixTrackEditorStore.mixTrackUnitMap"
      :key="id"
    >
      <MixTrack
        :id="id"
        v-model:selected-id="selectedId"
        :track-width="trackUnit.trackWidth * zoomRatio"
        :track-height="trackUnit.trackHeight"
      >
        <template #mix-content-thumbnail> </template>
      </MixTrack>
    </div>
  </div>
</template>

<style scoped>
.mix-track-management-container {
  width: v-bind(mixTrackManagementContainerWidth + "px");
  height: v-bind(height + "px");
}
.track-unit-grid {
  width: 100%;
  height: fit-content;
  background-color: rgba(140, 215, 255, 0.3);
}
</style>
