<script setup>
import { useAudioStore } from "@/store/daw/audio/index.js"
import { computed } from "vue"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
import MixEditorButtonGroup from "@/views/daw/mix-editor-button/MixEditorButtonGroup.vue"
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
import { storeToRefs } from "pinia"
import { getCurrentBPMHelper } from "@/core/audio/parseMidi.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
const trackRulerStore = useTrackRulerStore()
const audioStore = useAudioStore()
const beatControllerStore = useBeatControllerStore()

const { changePlayState } = trackRulerStore
const { isPlaying, timelineCurrentTime, logicTimeOffset } =
  storeToRefs(trackRulerStore)
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

let newLogicTime = 0
let timer = null
let controller = null
const maxTime = computed(() => {
  return trackRulerStore.maxTime
})
const dynamicGenerationTimeInterval = 2
function generateAudioHandler() {
  const logicTime = audioStore.audioContext.currentTime + logicTimeOffset.value
  const currentTick = logicTime / beatControllerStore.absoluteTimePerTick
  const toBeValidateBpm = getCurrentBPMHelper?.(currentTick)
  const { bpm } = beatControllerStore.updateChoreAudioParams({
    bpm: toBeValidateBpm,
  })
  const [newBpm, oldBpm] = bpm
  const newTimeWidthNewBpm = (logicTime / newBpm) * oldBpm
  trackRulerStore.updateLogicTimeOffset(newTimeWidthNewBpm - logicTime)
  newLogicTime = logicTimeOffset.value + audioStore.audioContext.currentTime

  audioStore.generateAudioNode({
    audioTracksBufferSourceMap: audioStore.audioTracksBufferSourceMap,
    timelinePlayTime: newLogicTime,
    generableAudioTimeEnd: newLogicTime + dynamicGenerationTimeInterval,
    audioContext: audioStore.audioContext,
  })
}

function queryCurrentTime({
  audioContext,
  signal,
  dynamicGenerationTimeInterval = 2,
} = {}) {
  if (!audioContext) return
  if (signal.aborted) return
  if (accurateTime.value > maxTime.value) {
    pause(audioContext, controller)
    return
  }
  requestAnimationFrame(() => {
    trackRulerStore.updateCurrentTime(
      logicTimeOffset.value + audioContext.currentTime,
    )
    queryCurrentTime({
      audioContext,
      signal,
      dynamicGenerationTimeInterval,
    })
  })
}

function playAudio() {
  if (!isPlaying.value) {
    resume(audioStore.audioContext, maxTime.value)
  } else {
    if (audioStore.audioContext) {
      pause(audioStore.audioContext, controller)
    }
  }
}

async function pause(audioContext, controller) {
  if (!audioContext) return

  await audioStore.stopAllNodes()
  await new Promise((resolve) => {
    const suspendDelayTimer = setTimeout(() => {
      resolve()
      clearTimeout(suspendDelayTimer)
    }, 100)
  })
  await audioContext.suspend()
  controller.abort()
  clearInterval(timer)
  changePlayState(false)
}
function resume(audioContext, maxTime) {
  if (!audioContext) return
  audioContext.resume().then(() => {
    controller = new AbortController()
    generateAudioHandler()
    timer = setInterval(() => {
      generateAudioHandler()
    }, 1000)
    queryCurrentTime({
      audioContext,
      signal: controller.signal,
      maxTime,
      dynamicGenerationTimeInterval,
    })
    changePlayState(true)
  })
  return controller
}
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
