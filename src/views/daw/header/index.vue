<script setup>
import { useAudioStore } from "@/store/daw/audio/index.js"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import { computed, ref } from "vue"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
const trackRulerStore = useTrackRulerStore()
const noteItemStore = useNoteItemStore()

const audioStore = useAudioStore()
const accurateTime = computed(() => {
  return trackRulerStore.timelineCurrentTime
})
const timeDisplay = computed(() => {
  return accurateTime.value.toFixed(1)
})
let anyStartTime = 0
let audioContext = null
let intervalId = null
const isPlaying = ref(false)
const hasDragged = ref(false)

// function playAudio() {
//   // audio.play()
//   isPlaying.value = !isPlaying.value
//   if (isPlaying.value) {
//     if (!audioContext) {
//       const { audioContext: _audioContext, intervalId: _intervalId } =
//         initPlay()
//       audioContext = _audioContext
//       intervalId = _intervalId
//     } else {
//       resume(audioContext)
//     }
//   } else {
//     if (audioContext) {
//       pause(audioContext, intervalId)
//     }
//   }
// }
// function queryCurrentTime(audioContext, anyStartTime = 0) {
//   if (!audioContext) return
//   let isEnded = false
//   const intervalId = setInterval(() => {
//     if (audioContext.currentTime >= 100) {
//       clearTimeout(intervalId)
//       isEnded = true
//     }
//     const time = audioContext.currentTime + anyStartTime
//     trackRulerStore.timelineCurrentTime = time
//     trackRulerStore.synchronizeStateWithCurrentTime(time)
//   }, 10)
//   return isEnded ? null : intervalId
// }
// function initPlay(anyStartTime) {
//   const audioContext = new AudioContext()
//   const intervalId = queryCurrentTime(audioContext, anyStartTime)
//   return { audioContext, intervalId }
// }
// function pause(audioContext, intervalId) {
//   if (!audioContext) return
//   audioContext.suspend()
//   console.log(intervalId)
//   if (intervalId !== null) clearInterval(intervalId)
// }
// function resume(audioContext) {
//   if (!audioContext) return
//   audioContext.resume()
//   intervalId = queryCurrentTime(audioContext)
// }
let controller = null
async function playAudio() {
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
    // await audioStore.generateAudioNode({
    //   noteBufferSourceMap: audioStore.noteBufferSourceMap,
    //   fadeGainNodeMap: audioStore.fadeGainNodeMap,
    //   timelinePlayTime: accurateTime.value,
    // })
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
  timeInterval = 2,
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
      console.log("generate")
      checkPoint += timeInterval
      audioStore.generateAudioNode({
        noteBufferSourceMap: audioStore.noteBufferSourceMap,
        fadeGainNodeMap: audioStore.fadeGainNodeMap,
        timelinePlayTime: accurateTime.value,
        generableAudioTimeEnd: accurateTime.value + timeInterval,
      })
    }

    if (signal.aborted) return
    if (time > maxTime) {
      // queryCurrentTime(audioContext, AbortSignal.abort(), anyStartTime, maxTime)
      audioContext.suspend()
      isPlaying.value = false
      return
    }

    queryCurrentTime({
      audioContext,
      signal,
      anyStartTime,
      timeInterval,
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
  })
  return controller
}
function reset(intervalId) {
  if (intervalId !== null) {
    clearInterval(intervalId)
  }
  initPlay()
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
