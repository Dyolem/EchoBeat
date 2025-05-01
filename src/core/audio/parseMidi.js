import MidiParser from "midi-parser-js"
import { Midi } from "@tonejs/midi"

/**
 * @typedef {Object} MidiEvent
 * @property {string} type
 * @property {number} tick
 * @property {string | undefined} program
 */

/**
 * @typedef {Object} MidiNote
 * @property {number} channel
 * @property {number} durationTicks
 * @property {number} midi
 * @property {number} startTicks
 * @property {number} velocity
 */

/**
 * @typedef {Object} Track
 * @property {number} channel
 * @property {string} color
 * @property {number | string} id
 * @property {string | undefined} instrument
 * @property {boolean} isMuted
 * @property {string} name
 * @property {MidiEvent[]} events
 * @property {MidiNote[]} notes
 * @property {{startTick:number,endTick:number}} timeRange
 */

/**
 * @typedef {Object} TempoEvent
 * @property {number} tick
 * @property {number} tempo
 * @property {number} bpm
 */

/**
 * @typedef {Object} MidiMeta
 * @property {number} formatType
 * @property {number} ppqn
 * @property {number} initialBpm
 * @property {TempoEvent[]} tempoEvents
 * @property {string} timeSignature
 * @property {number} durationTicks
 */

/**
 * @typedef {Object} MidiData
 * @property {number} version
 * @property {MidiMeta} meta
 * @property {Track[]} tracks
 */

/**
 * @param midiObject
 * @returns {MidiData}
 */

