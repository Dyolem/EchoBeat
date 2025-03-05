import MidiParser from "midi-parser-js"

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
 * @typedef {Object} MidiMeta
 * @property {number} formatType
 * @property {number} ppqn
 * @property {number} bpm
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
function parseMidiForDAW(midiObject) {
  const output = {
    version: 1,
    meta: {
      formatType: midiObject.formatType,
      ppqn: midiObject.timeDivision,
      bpm: 120, // 默认BPM
      timeSignature: "4/4", // 默认拍号
      durationTicks: 0, // 动态更新最长事件 tick
    },
    tracks: [],
  }

  let globalPendingNotes = {} // 全局未关闭音符跨轨道匹配（如果 format0 需要）
  let globalCurrentTempo = 500000 // 对应 120 BPM

  // ====== 处理全局参数（通常为 Track 0，如果存在） ======
  if (midiObject.track?.[0]?.event) {
    let globalTick = 0

    midiObject.track[0].event.forEach((event) => {
      globalTick += event.deltaTime

      // 提取曲速（metaType 81）
      if (event.type === 255 && event.metaType === 81) {
        globalCurrentTempo = event.data
        output.meta.bpm = Math.round(60000000 / globalCurrentTempo)
      }

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
          console.log(event)
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

  return output
}

// 转换字节数组为字符串（用于 Track Name）
function bytesToString(bytes) {
  return String.fromCharCode(...bytes).replace(/\x00/g, "")
}

export function parseMidi(arrayBuffer) {
  const unit8ArrayBuffer = new Uint8Array(arrayBuffer)
  const midiObj = MidiParser.parse(unit8ArrayBuffer)
  return parseMidiForDAW(midiObj)
}
