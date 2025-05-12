import WaveSurfer from "wavesurfer.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { AUDIO_TRACK_ENUM, MAIN_EDITOR_ID } from "@/constants/daw/index.js"
import { getOriginAudioBufferFromDatabase } from "@/store/daw/audio-binary-data/index.js"
import { cloneArrayBuffer } from "@/utils/cloneArrayBuffer.js"
import { registerProjectChangedEvent } from "@/core/custom-event/projectManager.js"
import { registerRenderWaveDiagramEvent } from "@/core/custom-event/rerenderWaveDiagram.js"

const waveSurferMap = new Map()
function resetWaveSurferMap() {
  waveSurferMap.clear()
}

export async function initWaveformDiagramOnMounted() {
  console.log("init wave")
  registerProjectChangedEvent(resetWaveSurferMap, true)
  const mixTrackEditorStore = useMixTrackEditorStore()
  const beatControllerStore = useBeatControllerStore()
  for (const {
    audioTrackType,
    subTrackItemsMap,
    mainColor,
  } of mixTrackEditorStore.mixTracksMap.values()) {
    if (audioTrackType !== AUDIO_TRACK_ENUM.VOICE) continue
    for (const {
      subTrackItemId,
      trackItemWidth,
      trackItemHeight,
      workspaceId,
    } of subTrackItemsMap.values()) {
      const target = `#${subTrackItemId}`
      const mountedElementInfo = {
        target,
        width:
          trackItemWidth * beatControllerStore.pixelsPerTick(MAIN_EDITOR_ID),
        height: trackItemHeight,
        originWidth: trackItemWidth,
      }

      const { audioBlob: audioArrayBuffer } =
        await getOriginAudioBufferFromDatabase(workspaceId)
      const options = {
        waveColor: mainColor,
        height: trackItemHeight,
      }
      await generateWaveformDiagram(
        workspaceId,
        audioArrayBuffer,
        mountedElementInfo,
        options,
      )
    }
  }
}

/**
 * @param {string} audioClipId -音频片段ID
 * @param {ArrayBuffer|Uint8Array} audioData - 音频数据
 * @param {Object} mountedElementInfo - 挂载元素信息
 * @param {HTMLElement|string} mountedElementInfo.target - 波形图挂载的DOM元素或其选择器
 * @param {number} [mountedElementInfo.width] - 波形图宽度
 * @param {number} [mountedElementInfo.height] - 波形图高度
 * @param {Object} [options={}] - WaveSurfer 配置选项
 * @returns {Promise<Object>} WaveSurfer 实例
 */
export async function generateWaveformDiagram(
  audioClipId,
  audioData,
  mountedElementInfo,
  options = {},
) {
  const beatControllerStore = useBeatControllerStore()

  // 检查参数类型
  if (!audioData) {
    throw new TypeError("请提供有效的音频数据")
  }

  if (!mountedElementInfo || !mountedElementInfo.target) {
    throw new Error("缺少必要的挂载元素信息")
  }

  const { target, width, height, originWidth } = mountedElementInfo

  // 获取DOM元素
  const container =
    typeof target === "string" ? document.querySelector(target) : target
  if (!container) {
    throw new Error(`找不到挂载元素: ${target}`)
  }

  // 设置容器尺寸
  if (width) container.style.width = `${width}px`
  if (height) container.style.height = `${height}px`

  try {
    // 创建一个 Blob 副本，而不是直接使用 audioData
    // 这样可以避免 AudioContext 解码二进制数据后导致源数据变为detached，对原始数据的潜在影响
    const audioDataCopy = cloneArrayBuffer(audioData)

    // 确定 MIME 类型 (基于简单的魔术字节检测)
    let mimeType = "audio/wav" // 默认

    // 魔术字节检测逻辑
    const dataView = new DataView(
      audioData instanceof Uint8Array ? audioData.buffer : audioData,
    )

    // 简单的文件格式检测
    if (
      dataView.getUint8(0) === 0x49 &&
      dataView.getUint8(1) === 0x44 &&
      dataView.getUint8(2) === 0x33
    ) {
      mimeType = "audio/mp3"
    } else if (
      dataView.getUint8(0) === 0x52 &&
      dataView.getUint8(1) === 0x49 &&
      dataView.getUint8(2) === 0x46 &&
      dataView.getUint8(3) === 0x46
    ) {
      mimeType = "audio/wav"
    } else if (
      dataView.getUint8(0) === 0x4f &&
      dataView.getUint8(1) === 0x67 &&
      dataView.getUint8(2) === 0x67 &&
      dataView.getUint8(3) === 0x53
    ) {
      mimeType = "audio/ogg"
    }

    // 合并默认配置和用户配置
    const defaultOptions = {
      container,
      waveColor: "#4F4A85",
      progressColor: "#383351",
      cursorColor: "#383351",
      barWidth: 1,
      barRadius: 3,
      responsive: true,
      normalize: true,
      partialRender: true,
      backend: "WebAudio", // 明确使用 WebAudio 后端
    }
    const wavesurferOptions = { ...defaultOptions, ...options }

    // 创建 WaveSurfer 实例 (适用于 7.x 版本)
    const wavesurfer = WaveSurfer.create(wavesurferOptions)

    // 设置事件监听器以便调试
    wavesurfer.on("error", (err) => {
      console.error("WaveSurfer 错误:", err)
    })

    // 尝试不同的加载方法
    try {
      console.log("尝试使用 loadBlob 方法加载音频...")

      // 创建一个新的 Blob，确保没有共享底层引用
      const blob = new Blob([new Uint8Array(audioDataCopy)], { type: mimeType })

      // 使用 loadBlob 方法
      await wavesurfer.loadBlob(blob)

      console.log("使用 loadBlob 成功加载音频")
    } catch (loadBlobError) {
      console.warn("loadBlob 方法失败，尝试备选方案:", loadBlobError)

      // 备选方案: 使用 URL.createObjectURL + load 方法
      try {
        console.log("尝试使用 URL.createObjectURL + load 方法...")

        // 创建一个新的 Blob
        const blob = new Blob([new Uint8Array(audioDataCopy)], {
          type: mimeType,
        })
        const audioUrl = URL.createObjectURL(blob)

        // 使用 load 方法 (WaveSurfer 7.x 适用)
        await wavesurfer.load(audioUrl)

        // 确保在适当的时机释放 URL
        wavesurfer.once("destroy", () => {
          URL.revokeObjectURL(audioUrl)
        })

        console.log("使用 URL.createObjectURL + load 成功加载音频")
      } catch (urlLoadError) {
        console.error("所有加载方法均失败:", urlLoadError)
        throw new Error("无法加载音频数据: " + urlLoadError.message)
      }
    }
    waveSurferMap.set(audioClipId, { wavesurfer, id: audioClipId })
    registerRenderWaveDiagramEvent(() => {
      const newWidth =
        originWidth * beatControllerStore.pixelsPerTick(MAIN_EDITOR_ID)
      updateWaveform(audioClipId, { width: newWidth })
    })
    return wavesurfer
  } catch (error) {
    console.error("生成波形图失败:", error)
    throw error
  }
}

