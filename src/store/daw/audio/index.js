import { defineStore } from "pinia"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
import { useAudioGeneratorStore } from "@/store/daw/audio/audioGenerator.js"
import { ref } from "vue"

export const useAudioStore = defineStore("audio", () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  const audioContext = ref(new AudioContext())
  // 监听用户交互（例如点击页面）
  document.addEventListener(
    "click",
    () => {
      if (audioContext.value.state === "suspended") {
        audioContext.value.resume().then(() => {
          console.log("AudioContext resumed")
          console.log("Current time:", audioContext.value.currentTime) // 现在 currentTime 会开始递增
        })
      }
    },
    {
      once: true,
    },
  )
  const AUDIO_TRACK_ENUM = {
    VOICE: "voice",
    VIRTUAL_INSTRUMENTS: "virtual-instruments",
    DRUM_MACHINE: "drum-machine",
    SAMPLE: "sample",
    GUITAR: "guitar",
    BASS: "bass",
  }
  const noteItemStore = useNoteItemStore()
  const trackRulerStore = useTrackRulerStore()
  const audioGeneratorStore = useAudioGeneratorStore()
  const instrumentsAudioNodeMap = new Map()
  const audioTrackMap = new Map([
    [AUDIO_TRACK_ENUM.VIRTUAL_INSTRUMENTS, instrumentsAudioNodeMap],
  ])
  audioGeneratorStore.preCreateBuffer(audioContext.value)
  // 存储每个 pitchName 对应的 GainNode，由于同属于一个pitchName的note元素会有多个，
  // 会有多个fadeGainNode来链接一个GainNode
  const gainNodesMap = ref(new Map())
  const noteBufferSourceMap = ref(new Map()) //单个音符对应的音频节点映射表
  const fadeGainNodeMap = ref(new Map()) //用于处理单个音符尾音淡出的增益节点的映射表

  const audioBufferSourceNodeMap = new Map() //根据note的id存储所有对应的音频节点

  async function createBufferSourceNode({ id, pitchName, audioContext }) {
    const audioBuffer = audioGeneratorStore.fetchPreLoadedBuffer(pitchName)
    const audioBufferSourceNode = audioContext.createBufferSource()
    audioBufferSourceNode.buffer = audioBuffer
    const midiNumber = audioGeneratorStore.noteToMidi(pitchName)
    audioGeneratorStore.adjustPitch(
      audioBufferSourceNode,
      midiNumber,
      audioGeneratorStore.sampleMap,
    )
    const fadeGainNode = fadeGainNodeMap.value.get(id)
    audioBufferSourceNode.connect(fadeGainNode)
    return audioBufferSourceNode
  }
  async function insertSourceNodeAndGainNode(noteInfo) {
    const { id, pitchName, startTime, duration, audioContext } = noteInfo
    let gainNode
    if (!gainNodesMap.value.has(pitchName)) {
      gainNode = audioContext.createGain()
      gainNodesMap.value.set(pitchName, gainNode)
      gainNode.connect(audioContext.destination) // 连接到目标
    } else {
      gainNode = gainNodesMap.value.get(pitchName)
    }

    console.log(startTime, duration)

    // 创建 BufferSource 和 GainNode
    const fadeGainNode = audioContext.createGain()
    fadeGainNode.connect(gainNode)
    fadeGainNodeMap.value.set(id, fadeGainNode)

    noteBufferSourceMap.value.set(id, {
      pitchName,
      startTime,
      duration,
      audioContext,
    })
  }

  const audioControllerMap = new Map()
  // const toBePlayedAudioBufferSourceNodeIdSet = new Set()
  async function generateAudioNode({
    noteBufferSourceMap,
    fadeGainNodeMap,
    timelinePlayTime,
    generableAudioTimeEnd,
  }) {
    for (const [id, noteBufferSourceInstance] of noteBufferSourceMap) {
      let startTime = 0
      let duration = 0
      let offsetTime = 0
      let isPlayedInMiddle = false
      const {
        pitchName,
        startTime: _startTime,
        duration: _duration,
        audioContext,
      } = noteBufferSourceInstance
      if (_startTime >= generableAudioTimeEnd) continue
      if (timelinePlayTime > _startTime + _duration) continue
      else if (
        timelinePlayTime >= _startTime &&
        timelinePlayTime <= _startTime + _duration
      ) {
        startTime = 0
        offsetTime = timelinePlayTime - _startTime
        duration = _duration - offsetTime
        isPlayedInMiddle = true
      } else if (timelinePlayTime < _startTime) {
        startTime = _startTime - timelinePlayTime
        duration = _duration
      }
      const audioBufferSourceNode = await createBufferSourceNode({
        id,
        pitchName,
        audioContext,
      })
      const audioController = new AbortController()
      if (audioControllerMap.has(id)) continue
      audioControllerMap.set(id, audioController)
      audioBufferSourceNode.addEventListener(
        "ended",
        () => {
          console.log("ended")
          audioControllerMap.get(id).abort()
          audioControllerMap.delete(id)
          audioBufferSourceNodeMap.delete(id)
        },
        {
          signal: audioController.signal,
        },
      )
      audioBufferSourceNodeMap.set(id, audioBufferSourceNode)
      const audioStartTime = audioContext.currentTime + startTime
      const fadeGainNode = fadeGainNodeMap.get(id)
      const fadeInDuration = 0.01 // 淡入效果持续时间（秒）

      const fadeInStartTime = audioStartTime // 淡入开始时间
      if (isPlayedInMiddle) {
        console.log("middle")

        // 设置初始音量为 0
        fadeGainNode.gain.setValueAtTime(0.01, fadeInStartTime)

        // 线性淡入到音量 1
        fadeGainNode.gain.exponentialRampToValueAtTime(
          1,
          fadeInStartTime + fadeInDuration,
        )
      } else {
        fadeGainNode.gain.setValueAtTime(1, fadeInStartTime)
      }
      // gainNodeFadeOut(fadeGainNode, { startTime: audioStartTime, duration })
      const fadeOutDuration = 0.5 // 淡出效果持续时间（秒）
      const fadeOutStopTime = audioStartTime + duration + fadeOutDuration
      const fadeOutStartTime = fadeOutStopTime - fadeOutDuration // 淡出开始时间
      fadeGainNode.gain.setValueAtTime(
        fadeGainNode.gain.value,
        fadeOutStartTime,
      ) // 保持音量为 1
      fadeGainNode.gain.linearRampToValueAtTime(0, fadeOutStopTime) // 淡出至 0
      // fadeGainNode.gain.setValueAtTime(1, fadeOutStopTime + 0.5)
      audioBufferSourceNode.start(
        audioStartTime,
        offsetTime,
        duration + fadeOutDuration,
      )
    }
  }

  // function gainNodeFadeOut(fadeGainNode, { startTime, duration }) {
  //   const fadeOutDuration = 0.1 // 淡出效果持续时间（秒）
  //   const fadeOutStopTime = startTime + duration
  //   const fadeOutStartTime = fadeOutStopTime - fadeOutDuration // 淡出开始时间
  //   fadeGainNode.gain.setValueAtTime(1, fadeOutStartTime) // 保持音量为 1
  //   fadeGainNode.gain.exponentialRampToValueAtTime(0.01, fadeOutStopTime) // 淡出至 0
  // }

  function gainNodeFadeOut(fadeGainNode, { startTime, duration }) {
    const fadeOutDuration = 0.1 // 淡出效果持续时间（秒）
    const fadeOutStopTime = startTime + duration
    const fadeOutStartTime = fadeOutStopTime - fadeOutDuration // 淡出开始时间
    fadeGainNode.gain.setValueAtTime(1, fadeOutStartTime) // 保持音量为 1
    fadeGainNode.gain.exponentialRampToValueAtTime(0.01, fadeOutStopTime) // 淡出至 0
  }
  async function adjustNodeStartAndLastTime({
    id,
    newId,
    startTime,
    duration,
    pitchName,
    audioContext,
  } = {}) {
    // if (
    //   id === undefined ||
    //   pitchName === undefined ||
    //   !pitchAudioSourceNodeInstance ||
    //   !fadeGainNode ||
    //   startTime === undefined ||
    //   lastTime === undefined ||
    //   !(audioContext instanceof AudioContext)
    // )
    //   return

    const noteBufferSourceInstance = noteBufferSourceMap.value.get(id)
    if (!noteBufferSourceInstance) return
    if (newId !== undefined) {
      const newNoteBufferSourceInstance = {
        pitchName,
        startTime: startTime,
        duration: duration,
        audioContext: audioContext,
      }
      noteBufferSourceMap.value.delete(id)
      noteBufferSourceMap.value.set(newId, newNoteBufferSourceInstance)
      await insertSourceNodeAndGainNode({
        id: newId,
        ...newNoteBufferSourceInstance,
      })
    } else {
      noteBufferSourceMap.value.set(id, {
        startTime: startTime,
        duration: duration,
        pitchName,
        audioContext: audioContext,
      })
    }

    const oldAudioBufferSourceNode = audioBufferSourceNodeMap.get(id)
    if (!oldAudioBufferSourceNode) return
    oldAudioBufferSourceNode.disconnect()
    audioBufferSourceNodeMap.delete(id)
  }

  // 动态调整链路
  function removeNodeFromPitchName(id, pitchName) {
    const gainNode = gainNodesMap.value.get(pitchName)
    noteBufferSourceMap.value.delete(id)
    if (audioBufferSourceNodeMap.has(id)) {
      const audioBufferSourceNode = audioBufferSourceNodeMap.get(id)
      audioBufferSourceNode.disconnect()
      audioBufferSourceNodeMap.delete(id)
    }
    const fadeGainNodeToRemove = fadeGainNodeMap.value.get(id)
    if (gainNode) {
      fadeGainNodeToRemove.disconnect(gainNode) // 断开子节点
      fadeGainNodeMap.value.delete(id)
    }
  }
  function stopAllNodes() {
    for (const [id, audioBufferSourceNode] of audioBufferSourceNodeMap) {
      const currentTime = audioBufferSourceNode.context.currentTime
      const fadeGainNode = fadeGainNodeMap.value.get(id)
      const duration = 0.1
      fadeGainNode.gain.setValueAtTime(fadeGainNode.gain.value, currentTime) // 保持音量为 1
      fadeGainNode.gain.linearRampToValueAtTime(0.01, currentTime + duration) // 淡出至 0
      audioBufferSourceNode.stop(currentTime + duration)
    }

    audioBufferSourceNodeMap.clear()
  }
  return {
    audioContext,
    gainNodesMap,
    noteBufferSourceMap,
    fadeGainNodeMap,
    // updateInstrumentAudioNode,
    generateAudioNode,
    stopAllNodes,
    removeNodeFromPitchName,
    adjustNodeStartAndLastTime,
    insertSourceNodeAndGainNode,
  }
})
