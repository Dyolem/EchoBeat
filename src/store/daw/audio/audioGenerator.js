import { defineStore } from "pinia"
// import { NOTE_FREQUENCY_MAP } from "@/constants/daw/index.js"

export const useAudioGeneratorStore = defineStore("audioGenerator", () => {
  const AudioContext = window.AudioContext || window.webkitAudioContext
  const audioContext = new AudioContext()

  const startMidiNumber = 22
  const penultimateMidiNumber = 106
  const lastMidiNumber = 108
  const interval = 3
  const pathTemplate = (midiNumber) =>
    `/public/soundbanks/studio-grand/${midiNumber >= 100 ? "" : 0}${midiNumber}-StudioGrand.wav`

  function generateSampleMap(
    startMidiNumber,
    penultimateMidiNumber,
    lastMidiNumber,
    interval,
  ) {
    // 音符到样本的映射
    // const sampleMap = {
    //   22: "/public/soundbanks/studio-grand/022-StudioGrand.wav",
    //   25: "/public/soundbanks/studio-grand/025-StudioGrand.wav",
    //   28: "/public/soundbanks/studio-grand/028-StudioGrand.wav",
    //   31: "/public/soundbanks/studio-grand/031-StudioGrand.wav",
    //   34: "/public/soundbanks/studio-grand/034-StudioGrand.wav",
    //   37: "/public/soundbanks/studio-grand/037-StudioGrand.wav",
    //   40: "/public/soundbanks/studio-grand/040-StudioGrand.wav",
    //   43: "/public/soundbanks/studio-grand/043-StudioGrand.wav",
    //   46: "/public/soundbanks/studio-grand/046-StudioGrand.wav",
    //   49: "/public/soundbanks/studio-grand/049-StudioGrand.wav",
    //   52: "/public/soundbanks/studio-grand/052-StudioGrand.wav",
    //   55: "/public/soundbanks/studio-grand/055-StudioGrand.wav",
    //   58: "/public/soundbanks/studio-grand/058-StudioGrand.wav",
    //   61: "/public/soundbanks/studio-grand/061-StudioGrand.wav",
    //   64: "/public/soundbanks/studio-grand/064-StudioGrand.wav",
    //   67: "/public/soundbanks/studio-grand/067-StudioGrand.wav",
    //   70: "/public/soundbanks/studio-grand/070-StudioGrand.wav",
    //   73: "/public/soundbanks/studio-grand/073-StudioGrand.wav",
    //   76: "/public/soundbanks/studio-grand/076-StudioGrand.wav",
    //   79: "/public/soundbanks/studio-grand/079-StudioGrand.wav",
    //   82: "/public/soundbanks/studio-grand/082-StudioGrand.wav",
    //   85: "/public/soundbanks/studio-grand/085-StudioGrand.wav",
    //   88: "/public/soundbanks/studio-grand/088-StudioGrand.wav",
    //   91: "/public/soundbanks/studio-grand/091-StudioGrand.wav",
    //   94: "/public/soundbanks/studio-grand/094-StudioGrand.wav",
    //   97: "/public/soundbanks/studio-grand/097-StudioGrand.wav",
    //   100: "/public/soundbanks/studio-grand/100-StudioGrand.wav",
    //   103: "/public/soundbanks/studio-grand/103-StudioGrand.wav",
    //   106: "/public/soundbanks/studio-grand/106-StudioGrand.wav",
    //   108: "/public/soundbanks/studio-grand/108-StudioGrand.wav",
    // }
    const sampleMap = {}
    for (let i = startMidiNumber; i <= penultimateMidiNumber; i += interval) {
      sampleMap[i] = pathTemplate(i)
    }
    sampleMap[lastMidiNumber] = pathTemplate(lastMidiNumber)
    return sampleMap
  }

  function generateAudio(noteName) {
    const sampleMap = generateSampleMap(
      startMidiNumber,
      penultimateMidiNumber,
      lastMidiNumber,
      interval,
    )

    // 将音符名称（如 C4, D#3）转化为 MIDI 编号
    function noteToMidi(noteName) {
      const noteToMIDI = {
        C: 0,
        "C#": 1,
        D: 2,
        "D#": 3,
        E: 4,
        F: 5,
        "F#": 6,
        G: 7,
        "G#": 8,
        A: 9,
        "A#": 10,
        B: 11,
      }
      const match = noteName.match(/^([A-Ga-g#b]+)(\d+)$/)
      if (!match) {
        throw new Error("Invalid note name")
      }
      const pitch = match[1].toUpperCase()
      const octave = parseInt(match[2], 10)
      return (octave + 1) * 12 + noteToMIDI[pitch] // MIDI 号码
    }

    // 音符转 MIDI 编号
    const midiNumber = noteToMidi(noteName)

    // 找到与 MIDI 编号最接近的样本
    function getSampleUrl(midiNumber) {
      const midiNumbers = Object.keys(sampleMap).map(Number)

      // 查找最接近的 MIDI 编号
      let closestMidi = midiNumbers.reduce((prev, curr) =>
        Math.abs(curr - midiNumber) < Math.abs(prev - midiNumber) ? curr : prev,
      )

      // 如果没有找到对应样本，则使用最近的样本
      return sampleMap[closestMidi]
    }

    // 加载样本
    function loadSample(url) {
      console.log(url)
      return fetch(url)
        .then((response) => response.arrayBuffer())
        .then((data) => audioContext.decodeAudioData(data))
    }

    // 播放样本
    function playSample(buffer, midiNumber) {
      const playSampleController = new AbortController()
      const source = audioContext.createBufferSource()
      source.buffer = buffer

      // 调整音高：通过 playbackRate 改变播放速度来生成不同的音高
      const targetMidiNumber = midiNumber
      const closestMidiNumber = Object.keys(sampleMap)
        .map(Number)
        .reduce((prev, curr) =>
          Math.abs(curr - targetMidiNumber) < Math.abs(prev - targetMidiNumber)
            ? curr
            : prev,
        )

      const semitoneDifference = targetMidiNumber - closestMidiNumber

      // 使用 playbackRate 来调整音高
      source.playbackRate.value = Math.pow(2, semitoneDifference / 12)

      const gainNode = audioContext.createGain()
      source.connect(gainNode).connect(audioContext.destination)
      source.start()

      playSampleController.signal.addEventListener(
        "abort",
        () => {
          stopAudio(source, gainNode)
        },
        { once: true },
      )
      return playSampleController
    }

    //以淡出方式停止音频
    function stopAudio(source, gainNode) {
      const currentTime = audioContext.currentTime
      gainNode.gain.setValueAtTime(gainNode.gain.value, currentTime) // 保持当前音量
      gainNode.gain.linearRampToValueAtTime(0, currentTime + 0.5) // 0.5 秒内淡出
      source.stop(currentTime + 0.5) // 延迟停止音频
    }

    // 获取样本 URL
    const sampleUrl = getSampleUrl(midiNumber)

    // 加载并播放样本
    return loadSample(sampleUrl).then((buffer) => {
      return playSample(buffer, midiNumber)
    })
  }

  return { generateAudio }
})
