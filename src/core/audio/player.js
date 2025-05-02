import { useAudioStore } from "@/store/daw/audio/index.js"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
import { storeToRefs } from "pinia"
import { onUnmounted } from "vue"
import {
  startMetronome,
  stopMetronome,
  metronomeEnabledState,
} from "@/core/audio/playMetronome.js"

let lastPlayHead = 0

//所有源节点停止时，继续等待一段时间，因为增益节点是物理执行时间，可能还未结束,在增益结束前挂起音频上下文依然会导致咔哒声
const GAIN_NODE_PHYSICAL_WAIT_MS = 300
const dynamicGenerationTimeInterval = 4
const GENERATE_AUDIO_POLLING_INTERVAL =
  (1000 * dynamicGenerationTimeInterval) / 2
const UPDATE_TRACK_TIME_POLLING_INTERVAL = 16.7

export function registerVisibilityChangeEvent() {
  const documentVisibilityController = new AbortController()
  document.addEventListener(
    "visibilitychange",
    () => {
      if (!controller) controller = new AbortController()
      queryCurrentTime({
        audioContext: audioStore.audioContext,
        signal: controller.signal,
        maxTime,
        initTime,
      })
    },
    { signal: documentVisibilityController.signal },
  )
  onUnmounted(() => {
    documentVisibilityController.abort()
  })
}

const audioStore = useAudioStore()
const trackRulerStore = useTrackRulerStore()
const {
  isPlaying,
  timelineCurrentTime,
  maxTime: maxTrackTime,
} = storeToRefs(trackRulerStore)
const { changePlayState, updateCurrentTime } = trackRulerStore

let intervalTimerId = null
let controller = null
let initTime = 0
let maxTime = 0
let lastQueryTime = 0
let currentQueryTime = 0
let isFirstQuery = true
let aggregateTime = 0
function resetFlags() {
  lastQueryTime = 0
  currentQueryTime = 0
  isFirstQuery = true
  aggregateTime = 0
}

function generateAudioHandler(
  _dynamicGenerationTimeInterval = dynamicGenerationTimeInterval,
) {
  const timelineTime = trackRulerStore.timelineCurrentTime
  audioStore.generateAudioNode({
    timelinePlayTime: timelineTime,
    generableAudioTimeEnd: timelineTime + _dynamicGenerationTimeInterval,
    audioContext: audioStore.audioContext,
  })
}

function queryCurrentTime({ audioContext, signal, maxTime, initTime } = {}) {
  if (!audioContext) return
  if (signal.aborted) {
    return
  }
  if (timelineCurrentTime.value >= maxTime) {
    pause()
    return
  }
  function queryHandler() {
    const currentTime = audioContext.currentTime
    if (!isFirstQuery) {
      currentQueryTime = currentTime
    } else {
      isFirstQuery = false
      aggregateTime = initTime
    }
    const gap = currentQueryTime - lastQueryTime
    aggregateTime += gap
    trackRulerStore.updateCurrentTime(aggregateTime)
    lastQueryTime = currentTime
    queryCurrentTime({
      audioContext,
      signal,
      maxTime,
      initTime,
    })
  }
  if (document.visibilityState === "hidden") {
    const timeoutId = setTimeout(() => {
      clearTimeout(timeoutId)
      queryHandler()
    }, UPDATE_TRACK_TIME_POLLING_INTERVAL)
  } else {
    requestAnimationFrame(() => {
      queryHandler()
    })
  }
}

export function playAudio() {
  if (!isPlaying.value) {
    resume()
  } else {
    if (audioStore.audioContext) {
      pause()
    }
  }
}

export function pause(backPlayHead = false) {
  if (!audioStore.audioContext || !controller) return
  controller.abort()
  clearInterval(intervalTimerId)
  changePlayState(false)
  stopMetronome()
  audioStore.stopAllNodes().then(() => {
    new Promise((resolve) => {
      const suspendDelayTimer = setTimeout(() => {
        resolve()
        clearTimeout(suspendDelayTimer)
      }, GAIN_NODE_PHYSICAL_WAIT_MS)
    }).then(() => {
      audioStore.audioContext.suspend()
      if (typeof backPlayHead === "boolean" && backPlayHead) {
        // 暂停音频并将时间线回退为上一次起始值
        updateCurrentTime(lastPlayHead)
      }
    })
  })
}
export function resume() {
  if (!audioStore.audioContext) return
  controller = new AbortController()
  audioStore.audioContext.resume().then(() => {
    resetFlags()
    initTime = timelineCurrentTime.value
    lastPlayHead = initTime
    if (metronomeEnabledState.value) {
      startMetronome(initTime, true)
    }
    generateAudioHandler()
    maxTime = maxTrackTime.value

    intervalTimerId = setInterval(() => {
      generateAudioHandler()
    }, GENERATE_AUDIO_POLLING_INTERVAL)
    changePlayState(true)
    queryCurrentTime({
      audioContext: audioStore.audioContext,
      signal: controller.signal,
      maxTime,
      initTime,
    })
  })
  return controller
}
