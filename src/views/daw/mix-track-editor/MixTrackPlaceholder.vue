<script setup>
import { parseMidi } from "@/core/audio/parseMidi.js"
import { generateAudioTrack } from "@/core/audio/generateAudioTrack.js"
import { inject } from "vue"
const props = defineProps({
  width: {
    type: Number,
    required: true,
  },
})
const { updateSelectedAudioTrackId } = inject("selectedAudioTrackId")
function parseSpecifiedFileToAudioTrack(file) {
  const reader = new FileReader()
  reader.onload = (evt) => {
    const arrayBuffer = evt.target.result
    const { meta, tracks, version } = parseMidi(arrayBuffer)
    const newSelectedAudioTrackId = generateAudioTrack({
      meta,
      tracks,
      version,
    })
    updateSelectedAudioTrackId(newSelectedAudioTrackId)
  }
  reader.readAsArrayBuffer(file)
}

function handleUpload(rawFile) {
  parseSpecifiedFileToAudioTrack(rawFile)
  return false
}
</script>

<template>
  <div class="audio-track-placeholder">
    <el-upload
      class="upload-demo"
      drag
      action="#"
      multiple
      :before-upload="handleUpload"
    >
      <echo-iconoir:music-double-note-plus
        :style="{ fontSize: 20 + 'px' }"
      ></echo-iconoir:music-double-note-plus>
      <p class="guide-sentence">Drop a loop or an audio/MIDI file</p>
    </el-upload>
  </div>
</template>

<style scoped>
.audio-track-placeholder {
  width: v-bind(width + "px");
  padding: 10px;
  height: 100px;
  position: sticky;
  left: 0;
}
.upload-demo {
  height: 100%;
}
.audio-track-placeholder :deep(.el-upload.is-drag) {
  height: 100%;
}
.audio-track-placeholder :deep(.el-upload-dragger) {
  display: flex;
  height: 100%;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 0;
  background: none;
  color: #ffffff;
  border: 2px dashed #282c32;
}
.audio-track-placeholder :deep(.el-upload-dragger:hover) {
  border: 2px dashed #c5c5c5;
}
</style>
