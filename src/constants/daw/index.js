import { generateUniqueId } from "@/utils/generateUniqueId.js"
export const INIT_HEADER_HEIGHT = 100
export const INIT_FOOTER_HEIGHT = 50

export const EDITOR_TYPE_ENUM = {
  MAIN_EDITOR: "mainEditor",
  SUBORDINATE_EDITOR: "subordinateEditor",
}
export const ID_PREFIX_ENUM = {
  AUDIO_TRACK: "audio_track",
  SUB_TRACK_ITEM: "sub_track_item",
  WORKSPACE: "workspace",
}
export const ID_SET = {
  AUDIO_TRACK: (prefix = ID_PREFIX_ENUM.AUDIO_TRACK) =>
    generateUniqueId(prefix),
  SUB_TRACK_ITEM: (prefix = ID_PREFIX_ENUM.SUB_TRACK_ITEM) =>
    generateUniqueId(prefix),
  WORKSPACE: (prefix = ID_PREFIX_ENUM.WORKSPACE) => generateUniqueId(prefix),
}
export const MAIN_EDITOR_ID = generateUniqueId(EDITOR_TYPE_ENUM.MAIN_EDITOR)
export const SUBORDINATE_EDITOR_ID = generateUniqueId(
  EDITOR_TYPE_ENUM.SUBORDINATE_EDITOR,
)
export const EDITOR_TYPE_ID_MAP = {
  [EDITOR_TYPE_ENUM.MAIN_EDITOR]: MAIN_EDITOR_ID,
  [EDITOR_TYPE_ENUM.SUBORDINATE_EDITOR]: SUBORDINATE_EDITOR_ID,
}
export const ALIGN_TYPE = ["ceil", "floor", "round"]
export const ALIGN_TYPE_ENUM = {
  LEFT_JUSTIFYING: "floor",
  RIGHT_JUSTIFYING: "ceil",
  TOP_JUSTIFYING: "floor",
  BOTTOM_JUSTIFYING: "ceil",
  TOP_LEFT_JUSTIFYING: "floor",
  BOTTOM_RIGHT_JUSTIFYING: "ceil",
}

export const DEFAULT_INIT_VELOCITY = 100
export const EDITOR_MODE_ENUM = {
  SELECT: "select",
  INSERT: "insert",
  VELOCITY: "velocity",
}
export const TENSILE_ADSORPTION_GRID_THRESHOLD = 3

export const NOTE_ELEMENT_SIZE = {
  baseWidth: 20,
  baseHeight: 9.3,
}

export const ZIndex = {
  TRACK_RULER: 100,
  EDITOR_CONTENT: 10,
  EDITOR_BG_SVG: 1,
  INTERACTABLE_LAYER: 10,
  NOTE_EDITOR_WORKSPACE_CONTAINER_PLACEHOLDER: 20,
  EDITOR_NOTE: 30,
  CONTEXT_MENU: 100,
  PANEL: 110,
  MODAL: 210,
  TOAST: 220,
}

export const DEFAULT_ZOOM_RATIO = 1
export const ZOOM_THRESHOLD = 0.1
export const MAX_ZOOM = 6
export const MIN_ZOOM = 0.2
export const ZOOM_PARAMETERS = {
  zoomThreshold: ZOOM_THRESHOLD,
  zoomScale: [MIN_ZOOM, MAX_ZOOM],
}
export const NOTE_ELEMENT_MIN_SIZE = {
  minWidth: NOTE_ELEMENT_SIZE.baseWidth * MIN_ZOOM,
  minHeight: NOTE_ELEMENT_SIZE.baseHeight * MIN_ZOOM,
}
export const BEATS_COUNT = 95

export const BEAT_GRID_RATIO = 4

