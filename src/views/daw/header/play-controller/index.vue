<script setup>
import { useAudioStore } from "@/store/daw/audio/index.js"
import { computed } from "vue"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
import MixEditorButtonGroup from "@/views/daw/mix-editor-button/MixEditorButtonGroup.vue"
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
import { storeToRefs } from "pinia"
const trackRulerStore = useTrackRulerStore()
const audioStore = useAudioStore()

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

let audioContext = null
let controller = null
const dynamicGenerationTimeInterval = 2
function playAudio() {
  if (!isPlaying.value) {
    if (!audioContext) {
      const { audioContext: newAudioContext, controller: newController } =
        initPlay({
          anyStartTime: trackRulerStore.timelineCurrentTime,
          maxTime: trackRulerStore.maxTime,
        })

      audioContext = newAudioContext
      controller = newController
    } else {
      controller = resume(audioContext, trackRulerStore.maxTime)
    }
  } else {
    if (audioContext) {
      pause(audioContext, controller)
    }
  }
}

let checkPoint = 0
function queryCurrentTime({
  audioContext,
  signal,
  anyStartTime = 0,
  dynamicGenerationTimeInterval = 2,
  maxTime,
} = {}) {
  if (!audioContext) return
  // console.log(signal.aborted)
  let lastCheckPoint = audioContext.currentTime + anyStartTime
  requestAnimationFrame(() => {
    const time = audioContext.currentTime + anyStartTime
    const currentCheckPoint = time
    trackRulerStore.updateCurrentTime(time)
    if (lastCheckPoint <= checkPoint && currentCheckPoint >= checkPoint) {
      checkPoint += dynamicGenerationTimeInterval
      audioStore.generateAudioNode({
        audioTracksBufferSourceMap: audioStore.audioTracksBufferSourceMap,
        timelinePlayTime: accurateTime.value,
        generableAudioTimeEnd:
          accurateTime.value + dynamicGenerationTimeInterval,
        audioContext: audioStore.audioContext,
      })
    }

    if (signal.aborted) return
    if (time > maxTime) {
      audioContext.suspend()
      isPlaying.value = false
      return
    }

    queryCurrentTime({
      audioContext,
      signal,
      anyStartTime,
      dynamicGenerationTimeInterval,
      maxTime,
    })
  })
}
function initPlay({ anyStartTime, maxTime }) {
  isPlaying.value = true
  const controller = new AbortController()
  const audioContext = new AudioContext()
  checkPoint = audioContext.currentTime + anyStartTime
  queryCurrentTime({
    audioContext,
    signal: controller.signal,
    anyStartTime,
    maxTime,
    dynamicGenerationTimeInterval,
  })
  return { audioContext, controller }
}
function pause(audioContext, controller) {
  if (!audioContext) return
  isPlaying.value = false
  audioContext.suspend()
  audioStore.stopAllNodes()
  controller.abort()
}
function resume(audioContext, maxTime) {
  if (!audioContext) return
  isPlaying.value = true
  const suspendTime = audioContext.currentTime
  const anyStartTime = accurateTime.value - suspendTime
  audioContext.resume()
  checkPoint = audioContext.currentTime + anyStartTime
  controller = new AbortController()
  queryCurrentTime({
    audioContext,
    signal: controller.signal,
    anyStartTime,
    maxTime,
    dynamicGenerationTimeInterval,
  })
  return controller
}
</script>

<template>
  <MixEditorButtonGroup>
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
