<script setup>
import { useAudioStore } from "@/store/daw/audio/index.js"
import { computed } from "vue"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
const trackRulerStore = useTrackRulerStore()

const audioStore = useAudioStore()
const accurateTime = computed(() => {
  return trackRulerStore.timelineCurrentTime
})
const timeDisplay = computed(() => {
  return accurateTime.value.toFixed(1)
})

let audioContext = null
let isPlaying = false
let controller = null
const dynamicGenerationTimeInterval = 2
function playAudio() {
  if (!isPlaying) {
    if (!audioContext) {
      const { audioContext: newAudioContext, controller: newController } =
        initPlay({
          anyStartTime: trackRulerStore.timelineCurrentTime,
          maxTime: trackRulerStore.totalTime,
        })

      audioContext = newAudioContext
      controller = newController
    } else {
      controller = resume(audioContext, trackRulerStore.totalTime)
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
    trackRulerStore.timelineCurrentTime = time
    trackRulerStore.synchronizeStateWithCurrentTime(time)
    if (lastCheckPoint <= checkPoint && currentCheckPoint >= checkPoint) {
      // console.log("generate")
      checkPoint += dynamicGenerationTimeInterval
      audioStore.generateAudioNode({
        noteBufferSourceMap: audioStore.noteBufferSourceMap,
        timelinePlayTime: accurateTime.value,
        generableAudioTimeEnd:
          accurateTime.value + dynamicGenerationTimeInterval,
        audioContext: audioStore.audioContext,
      })
    }

    if (signal.aborted) return
    if (time > maxTime) {
      audioContext.suspend()
      isPlaying = false
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
  isPlaying = true
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
  isPlaying = false
  audioContext.suspend()
  audioStore.stopAllNodes()
  controller.abort()
}
function resume(audioContext, maxTime) {
  if (!audioContext) return
  isPlaying = true
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
  <div class="studio-header">
    <button @click="playAudio">play audio</button>
    <button @click="pause">pause audio</button>
    <button @click="resume">resume audio</button>
    <div class="time">{{ timeDisplay }}</div>
  </div>
</template>

<style scoped>
.studio-header {
  width: 100vw;
  height: var(--header-height);
  background-color: black;
}
.time {
  color: #fff;
}
</style>
