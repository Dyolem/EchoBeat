import { defineStore } from "pinia"
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
  const audioGeneratorStore = useAudioGeneratorStore()
  const instrumentsAudioNodeMap = new Map()
  const audioTrackMap = new Map([
    [AUDIO_TRACK_ENUM.VIRTUAL_INSTRUMENTS, instrumentsAudioNodeMap],
  ])
  audioGeneratorStore.preCreateBuffer(audioContext.value)

  /**
   * 以下Map结构的键均为note元素的id
   */
  const audioTracksBufferSourceMap = ref(new Map()) //存储所有音轨的音频节点映射表
  const noteBufferSourceMap = new Map() //单个音符对应的音频节点映射表,包含创建源节点的必要信息
  const audioBufferSourceNodeMap = new Map() //根据note的id存储所有创建的对应的音频节点
  const velocityGainNodesMap = new Map() //用于处理单个音符起始音量（按压力度）的增益节点的映射表
  const fadeGainNodeMap = new Map() //用于处理单个音符尾音淡出的增益节点的映射表
  const audioControllerMap = new Map() //用于控制设置在音频源节点的ended事件处理器函数的信号控制器

  function createBufferSourceNode({ id, pitchName, audioContext }) {
    const audioBuffer = audioGeneratorStore.fetchPreLoadedBuffer(pitchName)
    const audioBufferSourceNode = audioContext.createBufferSource()
    audioBufferSourceNode.buffer = audioBuffer
    const midiNumber = audioGeneratorStore.noteToMidi(pitchName)
    audioGeneratorStore.adjustPitch(
      audioBufferSourceNode,
      midiNumber,
      audioGeneratorStore.sampleMap,
    )
    audioBufferSourceNodeMap.set(id, audioBufferSourceNode)
    return audioBufferSourceNode
  }
  function createFadeGainNode({ id, pitchName, audioContext }) {
    const fadeGainNode = fadeGainNodeMap.get(id) ?? audioContext.createGain()
    fadeGainNodeMap.set(id, fadeGainNode)
    return fadeGainNode
  }

  function createVelocityGainNode({ id, audioContext }) {
    const velocityGainNode =
      velocityGainNodesMap.get(id) ?? audioContext.createGain()
    velocityGainNode.connect(audioContext.destination)
    velocityGainNodesMap.set(id, velocityGainNode)

    return velocityGainNode
  }

  function insertSourceNodeAndGainNode(noteInfo) {
    noteBufferSourceMap.set(noteInfo.id, noteInfo)
    audioTracksBufferSourceMap.value.set(
      noteInfo.audioTrackId,
      noteBufferSourceMap,
    )
  }

  function generateAudioNode({
    audioTracksBufferSourceMap,
    timelinePlayTime,
    generableAudioTimeEnd,
    audioContext,
  }) {
    const mixingGainNode = audioContext.createGain()
    mixingGainNode.connect(audioContext.destination)
    for (const noteBufferSourceMap of audioTracksBufferSourceMap.values()) {
      for (const [id, noteBufferSourceInstance] of noteBufferSourceMap) {
        let startTime = 0
        let duration = 0
        let offsetTime = 0
        let isPlayedInMiddle = false
        const {
          pitchName,
          startTime: _startTime,
          duration: _duration,
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

        if (audioControllerMap.has(id)) continue //避免这种情况：动态生成2秒内的音频，而有一段音频从1.5秒到2.5秒，这样在0-2秒会被生成一次，2-4秒又会生成
        const audioBufferSourceNode = createBufferSourceNode({
          id,
          pitchName,
          audioContext,
        })
        const velocityGainNode = createVelocityGainNode({ id, audioContext })
        const audioController = new AbortController()
        audioControllerMap.set(id, audioController)
        audioBufferSourceNode.addEventListener(
          "ended",
          () => {
            console.log("ended")
            audioControllerMap.get(id).abort()
            audioControllerMap.delete(id)
            audioBufferSourceNode.disconnect()
            audioBufferSourceNodeMap.delete(id)
            fadeGainNodeMap.get(id)?.disconnect()
            fadeGainNodeMap.delete(id)
            velocityGainNodesMap.get(id)?.disconnect()
            velocityGainNodesMap.delete(id)
          },
          {
            signal: audioController.signal,
          },
        )
        const fadeGainNode = createFadeGainNode({ id, pitchName, audioContext })
        const audioStartTime = audioContext.currentTime + startTime

        if (isPlayedInMiddle) {
          console.log("middle")
          const fadeInStartTime = audioStartTime // 淡入开始时间
          const fadeInDuration = 0.01 // 淡入效果持续时间（秒）
          gainNodeFadeIn(fadeGainNode, {
            startTime: fadeInStartTime,
            duration,
            fadeInDuration,
          })
        }
        const fadeOutDuration = 0.2
        gainNodeFadeOut(fadeGainNode, {
          startTime: audioStartTime,
          duration,
          fadeOutDuration,
        })
        // velocityGainNode 和fadeGainNode的连接顺序是有讲究的
        audioBufferSourceNode
          .connect(fadeGainNode)
          .connect(velocityGainNode)
          .connect(mixingGainNode)
        audioBufferSourceNode.start(
          audioStartTime,
          offsetTime,
          duration + fadeOutDuration,
        )
      }
    }
  }

  function gainNodeFadeIn(
    fadeGainNode,
    { startTime, duration, fadeInDuration = 0.01 },
  ) {
    fadeInDuration = Math.min(duration, fadeInDuration)
    const fadeInStopTime = startTime + fadeInDuration
    const fadeInStartTime = fadeInStopTime - fadeInDuration // 淡出开始时间
    fadeGainNode.gain.setValueAtTime(0, fadeInStartTime) // 保持音量为 1
    fadeGainNode.gain.linearRampToValueAtTime(1, fadeInStopTime)
  }

  function gainNodeFadeOut(
    fadeGainNode,
    { startTime, duration, fadeOutDuration = 0.2 },
  ) {
    const fadeOutStopTime = startTime + duration + fadeOutDuration
    const fadeOutStartTime = fadeOutStopTime - fadeOutDuration // 淡出开始时间
    fadeGainNode.gain.setValueAtTime(fadeGainNode.gain.value, fadeOutStartTime) // 保持音量为 1
    fadeGainNode.gain.exponentialRampToValueAtTime(0.01, fadeOutStopTime) // 淡出至 0
  }
  function adjustNodeStartAndLastTime({
    id,
    newId,
    startTime,
    duration,
    pitchName,
  } = {}) {
    const noteBufferSourceInstance = noteBufferSourceMap.get(id)
    if (!noteBufferSourceInstance) return
    if (newId !== undefined) {
      const newNoteBufferSourceInstance = {
        pitchName,
        startTime: startTime,
        duration: duration,
      }
      noteBufferSourceMap.delete(id)
      noteBufferSourceMap.set(newId, newNoteBufferSourceInstance)
      insertSourceNodeAndGainNode({
        id: newId,
        ...newNoteBufferSourceInstance,
      })
    } else {
      noteBufferSourceMap.set(id, {
        startTime: startTime,
        duration: duration,
        pitchName,
      })
    }
  }

  function removeNodeFromPitchName(id, pitchName) {
    noteBufferSourceMap.delete(id)
  }
  function stopAllNodes() {
    for (const [id, audioBufferSourceNode] of audioBufferSourceNodeMap) {
      const fadeGainNode = fadeGainNodeMap.get(id)
      if (!fadeGainNode) return
      const currentTime = audioBufferSourceNode.context.currentTime
      const fadeOutDuration = 0.1
      gainNodeFadeOut(fadeGainNode, {
        startTime: currentTime,
        duration: 0,
        fadeOutDuration,
      })
      audioBufferSourceNode.stop(currentTime + fadeOutDuration)
    }

    audioBufferSourceNodeMap.clear()
  }
  return {
    audioContext,
    audioTracksBufferSourceMap,
    generateAudioNode,
    stopAllNodes,
    removeNodeFromPitchName,
    adjustNodeStartAndLastTime,
    insertSourceNodeAndGainNode,
  }
})
