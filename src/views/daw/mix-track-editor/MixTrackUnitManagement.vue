<script setup>
import MixTrackUnit from "@/views/daw/mix-track-editor/MixTrackUnit.vue"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { computed } from "vue"
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
    <MixTrackUnit
      v-for="[id, trackUnit] in mixTrackEditorStore.mixTrackUnitMap"
      :key="id"
      :id="id"
      :track-width="trackUnit.trackWidth * zoomRatio"
      :track-height="trackUnit.trackHeight"
      :main-color="trackUnit.mainColor"
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
