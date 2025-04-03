<script setup>
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { inject, ref } from "vue"
import { useZoomRatioStore } from "@/store/daw/zoomRatio.js"
import { MAIN_EDITOR_ID, SUBORDINATE_EDITOR_ID } from "@/constants/daw/index.js"
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
import AudioTrackTypeMenu from "@/views/daw/add-track-sidebar/AudioTrackTypeMenu.vue"
const mixTrackEditorStore = useMixTrackEditorStore()
const zoomRatioStore = useZoomRatioStore()

const { updateSelectedAudioTrackId } = inject("selectedAudioTrackId")

const showTrackMenu = ref(false)
function openTrackMenu(event) {
  event.stopPropagation()
  showTrackMenu.value = true
  document.addEventListener(
    "click",
    () => {
      showTrackMenu.value = false
    },
    { once: true },
  )
}

function addAudioTrackHandler({ type, icon }) {
  if (!type) return
  const newTrackId = mixTrackEditorStore.addAudioTrack({
    audioTrackName: "Instrument",
    audioTrackType: type,
    audioTrackIcon: icon,
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
    <el-tooltip :visible="showTrackMenu" popper-class="track-menu-type">
      <MixEditorButton
        circle
        @click="openTrackMenu"
        title="Add Track (Shift + T)"
      >
        <div class="add-track-button">
          <echo-tabler:plus class="add-icon"></echo-tabler:plus> Add Track
        </div>
      </MixEditorButton>
      <template #content>
        <AudioTrackTypeMenu
          @update:added-track-type="addAudioTrackHandler"
        ></AudioTrackTypeMenu>
      </template>
    </el-tooltip>
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
  padding: 0 10px;
  background: inherit;
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
<style>
.track-menu-type {
  --el-text-color-primary: #0f1214;
}
</style>
