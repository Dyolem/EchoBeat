<script setup>
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { inject } from "vue"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import { MAIN_EDITOR_ID, SUBORDINATE_EDITOR_ID } from "@/constants/daw/index.js"
const mixTrackEditorStore = useMixTrackEditorStore()
const zoomRatioStore = useZoomRatioStore()

const { updateSelectedAudioTrackId } = inject("selectedAudioTrackId")
function addAudioTrackHandler() {
  const newTrackId = mixTrackEditorStore.addAudioTrack({
    audioTrackName: "Instrument",
    mainEditorZoomRatio:
      zoomRatioStore.getSpecifiedEditorZoomRatio(MAIN_EDITOR_ID),
    midiWorkspaceZoomRatio: zoomRatioStore.getSpecifiedEditorZoomRatio(
      SUBORDINATE_EDITOR_ID,
    ),
  })
  updateSelectedAudioTrackId(newTrackId)
}
</script>

<template>
  <div class="feature-bar">
    <button
      class="add-track-button"
      title="Add Track (Shift + T)"
      @click="addAudioTrackHandler"
    >
      <echo-tabler:plus class="add-icon"></echo-tabler:plus>
      Add Track
    </button>
  </div>
</template>

<style scoped>
.feature-bar {
  position: sticky;
  top: 0;
  display: flex;
  align-items: center;
  width: 100%;
  height: 50px;
  flex-shrink: 0;
  background-color: pink;
  z-index: 1;
}
.add-track-button {
  --button-height: 30px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 120px;
  height: var(--button-height);
  padding: 0 10px;
  border-radius: calc(var(--button-height) / 2);
  border: none;
  background-color: #191b1e;
  color: #ffffff;
}
.add-track-button:hover {
  background-color: #202428;
  cursor: pointer;
}
.add-icon {
  color: #fff;
  font-size: 16px;
}
</style>
