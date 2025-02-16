<script setup>
import { computed } from "vue"

const OCTAVE_KEY_COUNT = 12
const WHITE_KEY_SVG_RECT_FILL_COLOR = "rgba(162,175,185,0.7)"
const BLACK_KEY_SVG_RECT_FILL_COLOR = "rgba(0,0,0,0.6)"
const C_WHITE_KEY_FILL_COLOR = "rgba(255, 255, 255, 0.7)"
const props = defineProps({
  notePadWidth: {
    type: Number,
    required: true,
  },
  notePadHeight: {
    type: Number,
    required: true,
  },
  noteTrackHeight: {
    type: Number,
    required: true,
  },
  svgHeight: {
    type: Number,
    required: true,
  },
  octaveCount: {
    type: Number,
    default: 7,
  },
})
const octaveItemHeight = computed(() => {
  return props.noteTrackHeight * OCTAVE_KEY_COUNT
})
const rectInfo = computed(() => {
  const rectInfoArr = []
  let fillColor = ""
  for (let i = 0; i < OCTAVE_KEY_COUNT; i++) {
    let y = i * props.noteTrackHeight
    let j = -1
    if (i < 7) {
      j = i
    } else if (i >= 6 && i < 11) {
      j = i + 1
    }
    if (j >= 0) {
      fillColor =
        j % 2 === 0
          ? WHITE_KEY_SVG_RECT_FILL_COLOR
          : BLACK_KEY_SVG_RECT_FILL_COLOR
    } else {
      fillColor = C_WHITE_KEY_FILL_COLOR
    }
    if (fillColor)
      rectInfoArr.push({
        id: i,
        height: props.noteTrackHeight,
        y: y,
        fill: fillColor,
      })
  }
  return rectInfoArr
})
</script>

<template>
  <svg :width="notePadWidth" :height="svgHeight" class="midi-grid-svg">
    <defs>
      <pattern
        id="note-grid-pad"
        width="1"
        :height="octaveItemHeight"
        patternUnits="userSpaceOnUse"
      >
        <rect
          width="100%"
          v-for="item in rectInfo"
          :height="item.height"
          :y="item.y"
          :fill="item.fill"
          :key="item.id"
        ></rect>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#note-grid-pad)" />
  </svg>
</template>

<style scoped>
.midi-grid-svg {
  position: absolute;
  z-index: -1;
}
</style>