//核心常量
export const PPQ = 480 // 480 ticks/quarter note
export const SERIAL_NUMBER_FONT_SIZE = 12
export const PIXELS_PER_QUARTER = 40 //一个四分音符的在缩放倍率为1时的初始宽度像素
export const TICKS_PER_PIXEL = 12 //1px等于12个tick时间
export const BASE_PIXELS_PER_QUARTER = 40 // 1拍默认占120px（可调整缩放）
export const GRID_OPTIONS = {
  smart: "smart",
  bar: "bar",
  "1/2": "1 / 2",
  "1/4": "1 / 4",
  "1/8": "1 / 8",
  "1/16": "1 / 16",
  "1/32": "1 / 32",
  "1/2T": "1 / 2T",
  "1/4T": "1 / 4T",
  "1/8T": "1 / 8T",
  "1/16T": "1 / 16T",
  "1/32T": "1 / 32T",
}
export const BEATS_PER_MEASURE_ENUM = [1, 2, 3, 4, 5, 6]
export const NOTE_VALUE_DENOMINATOR_ENUM = [1, 2, 4, 8]
export const BASE_GRID_HEIGHT = 90
export const INIT_BPM = 120
export const MAX_BPM = 240
export const MIN_BPM = 50
export const BASE_GRID_WIDTH = 20
export const MIN_GRID_WIDTH = 15
export const MAX_GRID_WIDTH = 30
export const EDITABLE_TOTAL_TIME = 300
export const EDITABlE_TOTAL_BEATS = 600
export const INIT_BEATS_PER_MEASURE = 4
export const INIT_NOTE_VALUE_DENOMINATOR = 4

export const AUDIO_TRACK_ENUM = {
  VOICE: "voice",
  VIRTUAL_INSTRUMENTS: "virtual-instruments",
  DRUM_MACHINE: "drum-machine",
  SAMPLE: "sample",
  GUITAR: "guitar",
  BASS: "bass",
}

//midi虚拟琴键参数
export const BLACK_KEY_HEIGHT = 10
export const WHITE_KEY_HEIGHT = 16
export const WHITE_KEY_WIDTH = 60
export const OCTAVE_KEY_COUNT = 12
export const OCTAVE_WHITE_KEY_COUNT = 7
export const CHROMATIC_SCALE_SERIAL_NUMBER = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
]
export const CHROMATIC_PITCH_NAME_ENUM = ["C", "D", "E", "F", "G", "A", "B"]
export const NATURAL_SEMITONE = ["E", "B"]
export const CHROMATIC_SCALE_ENUM = [
  "C0",
  "C1",
  "C2",
  "C3",
  "C4",
  "C5",
  "C6",
  "C7",
  "C8",
]
// 音名的顺序表
export const NOTES_TABLE = [
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
export function midiToNoteName(midiNumber) {
  const noteNames = [
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
  const noteIndex = midiNumber % 12
  const octave = Math.floor(midiNumber / 12) - 1
  return noteNames[noteIndex] + octave.toString()
}

export function generateNoteFrequencyMap(notes = NOTES_TABLE) {
  // 创建音名与频率映射的 Map
  const noteFrequencyMap = new Map()

  // A4 的标准频率（440 Hz）
  const A4_FREQUENCY = 440

  // A4 在 MIDI 的位置
  const A4_POSITION = 69

  // 根据 MIDI 编码计算频率
  function calculateFrequency(midiNumber) {
    return Math.pow(2, (midiNumber - A4_POSITION) / 12) * A4_FREQUENCY
  }

  // 填充音名与频率的映射
  for (let octave = 0; octave <= 8; octave++) {
    for (let i = 0; i < notes.length; i++) {
      const noteName = `${notes[i]}${octave}`
      const midiNumber = octave * 12 + i
      if (midiNumber >= 0 && midiNumber <= 127) {
        const frequency = calculateFrequency(midiNumber)
        noteFrequencyMap.set(noteName, frequency.toFixed(2)) // 保留两位小数
      }
    }
  }
  return noteFrequencyMap
}
export const NOTE_FREQUENCY_MAP = generateNoteFrequencyMap()
export const SCROLLBAR_WIDTH = 10
export const FALLBACK_THEME_COLOR = "#A4CFF8"
export const DARKEN_COLOR = "#404040"
