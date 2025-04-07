import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { storeToRefs } from "pinia"
import { ref, computed, onUnmounted } from "vue"
import { METRONOME_TYPE_LIST } from "@/constants/daw/index.js"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
const trackRulerStore = useTrackRulerStore()
const { timelineCurrentTime } = storeToRefs(trackRulerStore)
export const isPlayingMetronomeSample = ref(false)
export const metronomeEnabledState = ref(false)
const metronomeAudioBufferMap = new Map()
let isExecutingScheduler = false
let audioContext = null
let metronomeVolumeGainNode = null
let nextBeatTime = 0
let beatNumber = 0
const LOOK_AHEAD = 0.1 // Schedule 100ms in advance

function resetState() {
  isPlayingMetronomeSample.value = false
  metronomeEnabledState.value = false
  metronomeAudioBufferMap.clear()
  isExecutingScheduler = false
  audioContext = null
  metronomeVolumeGainNode = null
  nextBeatTime = 0
  beatNumber = 0
}

const beatControllerStore = useBeatControllerStore()
const { beatsPerMeasure, bpm, currentMetronomeSoundType } =
  storeToRefs(beatControllerStore)

const INTERVAL = computed(() => {
  return 60 / bpm.value
}) // seconds per beat

// 初始化音频上下文和加载样本
export function initMetronome(_audioContext) {
  onUnmounted(() => {
    resetState()
  })
  audioContext = _audioContext
  metronomeVolumeGainNode = audioContext.createGain()
  metronomeVolumeGainNode.connect(audioContext.destination)
  const loadMetronomeBufferAsyncWorkArr = []
  METRONOME_TYPE_LIST.forEach((metronomeType) => {
    // 加载音频文件
    const baseURL = import.meta.env.BASE_URL
    const highMetronomeAudioURL = `${baseURL}metronome-sound/${metronomeType}-Hi.wav`
    const lowMetronomeAudioURL = `${baseURL}metronome-sound/${metronomeType}-Low.wav`
    loadMetronomeBufferAsyncWorkArr.push(
      loadAudio(highMetronomeAudioURL).then((highBuffer) => {
        return {
          type: `${metronomeType}-Low`,
          buffer: highBuffer,
        }
      }),
    )
    loadMetronomeBufferAsyncWorkArr.push(
      loadAudio(lowMetronomeAudioURL).then((lowBuffer) => {
        return {
          type: `${metronomeType}-Hi`,
          buffer: lowBuffer,
        }
      }),
    )
  })
  return Promise.all(loadMetronomeBufferAsyncWorkArr)
    .then((metronomeInfoArr) => {
      metronomeInfoArr.forEach(({ type, buffer }) => {
        metronomeAudioBufferMap.set(type, buffer)
      })
    })
    .catch(() => Promise.reject(false))
}

async function loadAudio(url) {
  const response = await fetch(url)
  const arrayBuffer = await response.arrayBuffer()
  return audioContext.decodeAudioData(arrayBuffer)
}

export function playBeatOnce(type) {
  const buffer = getMetronomeBuffer(type, false)
  playBeat(buffer)
}
function playBeat(buffer, time = 0) {
  const source = audioContext.createBufferSource()
  source.buffer = buffer
  if (!metronomeVolumeGainNode) return
  source.connect(metronomeVolumeGainNode)
  if (audioContext.state === "suspended") {
    audioContext.resume().then(() => {
      source.start(time)
    })
  } else {
    source.start(time)
  }
}

function getMetronomeBuffer(type, isLow = true) {
  if (!METRONOME_TYPE_LIST.includes(type)) return
  return metronomeAudioBufferMap.get(`${type}-${isLow ? "Hi" : "Low"}`)
}

let timer = null
function scheduler() {
  if (!isExecutingScheduler) {
    clearTimeout(timer)
    return
  }

  const metronomeType = currentMetronomeSoundType.value
  // 提前调度未来 100ms 内的节拍
  while (nextBeatTime < audioContext.currentTime + LOOK_AHEAD) {
    const buffer =
      beatNumber % beatsPerMeasure.value === 0
        ? getMetronomeBuffer(metronomeType, false)
        : getMetronomeBuffer(metronomeType)
    playBeat(buffer, nextBeatTime)

    // 计算下一个节拍时间
    nextBeatTime += INTERVAL.value
    beatNumber++
  }
  // 定期检查调度
  timer = setTimeout(scheduler, 50)
}

// 控制函数
export function startMetronome(timeline = 0, isMainAudioInvoker = false) {
  stopMetronome(isMainAudioInvoker)
  isExecutingScheduler = true
  if (!isMainAudioInvoker) {
    isPlayingMetronomeSample.value = true
  } else {
    isPlayingMetronomeSample.value = false
  }
  const n = timeline % INTERVAL.value
  const offsetTime = n === 0 ? 0 : INTERVAL.value - n
  nextBeatTime = audioContext.currentTime + offsetTime
  beatNumber = Math.round((timeline + offsetTime) / INTERVAL.value)
  scheduler()
}

export function stopMetronome(isMainAudioInvoker = false) {
  isExecutingScheduler = false
  if (!isMainAudioInvoker) {
    isPlayingMetronomeSample.value = false
  }
  beatNumber = 0
  nextBeatTime = 0
}

export function toggleMetronomeState() {
  if (metronomeEnabledState.value) {
    stopMetronome(true)
  } else {
    startMetronome(timelineCurrentTime.value, true)
  }
  metronomeEnabledState.value = !metronomeEnabledState.value
}
export function updateMetronomeVolumeGainValue({ gainValue }) {
  if (typeof gainValue !== "number") return
  metronomeVolumeGainNode.gain.value = gainValue
}
