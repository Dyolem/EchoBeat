<script setup>
import { useAudioStore } from "@/store/daw/audio/index.js"
import { computed, ref } from "vue"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
import MixEditorButtonGroup from "@/views/daw/mix-editor-button/MixEditorButtonGroup.vue"
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"
const trackRulerStore = useTrackRulerStore()

const audioStore = useAudioStore()
const accurateTime = computed(() => {
  return trackRulerStore.timelineCurrentTime
})
const timeDisplay = computed(() => {
  return accurateTime.value.toFixed(1)
})

let audioContext = null
let isPlaying = ref(false)
let controller = null
const dynamicGenerationTimeInterval = 2
function playAudio() {
  if (!isPlaying.value) {
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
    <MixEditorButton @click="playAudio">
      <echo-iconoir:play-solid v-if="!isPlaying"></echo-iconoir:play-solid>
      <echo-material-symbols:pause-rounded
        v-if="isPlaying"
      ></echo-material-symbols:pause-rounded>
    </MixEditorButton>
    <MixEditorButton>
      <echo-ri:skip-back-fill></echo-ri:skip-back-fill>
    </MixEditorButton>
    <MixEditorButton>
      <div class="time">{{ timeDisplay }}</div>
    </MixEditorButton>
  </MixEditorButtonGroup>
</template>

<style scoped>
.time {
  color: #fff;
}
</style>
