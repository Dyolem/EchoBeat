<script setup>
import { parseMidi } from "@/core/audio/parseMidi.js"
import { generateAudioTrack } from "@/core/audio/generateAudioTrack.js"
import { inject, computed, ref } from "vue"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { AUDIO_TRACK_ENUM, MAIN_EDITOR_ID } from "@/constants/daw/index.js"
import {
  snapshotYSharedData,
  updateChoreBeatControllerParamsSharedData,
} from "@/core/history/index.js"
import { useEditorStore } from "@/store/daw/editor.js"

const beatControllerStore = useBeatControllerStore()
const editorStore = useEditorStore()
const props = defineProps({
  width: {
    type: Number,
    required: true,
  },
})
const { updateSelectedAudioTrackId } = inject("selectedAudioTrackId")

const audioTrackFileTypeMap = ref(
  new Map([
    [AUDIO_TRACK_ENUM.VIRTUAL_INSTRUMENTS, ["audio/mid"]],
    [AUDIO_TRACK_ENUM.SAMPLE, ["audio/wav", "audio/mp3"]],
  ]),
)
const acceptFileTypeString = computed(() => {
  return Array.from(audioTrackFileTypeMap.value.values())
    .flat()
    .reduce((previousValue, currentValue) => {
      return `${previousValue}.${currentValue.split("/")[1]},`
    }, "")
})

const fileTypeAudioTrackTypeMap = computed(() => {
  const map = new Map()
  audioTrackFileTypeMap.value.forEach((fileTypeList, audioTrackType) => {
    fileTypeList.forEach((fileType) => map.set(fileType, audioTrackType))
  })
  return map
})

const parseProcessorMap = {
  [AUDIO_TRACK_ENUM.VIRTUAL_INSTRUMENTS](arrayBuffer) {
    parseMidi(arrayBuffer)
      .then((midiData) => {
        const _MAIN_EDITOR_ID = MAIN_EDITOR_ID
        const marginLeftPixels = 20
        const pixelsPerTick = beatControllerStore.pixelsPerTick(_MAIN_EDITOR_ID)
        const generatedStartTick =
          (marginLeftPixels +
            editorStore.editorMap.get(_MAIN_EDITOR_ID).scrollLeft) /
          pixelsPerTick
        generateAudioTrack({ midiData, generatedStartTick }).then(
          (newSelectedAudioTrackId) => {
            updateSelectedAudioTrackId(newSelectedAudioTrackId)
            snapshotYSharedData()
            updateChoreBeatControllerParamsSharedData()
          },
        )
      })
      .catch((reason) => {
        const errorMessage = reason instanceof Error ? reason.message : reason
        ElNotification({
          title: "Error",
          message: errorMessage,
          type: "error",
        })
      })
  },
}

function parseSpecifiedFileToAudioTrack({ rawFile, audioTrackType }) {
  const reader = new FileReader()
  reader.onload = (evt) => {
    const arrayBuffer = evt.target.result
    parseProcessorMap[audioTrackType](arrayBuffer)
  }
  reader.readAsArrayBuffer(rawFile)
}

function getAudioTrackType({ rawFile, fileTypeAudioTrackTypeMap }) {
  if (!rawFile || !fileTypeAudioTrackTypeMap) return false
  const fileType = rawFile.type
  if (fileTypeAudioTrackTypeMap.has(fileType)) {
    return fileTypeAudioTrackTypeMap.get(fileType)
  } else {
    return false
  }
}

function handleUpload(rawFile) {
  const audioTrackType = getAudioTrackType({
    rawFile,
    fileTypeAudioTrackTypeMap: fileTypeAudioTrackTypeMap.value,
  })
  if (audioTrackType !== false) {
    parseSpecifiedFileToAudioTrack({ rawFile, audioTrackType })
  } else {
    ElNotification({
      title: "Error",
      message: "Parsing such files is not supported",
      type: "error",
    })
  }

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
      :accept="acceptFileTypeString"
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
