<script setup>
import { computed, inject, watchEffect } from "vue"

const OCTAVE_KEY_COUNT = 12
const OCTAVE_WHITE_KEY_COUNT = 7
const OCTAVE_BLACK_KEY_COUNT = 5
const props = defineProps({
  notePadWidth: {
    type: Number,
    required: true,
  },
  notePadHeight: {
    type: Number,
    required: true,
  },
  octaveCount: {
    type: Number,
    default: 7,
  },
})

const pianoKeySize = inject("pianoKeySize")
const whiteKeyHeight = computed(() => {
  return pianoKeySize.value.whiteKeyHeight
})
const noteTrackHeight = computed(() => {
  return (
    (whiteKeyHeight.value * props.octaveCount * OCTAVE_WHITE_KEY_COUNT) /
    (OCTAVE_KEY_COUNT * props.octaveCount)
  )
})
const octaveItemHeight = computed(() => {
  return noteTrackHeight.value * OCTAVE_KEY_COUNT
})
const svgHeight = computed(() => {
  return octaveItemHeight.value * props.octaveCount
})

const rectInfo = computed(() => {
  const rectInfoArr = []
  let fillColor = ""
  for (let i = 0; i < OCTAVE_KEY_COUNT; i++) {
    let y = i * noteTrackHeight.value
    if (i < 7) {
      fillColor = i % 2 === 0 ? "gray" : "black"
    } else if (i >= 6 && i < 11) {
      fillColor = (i + 1) % 2 === 0 ? "gray" : "black"
    } else {
      fillColor = "orange"
    }

    rectInfoArr.push({
      id: i,
      height: noteTrackHeight.value,
      y: y,
      fill: fillColor,
    })
  }

  return rectInfoArr
})
const { updateCanvasContentHeight } = inject("canvasContentHeight")
watchEffect(() => {
  updateCanvasContentHeight(svgHeight.value)
})
</script>

<template>
  <svg :width="notePadWidth" :height="svgHeight">
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

<style scoped></style>
