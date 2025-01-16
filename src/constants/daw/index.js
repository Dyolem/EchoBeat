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
  EDITOR_CANVAS: 1,
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
export const MIN_ZOOM = 0.8
export const ZOOM_PARAMETERS = {
  zoomThreshold: ZOOM_THRESHOLD,
  zoomScale: [MIN_ZOOM, MAX_ZOOM],
}
export const NOTE_ELEMENT_MIN_SIZE = {
  minWidth: NOTE_ELEMENT_SIZE.baseWidth * MIN_ZOOM,
  minHeight: NOTE_ELEMENT_SIZE.baseHeight * MIN_ZOOM,
}
export const BEATS_COUNT = 95
export const BASE_GRID_WIDTH = 20
export const BEAT_GRID_RATIO = 4
export const MIN_GRID_WIDTH = BASE_GRID_WIDTH * MIN_ZOOM
export const BASE_GRID_HEIGHT = 90

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

  // 填充音名与频率的映射（从 A0 到 C8）
  for (let octave = 0; octave <= 8; octave++) {
    for (let i = 0; i < notes.length; i++) {
      const noteName = `${notes[i]}${octave}`
      const midiNumber = octave * 12 + i
      if (midiNumber >= 21 && midiNumber <= 108) {
        // 限制在钢琴音域范围内
        const frequency = calculateFrequency(midiNumber)
        noteFrequencyMap.set(noteName, frequency.toFixed(2)) // 保留两位小数
      }
    }
  }

  // 打印结果
  console.log(noteFrequencyMap)
  return noteFrequencyMap
}
export const NOTE_FREQUENCY_MAP = generateNoteFrequencyMap()
export const SCROLLBAR_WIDTH = 10