/**
 * 更新已存在的波形图
 * @param {string} audioClipId - WaveSurfer实例
 * @param {Object} updateOptions - 要更新的选项
 */
export function updateWaveform(audioClipId, updateOptions = {}) {
  const { wavesurfer } = waveSurferMap.get(audioClipId) ?? {}
  if (!wavesurfer) {
    throw new Error("需要有效的WaveSurfer实例")
  }
  wavesurfer.setOptions({ ...updateOptions })

  return wavesurfer
}

/**
 * 计算音频文件的播放时长
 * @param {ArrayBuffer|Uint8Array} audioData - 音频数据
 * @returns {Promise<number>} 音频时长(秒)
 */
export async function calculateAudioDuration(audioData) {
  if (!audioData) {
    throw new TypeError("需要提供有效的音频数据")
  }

  // 创建临时的AudioContext
  let audioContext = new (window.AudioContext || window.webkitAudioContext)()

  try {
    // 解码音频数据
    const audioBuffer = await audioContext.decodeAudioData(
      audioData instanceof Uint8Array ? audioData.buffer : audioData,
    )

    // 获取时长(秒)
    const durationInSeconds = audioBuffer.duration

    // 关闭AudioContext，释放资源
    if (audioContext.state !== "closed") {
      await audioContext.close()
    }

    return durationInSeconds
  } catch (error) {
    console.error("解码音频数据失败:", error)

    // 确保无论如何都关闭AudioContext
    if (audioContext.state !== "closed") {
      await audioContext.close()
      audioContext = null
    }

    throw error
  }
}

/**
 * 根据音频时长、BPM和缩放级别计算总像素宽度
 * @param {number} durationInSeconds - 音频时长(秒)
 * @param {number} bpm - 每分钟节拍数
 * @param {number} [zoom=1] - 缩放级别，1为原始大小
 * @param {number} [pixelsPerSecond=100] - 默认每秒对应的像素数(在zoom=1时)
 * @param {boolean} [snapToBeat=true] - 是否对齐到完整节拍
 * @returns {Object} 包含像素宽度和节拍信息的对象
 */
export function calculateWaveformWidth(
  durationInSeconds,
  bpm,
  zoom = 1,
  pixelsPerSecond = 100,
  snapToBeat = true,
) {
  if (!durationInSeconds || durationInSeconds <= 0) {
    throw new Error("音频时长必须大于0")
  }

  if (!bpm || bpm <= 0) {
    throw new Error("BPM必须大于0")
  }

  // 计算基本像素宽度
  const baseWidth = durationInSeconds * pixelsPerSecond

  // 应用缩放
  let scaledWidth = baseWidth * zoom

  // 计算节拍相关信息
  const secondsPerBeat = 60 / bpm // 每个节拍的秒数
  const totalBeats = durationInSeconds / secondsPerBeat // 总节拍数
  const pixelsPerBeat = secondsPerBeat * pixelsPerSecond * zoom // 每个节拍的像素数

  // 如果需要对齐到完整节拍
  let finalWidth = scaledWidth
  if (snapToBeat) {
    const roundedBeats = Math.ceil(totalBeats) // 向上取整到完整节拍
    finalWidth = roundedBeats * pixelsPerBeat
  }

  return {
    width: finalWidth,
    totalBeats: totalBeats,
    roundedBeats: snapToBeat ? Math.ceil(totalBeats) : totalBeats,
    pixelsPerBeat: pixelsPerBeat,
    beatsPerSecond: bpm / 60,
    secondsPerBeat: secondsPerBeat,
  }
}
