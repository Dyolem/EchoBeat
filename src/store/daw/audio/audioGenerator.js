import { onUnmounted } from "vue"
import { defineStore } from "pinia"
import { NOTE_FREQUENCY_MAP, noteToMidi } from "@/constants/daw/index.js"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import JSZip from "jszip"
import {
  getDefaultInstrumentByInstrumentType,
  INSTRUMENT_SET,
} from "@/constants/daw/instruments.js"

export const useAudioGeneratorStore = defineStore("audioGenerator", () => {
  const mixTrackEditorStore = useMixTrackEditorStore()
  const AudioContext = window.AudioContext || window.webkitAudioContext
  const audioContext = new AudioContext()

  const baseURL = import.meta.env.BASE_URL

  // 音频资源管理
  const soundBankCache = new Map() // 缓存已加载的音色ZIP包
  const soundToMidiMap = new Map() // 存储每种音色实际可用的MIDI编号映射
  const allAudioTrackInstrumentBuffer = new Map() // 存储每种音色的音频缓冲区

  // 获取ZIP包的URL
  function getSoundBankZipUrl(soundName) {
    return `${baseURL}soundbanks/${soundName}/${soundName}-wav.zip`
  }

  // 解析WAV文件名以获取MIDI编号
  function getMidiNumberFromFilename(filename) {
    // 假设文件名格式为：022-StudioGrand.wav
    const match = filename.match(/^(\d+)-/)
    if (match && match[1]) {
      return parseInt(match[1], 10)
    }
    return null
  }

  // 加载并解析ZIP包
  async function loadSoundBankZip(soundName) {
    if (soundBankCache.has(soundName)) {
      return soundBankCache.get(soundName)
    }

    try {
      const zipUrl = getSoundBankZipUrl(soundName)
      const response = await fetch(zipUrl)

      // 检查 Content-Type 是否为 ZIP 文件类型
      const contentType = response.headers.get("Content-Type")
      if (
        !response.ok ||
        !contentType ||
        !(
          contentType.includes("application/zip") ||
          contentType.includes("application/octet-stream") ||
          contentType.includes("application/x-zip-compressed")
        )
      ) {
        throw new Error(
          `Failed to download sound bank: ${response.status}, Content-Type: ${contentType}`,
        )
      }

      // 检查内容长度，避免下载到 HTML 页面
      const contentLength = response.headers.get("Content-Length")
      if (contentLength && parseInt(contentLength) < 1000) {
        // HTML 页面通常很小
        const text = await response.text()
        if (text.includes("<!DOCTYPE html>") || text.includes("<html>")) {
          throw new Error("Received HTML instead of ZIP file")
        }
        // 如果已经转换为文本，则无法再次读取为 arrayBuffer
        return null
      }

      const zipData = await response.arrayBuffer()

      // 尝试验证是否为有效的 ZIP 文件
      try {
        const zip = await JSZip.loadAsync(zipData)
        // 检查是否包含文件
        const fileCount = Object.keys(zip.files).length
        if (fileCount === 0) {
          throw new Error("ZIP file contains no files")
        }

        // 缓存ZIP包
        soundBankCache.set(soundName, zip)
        return zip
      } catch (zipError) {
        throw new Error(`Invalid ZIP file: ${zipError.message}`)
      }
    } catch (error) {
      console.error(`Error loading sound bank ZIP for ${soundName}:`, error)
      return null
    }
  }

  // 从ZIP包中提取可用的音频文件
  async function extractSoundBankFiles(soundName, zip) {
    if (!zip) return new Map()

    const bufferMap = new Map()
    const availableMidiNumbers = []
    const processingPromises = []

    // 处理每个文件
    zip.forEach((relativePath, zipEntry) => {
      if (!zipEntry.name.endsWith(".wav")) return

      const midiNumber = getMidiNumberFromFilename(zipEntry.name)
      if (midiNumber === null) return

      // 添加到处理队列
      const processingPromise = zipEntry
        .async("arraybuffer")
        .then(async (arrayBuffer) => {
          try {
            // 解码音频数据
            const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)

            // 找到对应的音符名称
            const pitchName = findPitchNameForMidi(midiNumber)
            if (pitchName) {
              bufferMap.set(pitchName, audioBuffer)
              availableMidiNumbers.push(midiNumber)
            }

            return { success: true, midiNumber }
          } catch (error) {
            console.warn(`Failed to decode audio file: ${zipEntry.name}`, error)
            return { success: false, midiNumber }
          }
        })
        .catch((error) => {
          console.error(`Error processing ${zipEntry.name}:`, error)
          return { success: false, midiNumber }
        })

      processingPromises.push(processingPromise)
    })

    // 等待所有处理完成
    await Promise.allSettled(processingPromises)

    // 保存MIDI编号映射
    soundToMidiMap.set(
      soundName,
      availableMidiNumbers.sort((a, b) => a - b),
    )

    // console.log(`Sound ${soundName}: Extracted ${bufferMap.size} audio files`)
    // console.log(
    //   `Available MIDI numbers for ${soundName}:`,
    //   availableMidiNumbers,
    // )

    return bufferMap
  }

  // 添加指定音色
  async function addSoundBuffer({ soundName }) {
    if (allAudioTrackInstrumentBuffer.has(soundName)) return

    const zip = await loadSoundBankZip(soundName)
    if (!zip) {
      console.error(`Failed to load sound bank for ${soundName}`)
      return
    }

    const bufferMap = await extractSoundBankFiles(soundName, zip)
    allAudioTrackInstrumentBuffer.set(soundName, bufferMap)
  }

  // 辅助函数：通过MIDI找到对应的音符名称
  function findPitchNameForMidi(midiNumber) {
    for (const [noteName, frequency] of NOTE_FREQUENCY_MAP.entries()) {
      if (noteToMidi(noteName) === midiNumber) {
        return noteName
      }
    }
    return null
  }

  // 辅助函数：找到最接近的MIDI编号
  function findClosestMidiNumber(targetMidi, availableMidiNumbers) {
    if (availableMidiNumbers.length === 0) return null

    return availableMidiNumbers.reduce((closest, current) => {
      return Math.abs(current - targetMidi) < Math.abs(closest - targetMidi)
        ? current
        : closest
    }, availableMidiNumbers[0])
  }

  // 调整音高
  function adjustPitch({ source, midiNumber, soundName }) {
    if (!source) return

    const availableMidiNumbers = soundToMidiMap.get(soundName) || []
    if (availableMidiNumbers.length === 0) {
      console.warn(`No available samples for sound: ${soundName}`)
      return
    }

    // 找到最接近的可用样本
    const closestMidiNumber = findClosestMidiNumber(
      midiNumber,
      availableMidiNumbers,
    )

    // 计算音高差异（半音数）
    const semitoneDifference = midiNumber - closestMidiNumber

    // 调整音高 (100 cents = 1 semitone)
    source.detune.value = semitoneDifference * 100

    // 日志用于调试
    if (Math.abs(semitoneDifference) > 12) {
      console.warn(
        `Large pitch adjustment: ${semitoneDifference} semitones from ${closestMidiNumber} to ${midiNumber}`,
      )
    }
  }

  // 以淡出方式停止音频
  function stopAudio(source, gainNode) {
    if (!source || !gainNode) return

    try {
      const currentTime = audioContext.currentTime
      gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime) // 保持当前音量
      gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.5) // 0.5 秒内淡出
      source.stop(currentTime + 0.5) // 延迟停止音频
    } catch (error) {
      console.warn("Error stopping audio:", error)
    }
  }

  const MAX_CONCURRENT_PLAYBACKS = 10 // 设置最大并发数量
  const activeControllers = new Set()

  // 播放样本
  function playSample({ buffer, midiNumber, soundName }) {
    if (!buffer) {
      console.warn(
        `Cannot play: No buffer available for ${soundName} at midi number ${midiNumber}`,
      )
      return null
    }

    // 控制并发播放数量
    if (activeControllers.size >= MAX_CONCURRENT_PLAYBACKS) {
      console.warn(
        `Too many concurrent playbacks (${activeControllers.size}), stopping oldest...`,
      )
      const [oldestController] = activeControllers
      oldestController.abort()
      activeControllers.delete(oldestController)
    }

    // 创建播放控制器
    const playSampleController = new AbortController()
    activeControllers.add(playSampleController)

    // 创建音频源
    const source = audioContext.createBufferSource()
    source.buffer = buffer

    // 调整音高
    adjustPitch({ source, midiNumber, soundName })

    // 创建增益节点并连接
    const gainNode = audioContext.createGain()
    source.connect(gainNode).connect(audioContext.destination)

    // 开始播放
    source.start()

    // 设置中止事件处理
    playSampleController.signal.addEventListener(
      "abort",
      () => {
        stopAudio(source, gainNode)
      },
      { once: true },
    )

    // 设置播放结束处理
    source.addEventListener(
      "ended",
      () => {
        activeControllers.delete(playSampleController)
      },
      { once: true },
    )

    return playSampleController
  }

  function getClosestPitchName({ soundName, noteName }) {
    // 音符转 MIDI 编号
    const targetMidiNumber = noteToMidi(noteName)

    // 获取可用的MIDI编号列表
    const availableMidiNumbers = soundToMidiMap.get(soundName) || []
    if (availableMidiNumbers.length === 0) {
      console.warn(`No available samples for sound: ${soundName}`)
      return null
    }

    // 找到最接近的可用MIDI编号
    const closestMidiNumber = findClosestMidiNumber(
      targetMidiNumber,
      availableMidiNumbers,
    )
    if (closestMidiNumber === null) {
      console.warn(`Cannot find closest MIDI number for ${targetMidiNumber}`)
      return null
    }

    // 获取对应的音符名称
    const closestPitchName = findPitchNameForMidi(closestMidiNumber)
    if (!closestPitchName) {
      console.warn(
        `Cannot find pitch name for MIDI number: ${closestMidiNumber}`,
      )
      return null
    }
    return {
      closestPitchName,
      closestMidiNumber,
      originMidiNumber: targetMidiNumber,
      originPitchName: noteName,
    }
  }

  // 敲击琴键时生成音频
  function generateAudio({ audioTrackId, noteName }) {
    // 获取当前音轨使用的音色
    const soundName =
      mixTrackEditorStore.mixTracksMap.get(audioTrackId)?.instrument.sound

    if (!soundName) {
      console.warn(
        `Cannot generate audio: Invalid audioTrackId ${audioTrackId}`,
      )
      return null
    }

    // 检查该音色是否已加载
    if (
      !soundToMidiMap.has(soundName) ||
      !allAudioTrackInstrumentBuffer.has(soundName)
    ) {
      console.warn(`Sound "${soundName}" not loaded yet`)
      return null
    }

    const { closestPitchName, originMidiNumber: targetMidiNumber } =
      getClosestPitchName({ soundName, noteName })

    // 获取对应的音频缓冲区
    const buffer = allAudioTrackInstrumentBuffer
      .get(soundName)
      ?.get(closestPitchName)
    if (!buffer) {
      console.warn(
        `Buffer not found for ${soundName}, pitch: ${closestPitchName}`,
      )
      return null
    }

    // 播放样本
    return playSample({
      buffer,
      midiNumber: targetMidiNumber, // 使用目标MIDI编号进行调音
      soundName,
    })
  }

  async function initDefaultSoundBuffer() {
    Object.values(INSTRUMENT_SET).map((customInstrumentType) => {
      const { soundName } = getDefaultInstrumentByInstrumentType({
        instrumentType: customInstrumentType,
      })
      return addSoundBuffer({ soundName })
    })
  }

  // 初始化所有音轨的音频缓冲区
  async function initAudioTrackSoundBuffer() {
    const processedSounds = new Set()
    onUnmounted(() => {
      soundToMidiMap.clear()
      soundBankCache.clear()
      allAudioTrackInstrumentBuffer.clear()
    })
    await initDefaultSoundBuffer()
    // 遍历所有音轨，加载它们使用的音色
    for (const { instrument } of mixTrackEditorStore.mixTracksMap.values()) {
      const soundName = instrument.sound

      // 避免重复加载同一音色
      if (!processedSounds.has(soundName)) {
        console.log(`Initializing sound: ${soundName}`)

        // 加载ZIP包
        const zip = await loadSoundBankZip(soundName)
        if (!zip) {
          console.error(`Failed to load sound bank for ${soundName}`)
          continue
        }

        // 提取文件
        const bufferMap = await extractSoundBankFiles(soundName, zip)
        allAudioTrackInstrumentBuffer.set(soundName, bufferMap)
        console.log(allAudioTrackInstrumentBuffer)
        processedSounds.add(soundName)
      }
    }

    // console.log(`Initialized ${processedSounds.size} unique sounds`)
  }

  // 获取已加载好的音频缓冲区
  function fetchPreLoadedBuffer({ audioTrackId, pitchName, soundName }) {
    if (!soundName) {
      soundName =
        mixTrackEditorStore.mixTracksMap.get(audioTrackId)?.instrument.sound
      if (!soundName) {
        console.warn(
          `Cannot fetch buffer: Invalid audioTrackId ${audioTrackId}`,
        )
        return null
      }
    }

    const { closestPitchName } =
      getClosestPitchName({
        soundName,
        noteName: pitchName,
      }) ?? {}

    // 获取对应的音频缓冲区
    const buffer = allAudioTrackInstrumentBuffer
      .get(soundName)
      ?.get(closestPitchName)
    if (!buffer) {
      console.warn(`No buffer for pitch: ${pitchName} in sound: ${soundName}`)
      return null
    }

    return buffer
  }

  return {
    addSoundBuffer,
    noteToMidi,
    generateAudio,
    initAudioTrackSoundBuffer,
    fetchPreLoadedBuffer,
    adjustPitch,
  }
})
