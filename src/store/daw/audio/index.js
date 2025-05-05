import { defineStore } from "pinia"
import { useAudioGeneratorStore } from "@/store/daw/audio/audioGenerator.js"
import { ref, isRef } from "vue"
import { AudioScheduler } from "@/core/audio/AudioScheduler.js"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
import { clamp } from "@/utils/clamp.js"
import { registerDeleteAudioTrackEvent } from "@/core/custom-event/deleteAudioTrack.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { useTrackFeatureMapStore } from "@/store/daw/track-feature-map/index.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"

export const useAudioStore = defineStore("audio", () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  const audioContext = ref(new AudioContext())

  const trackRulerStore = useTrackRulerStore()
  const trackFeatureMapStore = useTrackFeatureMapStore()
  const mixTrackEditorStore = useMixTrackEditorStore()

  const noteItemStore = useNoteItemStore()
  const audioGeneratorStore = useAudioGeneratorStore()
  const beatControllerStore = useBeatControllerStore()

  const audioBufferSourceNodeMap = new Map() //根据note的id存储所有创建的对应的音频节点
  const velocityGainNodesMap = new Map() //用于处理单个音符起始音量（按压力度）的增益节点的映射表
  const fadeGainNodeMap = new Map() //用于处理单个音符尾音淡出的增益节点的映射表
  const audioControllerMap = new Map() //用于控制设置在音频源节点的ended事件处理器函数的信号控制器

  const scheduler = new AudioScheduler(audioContext.value)
  scheduler.initialize()

  //存储每个音轨的左右立体声值，音轨id为键，StereoPannerNode实例为值
  const audioTrackStereoMap = new Map()

  //存储每个音轨的总分贝值，音轨id为键，代表Volume的GainNode实例为值
  const audioTrackVolumeGainNodeMap = new Map()

  // 控制每个音轨是否被静音
  const audioTrackMutedGainNodeMap = new Map()

  const mutedAudioTrackIdSet = ref(new Set())

  // solo功能,控制哪条音轨进行solo，即只生成该音轨节点
  const soloAudioTrackId = ref("")
  function specifySoloAudioTrack({ audioTrackId }) {
    if (!mixTrackEditorStore.mixTracksMap.has(audioTrackId)) return
    soloAudioTrackId.value = audioTrackId
  }
  function cancelSoloAudioTrack() {
    soloAudioTrackId.value = ""
  }

  //全局音量总控制
  const globalGainNode = audioContext.value.createGain()

  const mixingGainNode = audioContext.value.createGain()
  const compressor = new DynamicsCompressorNode(audioContext.value, {
    threshold: -20,
    ratio: 12,
  })

  // 创建全局 AnalyserNode
  const analyserNode = audioContext.value.createAnalyser()
  analyserNode.fftSize = 2048 // 影响数据精度与性能
  analyserNode.smoothingTimeConstant = 0.8 // 平滑系数（0~1，越大越平滑）

  mixingGainNode
    .connect(compressor)
    .connect(globalGainNode)
    .connect(analyserNode)
    .connect(audioContext.value.destination)

  // 每条音轨的音量相关节点连接形成的链路集合，存储元素为音轨id
  const audioTrackNodeLinkIdSet = new Set()

  function deleteAudioTrackNodeLink(id) {
    audioTrackNodeLinkIdSet.delete(id)
  }
  registerDeleteAudioTrackEvent(({ audioTrackId }) =>
    deleteAudioTrackNodeLink(audioTrackId),
  )
  /**
   *
   * @param {Set} newAudioTrackIdSet
   */
  function initAudioTrackRelativeNode(newAudioTrackIdSet) {
    const newNodeLinkIdsSet = newAudioTrackIdSet.difference(
      audioTrackNodeLinkIdSet,
    )

    const invalidNodeLinkIdsSet =
      audioTrackNodeLinkIdSet.difference(newAudioTrackIdSet)

    newNodeLinkIdsSet.forEach((audioTrackId) => {
      audioTrackNodeLinkIdSet.add(audioTrackId)
      const audioTrackStereoPannerNode = createStereoPannerNode({
        audioTrackId: audioTrackId,
      })
      const audioTrackVolumeGainNode = createAudioTrackVolumeGainNode({
        audioTrackId: audioTrackId,
      })
      const audioTrackMutedGainNode = createAudioTrackMutedGainNode({
        audioTrackId: audioTrackId,
      })
      audioTrackStereoPannerNode
        .connect(audioTrackVolumeGainNode)
        .connect(audioTrackMutedGainNode)
      connectMixGainNode(audioTrackMutedGainNode)
    })
    invalidNodeLinkIdsSet.forEach((invalidAudioTrackId) => {
      audioTrackNodeLinkIdSet.delete(invalidAudioTrackId)
    })
  }

  /**
   * 以下Map结构的键均为note元素的id
   */
  const virtualInstrumentTypeDataProperty = {
    NOTE_BUFFER_SOURCE_MAP: "noteBufferSourceMap",
    AUDIO_BUFFER_SOURCE_NODE_MAP: "audioBufferSourceNodeMap",
    VELOCITY_GAIN_NODES_MAP: "velocityGainNodesMap",
    FADE_GAIN_NODE_MAP: "fadeGainNodeMap",
    AUDIO_CONTROLLER_MAP: "audioControllerMap",
  }

  function createBufferSourceNode({
    audioTrackId,
    id,
    pitchName,
    audioContext,
  }) {
    const soundName = mixTrackEditorStore.getAudioTrackInstrument({
      audioTrackId,
    }).sound

    const audioBuffer = audioGeneratorStore.fetchPreLoadedBuffer({
      audioTrackId,
      pitchName,
      soundName,
    })
    if (!audioBuffer) return null
    const audioBufferSourceNode = audioContext.createBufferSource()
    audioBufferSourceNode.buffer = audioBuffer
    const midiNumber = audioGeneratorStore.noteToMidi(pitchName)

    audioGeneratorStore.adjustPitch({
      source: audioBufferSourceNode,
      midiNumber,
      soundName,
    })
    audioBufferSourceNodeMap.set(id, audioBufferSourceNode)
    return audioBufferSourceNode
  }

  function createFadeGainNode({ id, audioContext }) {
    const fadeGainNode = fadeGainNodeMap.get(id) ?? audioContext.createGain()
    fadeGainNodeMap.set(id, fadeGainNode)
    return fadeGainNode
  }

  function createVelocityGainNode({ id, audioContext, velocity }) {
    const velocityGainNode =
      velocityGainNodesMap.get(id) ?? audioContext.createGain()
    velocityGainNodesMap.set(id, velocityGainNode)

    // 动态范围配置
    const MIN_DB = -48 // 最低分贝值（可调节声音响度范围）
    const MAX_VELOCITY = 127

    // 空值保护和数值约束
    const safeVelocity = Math.max(0, Math.min(velocity, MAX_VELOCITY))

    // 计算对数增益（包含静音处理）
    let gainValue = 0
    if (safeVelocity > 0) {
      const velocityRatio = (safeVelocity - 1) / (MAX_VELOCITY - 1) // 映射到0-1非线性区间
      const decibels = MIN_DB + velocityRatio * -MIN_DB // 计算分贝值变化
      gainValue = 10 ** (decibels / 20) // 转线性增益
    }

    // 原子化增益设置（避免click声）
    const now = audioContext.currentTime
    velocityGainNode.gain.cancelScheduledValues(now)
    velocityGainNode.gain.setValueAtTime(gainValue, now)
    return velocityGainNode
  }

  let controller = null
  async function generateSingleAudioNode({
    noteId,
    audioTrackId,
    workspaceId,
    audioContext,
  }) {
    if (controller) return Promise.reject()

    const noteItem = noteItemStore.getSpecifiedNoteItem({
      audioTrackId,
      workspaceId,
      noteId,
    })
    const { width, pitchName, velocity } = noteItem
    const _duration = width * beatControllerStore.absoluteTimePerTick

    if (audioContext.state === "suspended") {
      await audioContext.resume()
    }
    const audioBufferSourceNode = createBufferSourceNode({
      audioTrackId,
      id: noteId,
      pitchName,
      audioContext,
    })
    if (!audioBufferSourceNode)
      return Promise.reject("Failed to create the audioBufferSourceNode node")
    const velocityGainNode = createVelocityGainNode({
      id: noteId,
      audioContext,
      velocity,
    })
    const fadeGainNode = createFadeGainNode({
      id: noteId,
      audioContext,
    })
    const currentTime = audioContext.currentTime
    const fadeOutDuration = 0.8
    fadeGainNode.gain.setValueAtTime(
      fadeGainNode.gain.value,
      currentTime + _duration,
    ) // 保持音量为 1
    fadeGainNode.gain.exponentialRampToValueAtTime(
      0.01,
      currentTime + _duration + fadeOutDuration,
    ) // 淡出至 0

    const stereoPannerNode = audioTrackStereoMap.get(audioTrackId)
    controller = new AbortController()
    audioBufferSourceNode.addEventListener(
      "ended",
      () => {
        controller.abort()
        controller = null
        scheduler.cleanup()
        audioBufferSourceNode.disconnect()
        audioBufferSourceNodeMap.delete(noteId)
        fadeGainNode.disconnect()
        fadeGainNodeMap.delete(noteId)
        velocityGainNode.disconnect()
        velocityGainNodesMap.delete(noteId)
        if (!trackRulerStore.isPlaying) {
          audioContext.suspend()
        }
      },
      {
        once: true,
      },
    )
    audioBufferSourceNode
      .connect(fadeGainNode)
      .connect(velocityGainNode)
      .connect(stereoPannerNode)

    audioBufferSourceNode.start(currentTime, 0, _duration + fadeOutDuration)

    return controller
  }

  function generateAudioNode({
    timelinePlayTime,
    generableAudioTimeEnd,
    audioContext,
  }) {
    if (audioContext.state === "suspended") return

    for (const audioTrackId of mixTrackEditorStore.mixTracksMap.keys()) {
      if (soloAudioTrackId.value && soloAudioTrackId.value !== audioTrackId) {
        continue
      }

      const workspaceMap = trackFeatureMapStore.getSelectedTrackWorkspaceMap({
        selectedAudioTrackId: audioTrackId,
        featureType: trackFeatureMapStore.featureEnum.MIDI_WORKSPACE,
      })
      const stereoPannerNode = audioTrackStereoMap.get(audioTrackId)
      workspaceMap.forEach((workspace) => {
        const { noteItemsMap, startPosition: workspaceStartPosition } =
          workspace
        for (const noteItem of noteItemsMap.values()) {
          let startTime = 0
          let duration = 0
          let offsetTime = 0
          let isPlayedInMiddle = false
          const absoluteTimePerTick = beatControllerStore.absoluteTimePerTick
          const { id, width, relativeX, pitchName, velocity } = noteItem
          const _startTime =
            (relativeX + workspaceStartPosition) * absoluteTimePerTick
          const _duration = width * absoluteTimePerTick
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
            audioTrackId,
            id,
            pitchName,
            audioContext,
          })
          if (!audioBufferSourceNode) continue
          const velocityGainNode = createVelocityGainNode({
            id,
            audioContext,
            velocity,
          })
          const audioController = new AbortController()
          audioControllerMap.set(id, audioController)
          audioBufferSourceNode.addEventListener(
            "ended",
            () => {
              audioControllerMap.get(id).abort()
              audioControllerMap.delete(id)
              audioBufferSourceNode.disconnect()
              audioBufferSourceNodeMap.delete(id)
              scheduler.cleanup()
              fadeGainNodeMap.get(id)?.disconnect()
              fadeGainNodeMap.delete(id)
              velocityGainNodesMap.get(id)?.disconnect()
              velocityGainNodesMap.delete(id)
            },
            {
              signal: audioController.signal,
            },
          )
          const fadeGainNode = createFadeGainNode({
            id,
            audioContext,
          })
          const audioStartTime = audioContext.currentTime + startTime

          if (isPlayedInMiddle) {
            const fadeInStartTime = audioStartTime // 淡入开始时间
            const fadeInDuration = 0.01 // 淡入效果持续时间（秒）
            gainNodeFadeIn(fadeGainNode, {
              startTime: fadeInStartTime,
              duration,
              fadeInDuration,
            })
          }
          const fadeOutDuration = 0.8
          gainNodeFadeOut(fadeGainNode, {
            startTime: audioStartTime,
            duration,
            fadeOutDuration,
          })
          // velocityGainNode 和fadeGainNode的连接顺序是有讲究的

          scheduler
            .schedule(audioBufferSourceNode, id, () =>
              noteItemStore.simulatePlaySpecifiedNote(
                pitchName,
                audioController.signal,
              ),
            )
            .connect(fadeGainNode)
            .connect(velocityGainNode)
            .connect(stereoPannerNode)
          audioBufferSourceNode.start(
            audioStartTime,
            offsetTime,
            duration + fadeOutDuration,
          )
        }
      })
    }
  }

  function gainNodeFadeIn(
    fadeGainNode,
    { startTime, duration, fadeInDuration = 0.01 },
  ) {
    fadeInDuration = Math.min(duration, fadeInDuration)
    const fadeInStopTime = startTime + fadeInDuration
    const fadeInStartTime = fadeInStopTime - fadeInDuration // 淡出开始时间
    fadeGainNode.gain.setValueAtTime(0, fadeInStartTime)
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

  function stopAllNodes() {
    const FADE_TIME = 0.05 // 50ms 淡出
    const VOLUME_EPSILON = 0.0001 // 接近零的最小值
    const promises = []

    audioBufferSourceNodeMap.forEach((audioBufferSourceNode, id) => {
      const fadeGainNode = fadeGainNodeMap.get(id)
      if (!fadeGainNode) return
      const currentTime = audioBufferSourceNode.context.currentTime
      // 配置淡出曲线
      fadeGainNode.gain.cancelScheduledValues(currentTime) // 清除已有调度
      fadeGainNode.gain.setValueAtTime(fadeGainNode.gain.value, currentTime)
      fadeGainNode.gain.linearRampToValueAtTime(
        VOLUME_EPSILON,
        currentTime + FADE_TIME,
      )

      // 延迟停止音源（确保淡出完成）
      const stopTime = currentTime + FADE_TIME + 0.001 // 增益节点是物理执行，也就是说会比stop规定的时刻更靠后，需要留出容差时间避免关闭时的咔哒声（事实上最后还使用了定时器延长了100ms）
      audioBufferSourceNode.stop(stopTime)

      // 为每个节点创建一个 Promise
      const endedPromise = new Promise((resolve) => {
        // 添加一个一次性事件监听器，触发后 resolve
        const onEnded = () => {
          resolve() // 关键：通知该节点已停止
        }
        audioBufferSourceNode.addEventListener("ended", onEnded, {
          once: true,
        })
      })
      promises.push(endedPromise)
    })

    return Promise.all(promises)
  }

  function createStereoPannerNode({ audioTrackId, stereoValue = 0 }) {
    if (audioTrackStereoMap.has(audioTrackId)) {
      return audioTrackStereoMap.get(audioTrackId)
    } else {
      const stereoPannerNode = new StereoPannerNode(audioContext.value, {
        pan: clamp(stereoValue, [-1, 1]),
      })
      audioTrackStereoMap.set(audioTrackId, stereoPannerNode)
      return stereoPannerNode
    }
  }
  function updateAudioTrackStereo({ audioTrackId, stereoValue }) {
    if (!audioTrackStereoMap.has(audioTrackId)) return
    const stereoPannerNode = audioTrackStereoMap.get(audioTrackId)
    stereoPannerNode.pan.value = clamp(stereoValue, [-1, 1])
  }
  function deleteStereoPannerNode({ audioTrackId }) {
    const stereoPannerNode = audioTrackStereoMap.get(audioTrackId)
    if (!stereoPannerNode) return
    stereoPannerNode.disconnect()
    audioTrackStereoMap.delete(audioTrackId)
  }
  registerDeleteAudioTrackEvent(deleteStereoPannerNode)

  function createAudioTrackVolumeGainNode({ audioTrackId, gainValue = 1 }) {
    const volumeGainNode = audioContext.value.createGain()
    audioTrackVolumeGainNodeMap.set(audioTrackId, volumeGainNode)
    volumeGainNode.gain.value = gainValue
    return volumeGainNode
  }
  function updateAudioTrackVolumeGainNodeValue({ audioTrackId, gainValue }) {
    const volumeGainNode = audioTrackVolumeGainNodeMap.get(audioTrackId)
    if (!volumeGainNode) return

    volumeGainNode.gain.value = gainValue
  }
  function deleteVolumeGainNode({ audioTrackId }) {
    const volumeGainNode = audioTrackVolumeGainNodeMap.get(audioTrackId)
    if (!volumeGainNode) return
    volumeGainNode.disconnect()
    audioTrackVolumeGainNodeMap.delete(audioTrackId)
  }
  registerDeleteAudioTrackEvent(deleteVolumeGainNode)

  //音轨静音功能
  function createAudioTrackMutedGainNode({ audioTrackId }) {
    const mutedGainNode = audioContext.value.createGain()
    audioTrackMutedGainNodeMap.set(audioTrackId, mutedGainNode)
    mutedGainNode.gain.value = 1
    return mutedGainNode
  }
  function recoverMutedAudioTrack({ audioTrackId }) {
    mutedAudioTrackIdSet.value.delete(audioTrackId)
    updateAudioTrackMutedGainNodeValue({ audioTrackId, gainValue: 1 })
  }
  function muteSpecifiedAudioTrack({ audioTrackId }) {
    mutedAudioTrackIdSet.value.add(audioTrackId)
    updateAudioTrackMutedGainNodeValue({ audioTrackId, gainValue: 0 })
  }
  function updateAudioTrackMutedGainNodeValue({ audioTrackId, gainValue }) {
    const delayTime = 0.01
    const mutedGainNode = audioTrackMutedGainNodeMap.get(audioTrackId)
    if (!mutedGainNode) return
    if (gainValue !== 0 && gainValue !== 1) return

    const currentTime = mutedGainNode.context.currentTime
    mutedGainNode.gain.setValueAtTime(mutedGainNode.gain.value, currentTime)
    mutedGainNode.gain.linearRampToValueAtTime(
      gainValue,
      currentTime + delayTime,
    )
  }
  function deleteMutedGainNode({ audioTrackId }) {
    const mutedGainNode = audioTrackMutedGainNodeMap.get(audioTrackId)
    if (!mutedGainNode) return
    mutedGainNode.disconnect()
    audioTrackMutedGainNodeMap.delete(audioTrackId)
  }
  registerDeleteAudioTrackEvent(deleteMutedGainNode)
  registerDeleteAudioTrackEvent(({ audioTrackId }) => {
    mutedAudioTrackIdSet.value.delete(audioTrackId)
    cancelSoloAudioTrack()
  })

  function connectMixGainNode(audioNode) {
    audioNode.connect(mixingGainNode)
  }

  function updateGlobalGainNodeValue(gainValue) {
    globalGainNode.gain.value = gainValue
  }

  function calculateRMS(dataArray) {
    let sum = 0
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i] ** 2
    }
    return Math.sqrt(sum / dataArray.length)
  }

  // 计算峰值
  function calculatePeak(dataArray) {
    let peak = 0
    for (let i = 0; i < dataArray.length; i++) {
      const absValue = Math.abs(dataArray[i])
      if (absValue > peak) {
        peak = absValue
      }
    }
    return peak
  }

  // 计算当前音量的函数
  function calculateVolume() {
    // 用于存储分析数据的数组
    const dataArray = new Float32Array(analyserNode.fftSize)
    analyserNode.getFloatTimeDomainData(dataArray)

    // 计算RMS和峰值
    const rms = Math.max(calculateRMS(dataArray), 1e-6)
    const peak = Math.max(calculatePeak(dataArray), 1e-6)

    // 转换为分贝 (dB)
    const rmsDb = 20 * Math.log10(rms)
    const peakDb = 20 * Math.log10(peak)

    // 假设最小分贝值为-60dB
    const minDB = -60
    const maxDB = 0

    // 限制输入分贝值在期望范围内
    const clampedRmsDB = Math.max(minDB, Math.min(maxDB, rmsDb))
    const clampedPeakDB = Math.max(minDB, Math.min(maxDB, peakDb))

    // 线性归一化到0-1区间
    const rmsNormalized = (clampedRmsDB - minDB) / (maxDB - minDB)
    const peakNormalized = (clampedPeakDB - minDB) / (maxDB - minDB)

    // 选择较大的值来表示当前音量
    const displayNormalized = Math.max(rmsNormalized, peakNormalized)

    return {
      rms: rms,
      peak: peak,
      rmsDb: rmsDb,
      peakDb: peakDb,
      rmsNormalized: rmsNormalized,
      peakNormalized: peakNormalized,
      displayNormalized: displayNormalized, // 显示用的归一化值（RMS和峰值中的较大者）
    }
  }

  let animationFrameId = null
  function updateMeter(signal, normalizedRef) {
    if (!analyserNode || signal.aborted) {
      cancelAnimationFrame(animationFrameId)
      return
    }
    const volume = calculateVolume()
    // 更新UI
    if (isRef(normalizedRef)) {
      normalizedRef.value = volume
    }

    animationFrameId = requestAnimationFrame(() =>
      updateMeter(signal, normalizedRef),
    )
  }

  return {
    audioContext,
    soloAudioTrackId,
    mutedAudioTrackIdSet,
    initAudioTrackRelativeNode,
    generateSingleAudioNode,
    generateAudioNode,
    stopAllNodes,
    createStereoPannerNode,
    updateAudioTrackStereo,
    deleteStereoPannerNode,
    createAudioTrackVolumeGainNode,
    updateAudioTrackVolumeGainNodeValue,
    deleteVolumeGainNode,
    createAudioTrackMutedGainNode,
    recoverMutedAudioTrack,
    muteSpecifiedAudioTrack,
    deleteMutedGainNode,
    specifySoloAudioTrack,
    cancelSoloAudioTrack,
    connectMixGainNode,
    updateGlobalGainNodeValue,
    updateMeter,
  }
})
