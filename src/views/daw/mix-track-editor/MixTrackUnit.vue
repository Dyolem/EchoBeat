<script setup>
import { inject } from "vue"
import TrackItem from "@/views/daw/mix-track-editor/TrackItem.vue"
import { FALLBACK_THEME_COLOR } from "@/constants/daw/index.js"

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  workspaceMap: {
    type: Map,
    default: () => new Map(),
  },
  trackHeight: {
    type: Number,
    default: 90,
  },
  mainColor: {
    type: String,
    default: FALLBACK_THEME_COLOR,
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
  const trackItemId = target?.dataset["trackItemId"]
  updateSelectedTrackItemId(trackItemId)
}
</script>

<template>
  <div
    class="track-unit-grid"
    :class="selectedAudioTrackId === id ? 'track-unit-grid-selected' : ''"
    @click="updateSelectedId"
  >
    <TrackItem
      v-for="[workspaceId, workspace] in workspaceMap"
      :key="id + workspaceId"
      :id="id + workspaceId"
      :main-color="mainColor"
      :width="workspace.width"
      :track-item-start-position="workspace.startPosition"
    ></TrackItem>
  </div>
</template>

<style scoped>
.track-unit-grid {
  position: relative;
  width: 100%;
  height: v-bind(trackHeight + "px");
  display: flex;
}
.track-unit-grid-selected {
  background-color: v-bind(mainColor + "22");
}
</style>
