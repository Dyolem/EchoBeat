import { defineStore } from "pinia"
import { computed, ref } from "vue"
import {
  BLACK_KEY_HEIGHT,
  CHROMATIC_SCALE_ENUM,
  CHROMATIC_SCALE_SERIAL_NUMBER,
  OCTAVE_KEY_COUNT,
  OCTAVE_WHITE_KEY_COUNT,
  WHITE_KEY_HEIGHT,
  WHITE_KEY_WIDTH,
} from "@/constants/daw/index.js"

export const usePianoKeySizeStore = defineStore("pianoKeySize", () => {
  const OCTAVE_COUNT = CHROMATIC_SCALE_ENUM.length
  const pianoKeySize = ref({
    blackKeyHeight: BLACK_KEY_HEIGHT,
    whiteKeyHeight: WHITE_KEY_HEIGHT,
    whiteKeyWidth: WHITE_KEY_WIDTH,
  })
  const chromaticInfo = ref({
    octaveCount: OCTAVE_COUNT,
    chromaticScale: CHROMATIC_SCALE_ENUM,
  })
  const whiteKeyHeight = computed(() => {
    return pianoKeySize.value.whiteKeyHeight
  })
  const noteTrackHeight = computed(() => {
    return (
      (whiteKeyHeight.value *
        chromaticInfo.value.octaveCount *
        OCTAVE_WHITE_KEY_COUNT) /
      (OCTAVE_KEY_COUNT * chromaticInfo.value.octaveCount)
    )
  })
  const octaveItemHeight = computed(() => {
    return noteTrackHeight.value * OCTAVE_KEY_COUNT
  })
  const totalPianoKeysHeight = computed(() => {
    return octaveItemHeight * CHROMATIC_SCALE_SERIAL_NUMBER.length
  })

  return {
    pianoKeySize,
    chromaticInfo,
    whiteKeyHeight,
    noteTrackHeight,
    octaveItemHeight,
    totalPianoKeysHeight,
  }
})