let getCurrentBPMHelper = null
function parseMidiForDAW(midiObject) {
  const output = {
    version: 1,
    meta: {
      formatType: midiObject.formatType,
      ppqn: midiObject.timeDivision,
      initialBpm: 120, // 默认初始BPM
      tempoEvents: [], // 存储所有tempo变化事件
      timeSignature: "4/4", // 默认拍号
      durationTicks: 0, // 动态更新最长事件 tick
    },
    tracks: [],
  }

  let globalPendingNotes = {} // 全局未关闭音符跨轨道匹配（如果 format0 需要）
  let globalCurrentTempo = 500000 // 对应 120 BPM

  // 收集所有轨道中的所有tempo事件
  const allTempoEvents = []

  // ====== 第一遍：收集所有轨道中的所有tempo事件 ======
  midiObject.track.forEach((track, trackIndex) => {
    let currentTick = 0

    track.event.forEach((event) => {
      currentTick += event.deltaTime

      // 提取曲速（metaType 81）
      if (event.type === 255 && event.metaType === 81) {
        const tempo = event.data
        const bpm = Math.round(60000000 / tempo)

        allTempoEvents.push({
          tick: currentTick,
          tempo: tempo,
          bpm: bpm,
          trackIndex: trackIndex, // 记录来源轨道（仅用于调试）
        })
      }
    })
  })

  // 按时间顺序排序所有tempo事件
  allTempoEvents.sort((a, b) => a.tick - b.tick)

  // 存储到meta中
  output.meta.tempoEvents = allTempoEvents

  // 设置初始BPM（如果有tempo事件）
  if (allTempoEvents.length > 0) {
    output.meta.initialBpm = allTempoEvents[0].bpm
  }

  // ====== 处理全局参数（节拍等） ======
  if (midiObject.track?.[0]?.event) {
    let globalTick = 0

    midiObject.track[0].event.forEach((event) => {
      globalTick += event.deltaTime

      // 提取拍号（metaType 88）
      if (event.type === 255 && event.metaType === 88) {
        if (event.data?.length >= 2) {
          const denominator = Math.pow(2, event.data[1])
          output.meta.timeSignature = `${event.data[0]}/${denominator}`
        }
      }
    })
  }

  // ====== 处理每个轨道 ======
  midiObject.track.forEach((origTrack, trackIdx) => {
    const track = {
      id: trackIdx,
      name: `Track ${trackIdx}`,
      instrument: 0,
      channel: 0,
      isMuted: false,
      color: "#" + Math.floor(Math.random() * 16777215).toString(16), // 随机颜色
      notes: [],
      events: [],
      timeRange: {
        startTick: Infinity,
        endTick: -Infinity,
      },
    }

    let currentTick = 0
    let pendingNotes = {} // 未关闭的 notes（通道-音符作为键）
    let lastProgram = 0

    // ----- 遍历轨道内事件 -----
    origTrack.event.forEach((event) => {
      currentTick += event.deltaTime

      // 更新轨道时间范围
      track.timeRange.startTick = Math.min(
        track.timeRange.startTick,
        currentTick,
      )
      track.timeRange.endTick = Math.max(track.timeRange.endTick, currentTick)
      output.meta.durationTicks = Math.max(
        output.meta.durationTicks,
        currentTick,
      )

      // ==== 处理 Meta 事件 ====
      if (event.type === 255) {
        // 轨道名称（metaType 0x03）
        if (event.metaType === 3 && event.data) {
          track.name = event.data // 转换字节数组为字符串
        }

        // 记录tempo事件到轨道事件中（虽然已经收集了全局tempo事件，但保留在轨道事件中可能有用）
        if (event.metaType === 81) {
          track.events.push({
            type: "tempo",
            tick: currentTick,
            tempo: event.data,
            bpm: Math.round(60000000 / event.data),
          })
        }
      }

      // ==== 处理 MIDI 通道事件（音符、控制器等） ====
      else if (event.type !== 255) {
        // 非 Meta 事件
        track.channel = event.channel || 0

        // Note On 事件
        if (event.type === 9 && event.data?.length >= 2) {
          const note = event.data[0]
          const velocity = event.data[1]
          if (velocity > 0) {
            const key = `${track.channel}-${note}`
            pendingNotes[key] = { startTick: currentTick, velocity }
          } else {
            // velocity=0 视为 Note Off
            handleNoteOff(track.channel, note, currentTick)
          }
        }

        // Note Off 事件（type=8）
        else if (event.type === 8 && event.data?.length >= 1) {
          const note = event.data[0]
          handleNoteOff(track.channel, note, currentTick)
        }

        // Program Change 事件（设置乐器）
        else if (event.type === 12) {
          // 0xC
          lastProgram = event.data[0]
          track.instrument = lastProgram
          track.events.push({
            type: "programChange",
            tick: currentTick,
            program: lastProgram,
          })
        }

        // 控制事件（如音量、表情）
        else if (event.type >= 176 && event.type <= 191) {
          // Control Change
          track.events.push({
            type: "control",
            tick: currentTick,
            controller: event.data[0],
            value: event.data[1],
          })
        }
      }

      // -- 辅助函数：处理 Note Off --
      function handleNoteOff(channel, note, endTick) {
        const key = `${channel}-${note}`
        const pending = pendingNotes[key]
        if (pending) {
          track.notes.push({
            midi: note,
            startTicks: pending.startTick,
            durationTicks: endTick - pending.startTick,
            velocity: pending.velocity,
            channel: channel,
          })
          delete pendingNotes[key]
        }
      }
    })

    // 按起始时间对音符排序
    track.notes.sort((a, b) => a.startTicks - b.startTicks)

    // 添加轨道到输出
    output.tracks.push(track)
  })

  /**
   * 根据tick获取当前应用的BPM
   * @param {number} tick 当前的tick位置
   * @returns {number} 当前应用的BPM值
   */
  getCurrentBPMHelper = function (tick) {
    const tempoEvents = output.meta.tempoEvents

    // 如果没有tempo事件或者当前tick在第一个tempo事件之前，返回初始BPM
    if (tempoEvents.length === 0 || tick < tempoEvents[0].tick) {
      return output.meta.initialBpm
    }

    // 找到当前tick之前的最后一个tempo事件
    for (let i = tempoEvents.length - 1; i >= 0; i--) {
      if (tick >= tempoEvents[i].tick) {
        return tempoEvents[i].bpm
      }
    }

    // 默认返回初始BPM（理论上不会到达这里）
    return output.meta.initialBpm
  }
  return output
}

