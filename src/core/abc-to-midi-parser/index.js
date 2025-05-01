// 顶部导入判断用变量
const isNode = typeof window === "undefined"

let fs
if (isNode) {
  fs = await import("fs/promises")
}

// abc-to-midi-parser.js
// ABC记谱法解析工具，将ABC格式转换为@tone/midi库兼容的数据格式

/**
 * ABC记谱法解析器
 * 支持的功能：
 * - 基本音符和休止符解析
 * - 音高和时值处理
 * - 调号和拍号解析
 * - 装饰音 (~trill, .staccato, Hfermata等)
 * - 连音线和连句线 (slurs和ties)
 * - 反复记号 (:|, |:, [1, [2等)
 * - 和弦处理
 */

// ABC音符到MIDI音符映射
const NOTE_MAP = {
  C: 0,
  D: 2,
  E: 4,
  F: 5,
  G: 7,
  A: 9,
  B: 11,
}

// 用于解析ABC文件的正则表达式
const HEADER_REGEX = /^([A-Z]):(.+)$/
const BAR_LINE_REGEX = /\|/g
const REPEAT_START_REGEX = /\|\:/g
const REPEAT_END_REGEX = /\:\|/g
const REPEAT_SECTION_REGEX = /\[(\d+)/g
const CHORD_REGEX = /\[([^\]]+)\]/g
const TUPLET_REGEX = /\((\d+)(?::(\d+))?(?::(\d+))?/
const DECORATION_REGEX = /(!.+?!|[.~HLMOPSTuv])/g

export class ABCParser {
  constructor() {
    this.reset()
  }

  /**
   * 重置解析器状态
   */
  reset() {
    this.metadata = {
      title: "",
      composer: "",
      meter: "4/4",
      tempo: 120,
      key: "C",
      unitNoteLength: "1/8",
    }

    this.tracks = []
    this.currentTrack = null
    this.currentOctave = 4 // 默认中音八度
    this.defaultNoteLength = 1 / 8 // 默认音符时值
    this.tempoMultiplier = 1
    this.inSlur = false
    this.repeatStack = []
    this.currentRepeatSection = null
    this.repeatSections = {}
  }

  /**
   * 解析ABC文件内容
   * @param {string} abcContent - ABC文件内容字符串
   * @returns {Object} 可用于@tone/midi导出的数据对象
   */
  parse(abcContent) {
    this.reset()
    const lines = abcContent.split("\n")

    // 创建默认轨道
    this.currentTrack = {
      name: "Default Track",
      notes: [],
    }
    this.tracks.push(this.currentTrack)

    let inHeader = true
    let musicContent = ""

    // 第一遍处理：提取头部信息和音乐内容
    for (let line of lines) {
      line = line.trim()
      if (!line) continue

      const headerMatch = line.match(HEADER_REGEX)
      if (headerMatch) {
        this._processHeaderLine(headerMatch[1], headerMatch[2])
      } else {
        inHeader = false
        musicContent += line + " "
      }
    }

    // 处理头部信息后设置默认音符长度
    this._setupUnitNoteLength()

    // 第二遍处理：解析音乐内容
    this._parseMusicContent(musicContent)

    // 返回结果
    return this._generateOutput()
  }

  /**
   * 处理头部信息行
   * @param {string} field - 字段类型 (T, C, M, L, Q, K)
   * @param {string} value - 字段值
   */
  _processHeaderLine(field, value) {
    value = value.trim()
    switch (field) {
      case "T": // 标题
        this.metadata.title = value
        break
      case "C": // 作曲者
        this.metadata.composer = value
        break
      case "M": // 拍号
        this.metadata.meter = value
        break
      case "L": // 单位音符长度
        this.metadata.unitNoteLength = value
        break
      case "Q": // 速度
        this._parseTempo(value)
        break
      case "K": // 调号
        this.metadata.key = value
        break
      case "V": // 声部
        this._processVoice(value)
        break
    }
  }

  /**
   * 解析速度标记
   * @param {string} tempoStr - 速度标记字符串
   */
  _parseTempo(tempoStr) {
    // 支持如 "Q:1/4=120" 的格式
    const tempoMatch = tempoStr.match(/(\d+\/\d+)=(\d+)/)
    if (tempoMatch) {
      const [_, noteValue, bpm] = tempoMatch
      // 计算实际速度
      this.metadata.tempo = parseInt(bpm)

      // 根据音符类型调整速度
      const [numerator, denominator] = noteValue.split("/").map(Number)
      this.tempoMultiplier = numerator / denominator / 0.25 // 相对于四分音符
    } else {
      // 简单的BPM值
      const bpm = parseInt(tempoStr)
      if (!isNaN(bpm)) {
        this.metadata.tempo = bpm
      }
    }
  }

  /**
   * 处理声部信息
   * @param {string} voiceInfo - 声部信息字符串
   */
  _processVoice(voiceInfo) {
    // 提取声部名称
    const nameMatch = voiceInfo.match(/^(\w+)/)
    const trackName = nameMatch
      ? nameMatch[1]
      : `Voice ${this.tracks.length + 1}`

    // 创建新轨道
    this.currentTrack = {
      name: trackName,
      notes: [],
    }
    this.tracks.push(this.currentTrack)
  }

  /**
   * 根据设置的单位音符长度更新默认音符长度
   */
  _setupUnitNoteLength() {
    const unitLength = this.metadata.unitNoteLength
    if (unitLength) {
      const [numerator, denominator] = unitLength.split("/").map(Number)
      this.defaultNoteLength = numerator / denominator
    }
  }

  /**
   * 解析音乐内容
   * @param {string} content - 纯音乐内容字符串
   */
  _parseMusicContent(content) {
    // 处理小节线和反复记号
    content = this._preProcessRepeats(content)

    // 解析音符序列
    let index = 0
    while (index < content.length) {
      const char = content[index]

      // 跳过空格
      if (char === " " || char === "\t" || char === "\r" || char === "\n") {
        index++
        continue
      }

      // 处理小节线
      if (char === "|") {
        if (content[index + 1] === ":") {
          // 反复开始
          this._handleRepeatStart()
          index += 2
        } else {
          // 普通小节线
          index++
        }
        continue
      }

      // 处理反复结束
      if (char === ":" && content[index + 1] === "|") {
        this._handleRepeatEnd()
        index += 2
        continue
      }

      // 处理反复节段标记
      if (char === "[" && /\d/.test(content[index + 1])) {
        const match = content.substring(index).match(/\[(\d+)/)
        if (match) {
          this._handleRepeatSection(parseInt(match[1]))
          index += match[0].length
          continue
        }
      }

      // 处理装饰音
      if (char === "!" || ".~HLMOPSTuv".includes(char)) {
        const decorations = this._extractDecorations(content.substring(index))
        index += decorations.length
        continue
      }

      // 处理连音组
      if (char === "(" && /\d/.test(content[index + 1])) {
        const tupletInfo = this._extractTuplet(content.substring(index))
        if (tupletInfo) {
          this._handleTuplet(tupletInfo)
          index += tupletInfo.matchLength
          continue
        }
      }

      // 处理和弦
      if (char === "[" && !/\d/.test(content[index + 1])) {
        const chordResult = this._extractChord(content.substring(index))
        if (chordResult) {
          this._addChord(chordResult.notes, chordResult.duration)
          index += chordResult.matchLength
          continue
        }
      }

      // 处理音符或休止符
      if (/[A-Ga-gz]/.test(char)) {
        const noteResult = this._extractNote(content.substring(index))
        if (noteResult) {
          this._addNote(
            noteResult.note,
            noteResult.duration,
            noteResult.options,
          )
          index += noteResult.matchLength
          continue
        }
      }

      // 处理连音线和连句线
      if (char === "-" || char === "(") {
        this._handleSlur(char === "(")
        index++
        continue
      }

      if (char === ")") {
        this._endSlur()
        index++
        continue
      }

      // 处理其他情况，如注释等
      index++
    }
  }

  /**
   * 预处理反复记号，规范化表示
   * @param {string} content - 原始内容
   * @returns {string} 处理后的内容
   */
  _preProcessRepeats(content) {
    // 统一处理反复标记，确保格式一致
    return content
      .replace(/\|\|/g, "|") // 双竖线转为单竖线
      .replace(/\|\:/g, "|:") // 规范化反复开始
      .replace(/\:\|/g, ":|") // 规范化反复结束
  }

  /**
   * 提取装饰音标记
   * @param {string} substring - 当前位置开始的子字符串
   * @returns {string} 装饰音标记
   */
  _extractDecorations(substring) {
    let result = ""
    const match = substring.match(DECORATION_REGEX)
    if (match) {
      result = match[0]
      // 存储装饰音信息以应用于下一个音符
      this.pendingDecorations = match[0]
    }
    return result
  }

  /**
   * 提取连音组信息
   * @param {string} substring - 当前位置开始的子字符串
   * @returns {Object|null} 连音组信息或null
   */
  _extractTuplet(substring) {
    const match = substring.match(TUPLET_REGEX)
    if (!match) return null

    const n = parseInt(match[1]) // 连音数量
    const q = match[2] ? parseInt(match[2]) : n // 实际音符数量
    const r = match[3] ? parseInt(match[3]) : 2 // 原始时值比例

    return {
      n,
      q,
      r,
      matchLength: match[0].length,
    }
  }

  /**
   * 处理连音组
   * @param {Object} tupletInfo - 连音组信息
   */
  _handleTuplet(tupletInfo) {
    // 设置当前连音组状态
    this.currentTuplet = {
      ratio: tupletInfo.q / tupletInfo.r, // 时值调整比例
      count: tupletInfo.n, // 剩余音符数量
    }
  }

  /**
   * 提取和弦信息
   * @param {string} substring - 当前位置开始的子字符串
   * @returns {Object|null} 和弦信息或null
   */
  _extractChord(substring) {
    let level = 0
    let endIndex = -1

    // 查找匹配的右括号
    for (let i = 0; i < substring.length; i++) {
      if (substring[i] === "[") level++
      else if (substring[i] === "]") {
        level--
        if (level === 0) {
          endIndex = i
          break
        }
      }
    }

    if (endIndex === -1) return null

    const chordContent = substring.substring(1, endIndex)
    const notesInChord = chordContent.split(/(?=[A-Ga-g])/)

    // 提取可能的和弦时值
    let durationMatch = substring
      .substring(endIndex + 1)
      .match(/^(\d+\/?|\/\d+|[><]+)/)
    let duration = this.defaultNoteLength
    let durationLength = 0

    if (durationMatch) {
      duration = this._parseDuration(durationMatch[0])
      durationLength = durationMatch[0].length
    }

    // 解析和弦中的每个音符
    const notes = notesInChord
      .map((noteStr) => {
        const noteResult = this._extractNote(noteStr, false)
        return noteResult ? noteResult.note : null
      })
      .filter((note) => note !== null)

    return {
      notes,
      duration,
      matchLength: endIndex + 1 + durationLength,
    }
  }

  /**
   * 提取单个音符或休止符信息
   * @param {string} substring - 当前位置开始的子字符串
   * @param {boolean} [includeOptions=true] - 是否包含音符选项
   * @returns {Object|null} 音符信息或null
   */
  _extractNote(substring, includeOptions = true) {
    // 音符或休止符的正则表达式匹配
    const noteMatch = substring.match(/^([A-Ga-g][,']*|z)(\d+\/?|\/\d+|[><]+)?/)
    if (!noteMatch) return null

    const [fullMatch, noteStr, durationStr] = noteMatch
    let matchLength = fullMatch.length
    let options = {}

    // 设置基本音符信息
    let note = null
    if (noteStr === "z") {
      note = { type: "rest" }
    } else {
      note = this._parseNote(noteStr)
    }

    // 解析时值
    let duration = this.defaultNoteLength
    if (durationStr) {
      duration = this._parseDuration(durationStr)
    }

    // 应用连音组调整
    if (this.currentTuplet && this.currentTuplet.count > 0) {
      duration *= this.currentTuplet.ratio
      this.currentTuplet.count--
      options.isTuplet = true

      // 如果连音组结束，重置状态
      if (this.currentTuplet.count === 0) {
        this.currentTuplet = null
      }
    }

    // 检查后续的修饰符
    if (includeOptions) {
      // 检查是否有连音线
      if (substring[matchLength] === "-") {
        options.hasTie = true
        matchLength++
      }

      // 应用之前解析的装饰音
      if (this.pendingDecorations) {
        options.decorations = this.pendingDecorations
        this.pendingDecorations = null
      }
    }

    return {
      note,
      duration,
      options,
      matchLength,
    }
  }

  /**
   * 解析音符字符串
   * @param {string} noteStr - 音符字符串 (如 "C" 或 "c'")
   * @returns {Object} 音符对象
   */
  _parseNote(noteStr) {
    const noteName = noteStr[0].toUpperCase()
    const octaveAdjustment = noteStr
      .substring(1)
      .split("")
      .reduce((acc, char) => {
        return acc + (char === "'" ? 1 : char === "," ? -1 : 0)
      }, 0)

    // 计算MIDI音高
    let baseOctave = noteStr[0] === noteStr[0].toLowerCase() ? 5 : 4
    let octave = baseOctave + octaveAdjustment

    // 基本音符MIDI数值
    let midiNote = NOTE_MAP[noteName] + octave * 12

    return {
      type: "note",
      name: noteName,
      octave,
      midiNote,
    }
  }

  /**
   * 解析时值字符串
   * @param {string} durationStr - 时值字符串 (如 "2", "/2", "3/2")
   * @returns {number} 时值 (以四分音符为1单位)
   */
  _parseDuration(durationStr) {
    if (!durationStr) return this.defaultNoteLength

    // 处理倍增或减半标记 (> 和 <)
    if (durationStr.includes(">") || durationStr.includes("<")) {
      let duration = this.defaultNoteLength
      for (const char of durationStr) {
        if (char === ">") duration *= 2
        else if (char === "<") duration /= 2
      }
      return duration
    }

    // 处理普通分数表示
    if (durationStr.includes("/")) {
      const parts = durationStr.split("/")
      if (parts[0] === "") parts[0] = "1"

      if (parts.length === 2) {
        return parseInt(parts[0]) / parseInt(parts[1])
      } else {
        // 处理单独的"/"表示法，等同于1/2
        return 1 / parseInt(parts[1] || "2")
      }
    }

    // 处理普通整数表示
    return parseInt(durationStr)
  }

  /**
   * 处理连音线或连句线开始
   * @param {boolean} isSlur - 是否为连句线
   */
  _handleSlur(isSlur) {
    if (isSlur) {
      this.inSlur = true
    } else {
      // 连音线处理，标记最后一个音符
      if (this.currentTrack.notes.length > 0) {
        const lastNote =
          this.currentTrack.notes[this.currentTrack.notes.length - 1]
        lastNote.tie = "start"
      }
    }
  }

  /**
   * 处理连句线结束
   */
  _endSlur() {
    this.inSlur = false
  }

  /**
   * 处理反复开始
   */
  _handleRepeatStart() {
    // 记录反复开始位置
    this.repeatStack.push({
      startIndex: this.currentTrack.notes.length,
      sections: {},
    })
  }

  /**
   * 处理反复结束
   */
  _handleRepeatEnd() {
    if (this.repeatStack.length === 0) return

    // 获取最近的反复段
    const currentRepeat = this.repeatStack.pop()
    const startIndex = currentRepeat.startIndex
    const endIndex = this.currentTrack.notes.length

    // 存储反复段以供处理
    this.repeatSections[`${startIndex}-${endIndex}`] = {
      notes: this.currentTrack.notes.slice(startIndex, endIndex),
      alternate: currentRepeat.sections,
    }
  }

  /**
   * 处理反复节段
   * @param {number} number - 节段编号
   */
  _handleRepeatSection(number) {
    if (this.repeatStack.length === 0) return

    // 标记当前是特定的反复节段
    this.currentRepeatSection = number

    // 在当前反复栈中记录该节段的开始位置
    const currentRepeat = this.repeatStack[this.repeatStack.length - 1]
    currentRepeat.sections[number] = this.currentTrack.notes.length
  }

  /**
   * 添加音符到当前轨道
   * @param {Object} note - 音符对象
   * @param {number} duration - 时值
   * @param {Object} options - 音符选项
   */
  _addNote(note, duration, options = {}) {
    const { hasTie, decorations, isTuplet } = options

    if (note.type === "rest") {
      // 添加休止符
      this.currentTrack.notes.push({
        type: "rest",
        duration: duration * 4, // 转换为四分音符为单位
      })
    } else {
      // 创建MIDI音符对象
      const midiNote = {
        name: note.name,
        midi: note.midiNote,
        time: 0, // 时间位置将在生成输出时计算
        duration: duration * 4, // 转换为四分音符为单位
        velocity: 0.7, // 默认力度
      }

      // 应用装饰音
      if (decorations) {
        this._applyDecorations(midiNote, decorations)
      }

      // 设置连音线
      if (hasTie) {
        midiNote.tie = "start"

        // 查找并更新之前的连音线结束
        const lastNoteIndex = this._findLastNoteWithSamePitch(note.midiNote)
        if (
          lastNoteIndex >= 0 &&
          this.currentTrack.notes[lastNoteIndex].tie === "start"
        ) {
          this.currentTrack.notes[lastNoteIndex].tie = "both"
        }
      }

      // 设置连句线
      if (this.inSlur) {
        midiNote.slur = true
      }

      // 保存音符
      this.currentTrack.notes.push(midiNote)
    }
  }

  /**
   * 添加和弦到当前轨道
   * @param {Array} notes - 和弦中的音符数组
   * @param {number} duration - 时值
   */
  _addChord(notes, duration) {
    if (notes.length === 0) return

    // 处理和弦中的所有音符
    const chordNotes = notes.map((note) => ({
      name: note.name,
      midi: note.midiNote,
      time: 0, // 时间位置将在生成输出时计算
      duration: duration * 4, // 转换为四分音符为单位
      velocity: 0.7, // 默认力度
    }))

    // 标记为和弦
    chordNotes.forEach((note, i) => {
      if (i > 0) note.chord = true
    })

    // 添加和弦音符
    this.currentTrack.notes.push(...chordNotes)
  }

  /**
   * 查找最后一个具有相同音高的音符索引
   * @param {number} midiNote - MIDI音符数字
   * @returns {number} 音符索引或-1
   */
  _findLastNoteWithSamePitch(midiNote) {
    for (let i = this.currentTrack.notes.length - 1; i >= 0; i--) {
      const note = this.currentTrack.notes[i]
      if (note.midi === midiNote) {
        return i
      }
    }
    return -1
  }

  /**
   * 应用装饰音到音符
   * @param {Object} note - 音符对象
   * @param {string} decorations - 装饰音字符串
   */
  _applyDecorations(note, decorations) {
    // 处理不同类型的装饰音
    if (decorations.includes("~")) {
      note.tremolo = true
    }
    if (decorations.includes(".")) {
      note.staccato = true
      note.duration *= 0.5 // 断音音符时值减半
    }
    if (decorations.includes("H")) {
      note.fermata = true
      note.duration *= 1.5 // 延长音符时值
    }
    if (decorations.includes("!trill!")) {
      note.trill = true
    }
    if (decorations.includes("!accent!") || decorations.includes(">")) {
      note.accent = true
      note.velocity = 0.9 // 增加重音力度
    }

    // 可以根据需要添加更多装饰音处理
  }

  /**
   * 生成最终输出
   * @returns {Object} @tone/midi兼容的数据对象
   */
  _generateOutput() {
    const output = {
      header: {
        name: this.metadata.title,
        tempos: [
          {
            bpm: this.metadata.tempo,
            time: 0,
          },
        ],
        timeSignatures: [
          {
            timeSignature: this._parseTimeSignature(this.metadata.meter),
            time: 0,
          },
        ],
        keySignatures: [
          {
            key: this._parseKeySignature(this.metadata.key),
            scale: this._parseKeyScale(this.metadata.key),
            time: 0,
          },
        ],
      },
      tracks: [],
    }

    // 处理每个轨道
    for (const track of this.tracks) {
      if (track.notes.length === 0) continue

      const processedTrack = {
        name: track.name,
        notes: this._processNotesTimings(track.notes),
      }

      output.tracks.push(processedTrack)
    }

    return output
  }

  /**
   * 处理音符的时间定位
   * @param {Array} notes - 原始音符数组
   * @returns {Array} 处理后的音符数组
   */
  _processNotesTimings(notes) {
    const processedNotes = []
    let currentTime = 0

    for (let i = 0; i < notes.length; i++) {
      const note = { ...notes[i] }

      // 如果不是和弦的一部分，更新当前时间
      if (!note.chord) {
        note.time = currentTime
        // 只有非休止符且没有被连音线连接的音符才推进时间
        if (note.type !== "rest" && (!note.tie || note.tie === "start")) {
          currentTime += note.duration
        }
      } else {
        // 和弦音符与前一个音符时间相同
        note.time = processedNotes[processedNotes.length - 1].time
      }

      // 处理连音线
      if (note.tie) {
        // 寻找被连接的下一个同音高音符
        let tiedNoteIndex = -1
        for (let j = i + 1; j < notes.length; j++) {
          if (!notes[j].chord && notes[j].midi === note.midi) {
            tiedNoteIndex = j
            break
          }
        }

        // 如果找到被连接的音符，调整当前音符时值
        if (tiedNoteIndex >= 0) {
          const tiedNote = notes[tiedNoteIndex]
          note.duration += tiedNote.duration

          // 标记被连接的音符为已处理
          notes[tiedNoteIndex].processed = true
        }
      }

      // 仅添加未被处理的音符
      if (!note.processed) {
        processedNotes.push(note)
      }
    }

    return processedNotes
  }

  /**
   * 解析拍号字符串
   * @param {string} meterStr - 拍号字符串 (如 "4/4")
   * @returns {Array} 拍号数组 [分子, 分母]
   */
  _parseTimeSignature(meterStr) {
    if (meterStr === "C") return [4, 4]
    if (meterStr === "C|") return [2, 2]

    const parts = meterStr.split("/")
    if (parts.length !== 2) return [4, 4] // 默认4/4拍

    return [parseInt(parts[0]), parseInt(parts[1])]
  }

  /**
   * 解析调号字符串的调名部分
   * @param {string} keyStr - 调号字符串 (如 "C" 或 "Dm")
   * @returns {string} 调名
   */
  _parseKeySignature(keyStr) {
    // 提取基本调名 (不包括大小调标识)
    const match = keyStr.match(/^([A-G][b#]?)/)
    if (!match) return "C" // 默认为C调

    return match[1]
  }

  /**
   * 解析调号字符串的调式部分
   * @param {string} keyStr - 调号字符串 (如 "C" 或 "Dm")
   * @returns {string} "major" 或 "minor"
   */
  _parseKeyScale(keyStr) {
    // 检查是否标记为小调
    if (keyStr.match(/m$/) || keyStr.toLowerCase().includes("minor")) {
      return "minor"
    }
    return "major" // 默认为大调
  }
}

/**
 * 将ABC记谱法转换为@tone/midi兼容的数据格式
 * @param {string} abcContent - ABC文件内容
 * @returns {Object} @tone/midi兼容的数据对象
 */
export function parseABC(abcContent) {
  const parser = new ABCParser()
  return parser.parse(abcContent)
}

/**
 * ABC记谱法特殊符号转换工具
 * 用于处理装饰音、特殊记号等
 */
export class ABCSymbolConverter {
  constructor() {
    this.decorationMap = {
      ".": "staccato",
      "~": "trill",
      H: "fermata",
      L: "accent",
      M: "emphasis",
      O: "coda",
      P: "pralltriller",
      S: "segno",
      T: "trill",
      u: "upbow",
      v: "downbow",
      "!trill!": "trill",
      "!mordent!": "mordent",
      "!turn!": "turn",
      "!fermata!": "fermata",
      "!accent!": "accent",
      "!emphasis!": "emphasis",
      "!coda!": "coda",
      "!segno!": "segno",
    }
  }

  /**
   * 获取装饰音的@tone/midi表示
   * @param {string} symbol - ABC装饰音符号
   * @returns {string|null} @tone/midi装饰音名称或null
   */
  getDecoration(symbol) {
    return this.decorationMap[symbol] || null
  }
}

/**
 * 工具函数：将ABC音符名称转换为MIDI音符数字
 * @param {string} noteName - ABC音符名称 (如 "C" 或 "c'")
 * @returns {number} MIDI音符数字
 */
export function abcNoteToMidi(noteName) {
  const NOTE_MAP = {
    C: 0,
    D: 2,
    E: 4,
    F: 5,
    G: 7,
    A: 9,
    B: 11,
  }

  if (!noteName || noteName === "z") return -1 // 休止符

  // 提取音符名称和八度标记
  const baseName = noteName[0].toUpperCase()
  const isLower = noteName[0] === noteName[0].toLowerCase()
  const octaveMarks = noteName.substring(1)

  // 计算八度偏移
  let octaveOffset = 0
  for (const mark of octaveMarks) {
    if (mark === "'") octaveOffset++
    else if (mark === ",") octaveOffset--
  }

  // 计算MIDI音符
  let baseOctave = isLower ? 5 : 4
  let octave = baseOctave + octaveOffset

  // 返回MIDI音符号
  return NOTE_MAP[baseName] + octave * 12
}

/**
 * 工具函数：将MIDI音符数字转换为ABC音符名称
 * @param {number} midiNote - MIDI音符数字
 * @returns {string} ABC音符名称
 */
export function midiToAbcNote(midiNote) {
  const NOTE_NAMES = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ]
  const octave = Math.floor(midiNote / 12) - 1
  const noteIndex = midiNote % 12
  const noteName = NOTE_NAMES[noteIndex]

  // 根据八度确定大小写和八度标记
  if (octave <= 3) {
    // 低音区（大写加逗号）
    let commas = ""
    for (let i = 0; i < 4 - octave; i++) {
      commas += ","
    }
    return noteName + commas
  } else if (octave === 4) {
    // 中央八度（大写）
    return noteName
  } else {
    // 高音区（小写加引号）
    let note = noteName.toLowerCase()
    if (octave > 5) {
      let quotes = ""
      for (let i = 0; i < octave - 5; i++) {
        quotes += "'"
      }
      return note + quotes
    }
    return note
  }
}

/**
 * 辅助功能：示例ABC文件转换为MIDI
 */
export function convertSampleABC() {
  const sampleABC = `
X:1
T:Example Tune
C:Traditional
M:4/4
L:1/8
K:G
|: GABc dedB | dedB dedB | c2ec B2dB | A2A2 A2BA |
| GABc dedB | dedB dedB | c2ec B2dB | A2G2 G4 :|
|: g2fg edcB | c2ec B2dB | A2AB c2cB | A2G2 G4 :|
  `

  return parseABC(sampleABC)
}

/**
 * ABC记谱法完整工具类
 * 包含解析、转换和生成功能
 */
export class ABCTool {
  constructor() {
    this.parser = new ABCParser()
    this.symbolConverter = new ABCSymbolConverter()
  }

  /**
   * 解析ABC文件内容
   * @param {string} abcContent - ABC文件内容
   * @returns {Object} @tone/midi兼容的数据对象
   */
  parse(abcContent) {
    return this.parser.parse(abcContent)
  }

  /**
   * 从文件加载ABC内容
   * @param {File|string} fileOrPath - 文件对象或本地文件路径（或URL字符串）
   * @returns {Promise<Object>} 解析后的@tone/midi兼容数据
   */
  async loadFromFile(fileOrPath) {
    let content

    if (typeof fileOrPath === "string") {
      if (/^https?:\/\//.test(fileOrPath)) {
        // 🌐 URL 网络请求
        const response = await fetch(fileOrPath)
        content = await response.text()
      } else if (isNode) {
        // 📁 Node.js 本地文件系统路径
        content = await fs.readFile(fileOrPath, "utf-8")
      } else {
        throw new Error("在浏览器中不支持直接使用本地路径")
      }
    } else if (typeof File !== "undefined" && fileOrPath instanceof File) {
      // 🗃️ 浏览器中的 File 对象
      content = await new Promise((resolve) => {
        const reader = new FileReader()
        reader.onload = (e) => resolve(e.target.result)
        reader.readAsText(fileOrPath)
      })
    } else {
      throw new Error("Invalid input: expected File object or string path/URL")
    }

    return this.parse(content)
  }

  /**
   * 检测ABC文件中的高级特性
   * @param {string} abcContent - ABC文件内容
   * @returns {Object} 检测到的高级特性
   */
  detectFeatures(abcContent) {
    const features = {
      hasChords: false,
      hasDecorations: false,
      hasTuplets: false,
      hasRepeats: false,
      hasSlurs: false,
      hasMultipleVoices: false,
    }

    // 检测和弦
    features.hasChords = /\[[A-Ga-g][,']*[A-Ga-g][,']*.*\]/.test(abcContent)

    // 检测装饰音
    features.hasDecorations =
      /[.~HLMOPST]/.test(abcContent) || /!.*!/.test(abcContent)

    // 检测连音组
    features.hasTuplets = /\(\d/.test(abcContent)

    // 检测反复记号
    features.hasRepeats = /\|:|\:||\[\d/.test(abcContent)

    // 检测连音线和连句线
    features.hasSlurs = /-|\(.*\)/.test(abcContent)

    // 检测多声部
    features.hasMultipleVoices = /V:\s*\w+/.test(abcContent)

    return features
  }
}

// 导出所有工具
// export {
//   ABCParser,
//   ABCSymbolConverter,
//   ABCTool,
//   parseABC,
//   abcNoteToMidi,
//   midiToAbcNote,
//   convertSampleABC
// };
