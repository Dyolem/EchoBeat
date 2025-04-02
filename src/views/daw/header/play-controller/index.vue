<script setup>
import { computed } from "vue"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
import MixEditorButtonGroup from "@/views/daw/mix-editor-button/MixEditorButtonGroup.vue"
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
import { storeToRefs } from "pinia"
import {
  playAudio,
  registerVisibilityChangeEvent,
} from "@/core/audio/player.js"
registerVisibilityChangeEvent()
const trackRulerStore = useTrackRulerStore()
const { isPlaying, timelineCurrentTime } = storeToRefs(trackRulerStore)
const accurateTime = computed(() => {
  return timelineCurrentTime.value
})
const timeDisplay = computed(() => {
  const time = accurateTime.value
  const minutes = Math.floor(time / 60)
  const seconds = (Math.round((time - minutes * 60) * 10) / 10).toFixed(1)
  const m = String(minutes).padStart(2, "0")
  const s = String(seconds).padStart(4, "0")
  return `${m}:${s}`
})
</script>

<template>
  <MixEditorButtonGroup size="large">
    <MixEditorButton @click="playAudio" circle>
      <echo-iconoir:play-solid v-if="!isPlaying"></echo-iconoir:play-solid>
      <echo-material-symbols:pause-rounded
        v-if="isPlaying"
      ></echo-material-symbols:pause-rounded>
    </MixEditorButton>
    <MixEditorButton v-if="!isPlaying">
      <echo-ri:skip-back-fill></echo-ri:skip-back-fill>
    </MixEditorButton>
    <MixEditorButton v-if="isPlaying">
      <echo-ri:stop-fill></echo-ri:stop-fill>
    </MixEditorButton>
    <MixEditorButton>
      <echo-mdi:record :style="{ color: '#f12c18' }"></echo-mdi:record>
    </MixEditorButton>
    <MixEditorButton>
      <echo-oi:loop></echo-oi:loop>
    </MixEditorButton>
    <MixEditorButton circle>
      <div class="time">{{ timeDisplay }}</div>
    </MixEditorButton>
  </MixEditorButtonGroup>
</template>

<style scoped>
.time {
  color: #fff;
}
</style>
