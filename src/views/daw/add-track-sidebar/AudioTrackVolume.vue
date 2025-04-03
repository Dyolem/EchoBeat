<script setup>
import { useAudioStore } from "@/store/daw/audio/index.js"
import VolumeSlider from "@/views/daw/components/VolumeSlider.vue"
const audioStore = useAudioStore()
const { updateAudioTrackVolumeGainNodeValue } = audioStore
const props = defineProps({
  mainColor: {
    type: String,
  },
  audioTrackId: {
    type: String,
    required: true,
  },
})
function updateAudioTrackVolume({ gainValue }) {
  updateAudioTrackVolumeGainNodeValue({
    audioTrackId: props.audioTrackId,
    gainValue: gainValue,
  })
}
</script>

<template>
  <div class="audio-track-volume">
    <VolumeSlider
      :after-update-volume="updateAudioTrackVolume"
      :main-color="mainColor"
    ></VolumeSlider>
  </div>
</template>

<style scoped>
.audio-track-volume {
  width: 100%;
}
</style>