/**
 * 计算MIDI文件中特定时间段的实际持续时间（秒）
 * @param {MidiData} midiData 解析后的MIDI数据
 * @param {number} startTick 起始tick
 * @param {number} endTick 结束tick
 * @returns {number} 持续时间（秒）
 */
function calculateDuration(midiData, startTick, endTick) {
  const tempoEvents = midiData.meta.tempoEvents
  const ppqn = midiData.meta.ppqn
  let duration = 0

  // 如果没有tempo事件，使用初始BPM计算
  if (tempoEvents.length === 0) {
    const secondsPerTick = 60 / (midiData.meta.initialBpm * ppqn)
    return (endTick - startTick) * secondsPerTick
  }

  // 按tempo事件分段计算
  let currentTick = startTick
  let currentTempoIndex = -1

  // 找到开始tick对应的tempo事件
  for (let i = 0; i < tempoEvents.length; i++) {
    if (currentTick >= tempoEvents[i].tick) {
      currentTempoIndex = i
    } else {
      break
    }
  }

  // 如果当前tick在第一个tempo事件之前
  if (currentTempoIndex === -1) {
    const firstTempoTick = tempoEvents[0].tick
    if (firstTempoTick < endTick) {
      // 计算从currentTick到第一个tempo事件的持续时间
      const secondsPerTick = 60 / (midiData.meta.initialBpm * ppqn)
      duration += (firstTempoTick - currentTick) * secondsPerTick
      currentTick = firstTempoTick
      currentTempoIndex = 0
    } else {
      // 整个范围都在第一个tempo事件之前
      const secondsPerTick = 60 / (midiData.meta.initialBpm * ppqn)
      return (endTick - startTick) * secondsPerTick
    }
  }

  // 计算剩余的时间段
  while (currentTick < endTick && currentTempoIndex < tempoEvents.length) {
    const currentTempo = tempoEvents[currentTempoIndex]
    const nextTempoTick =
      currentTempoIndex < tempoEvents.length - 1
        ? tempoEvents[currentTempoIndex + 1].tick
        : Infinity

    const segmentEndTick = Math.min(endTick, nextTempoTick)
    const secondsPerTick = 60 / (currentTempo.bpm * ppqn)

    duration += (segmentEndTick - currentTick) * secondsPerTick
    currentTick = segmentEndTick

    if (currentTick < endTick) {
      currentTempoIndex++
    }
  }

  return duration
}

export { parseMidiForDAW, getCurrentBPMHelper, calculateDuration }

// 转换字节数组为字符串（用于 Track Name）
function bytesToString(bytes) {
  return String.fromCharCode(...bytes).replace(/\x00/g, "")
}

export function parseMidi(arrayBuffer) {
  return new Promise((resolve, reject) => {
    const unit8ArrayBuffer = new Uint8Array(arrayBuffer)
    const midi = new Midi(unit8ArrayBuffer)
    let warningMessages = []

    // 保存原始 console.warn 方法
    const originalWarn = console.warn

    // 临时覆盖 warn 方法以捕获警告
    console.warn = (...args) => {
      warningMessages.push(args.join(" "))
      originalWarn.apply(console, args) // 保持原始控制台输出
    }

    try {
      const midiObj = MidiParser.parse(unit8ArrayBuffer)

      // 恢复原始 console.warn
      console.warn = originalWarn

      if (midiObj === false) {
        const errorMessage =
          warningMessages.join(" || ") ||
          "Unable to import file.Please check that your file is not corrupted"
        reject(new Error(errorMessage))
        return
      }

      resolve(midi)
    } catch (error) {
      // 确保异常时也恢复 console.warn
      console.warn = originalWarn
      reject(error)
    }
  })
}
