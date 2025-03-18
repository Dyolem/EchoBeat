<script setup>
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { inject } from "vue"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import { MAIN_EDITOR_ID, SUBORDINATE_EDITOR_ID } from "@/constants/daw/index.js"
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
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
    <MixEditorButton
      circle
      @click="addAudioTrackHandler"
      title="Add Track (Shift + T)"
    >
      <div class="add-track-button">
        <echo-tabler:plus class="add-icon"></echo-tabler:plus> Add Track
      </div>
    </MixEditorButton>
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
  z-index: 1;
}
.add-track-button {
  display: flex;
  align-items: center;
  gap: 10px;
}
.add-icon {
  color: #fff;
  font-size: 16px;
}
</style>
