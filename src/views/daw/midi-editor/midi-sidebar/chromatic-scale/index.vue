<script setup>
import Octave from "@/views/daw/midi-editor/midi-sidebar/chromatic-scale/octave/index.vue"
import { computed, inject, onMounted, useTemplateRef, watch } from "vue"
import { useAudioGeneratorStore } from "@/store/daw/audio/audioGenerator.js"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"

const audioGenerator = useAudioGeneratorStore()
const noteItemStore = useNoteItemStore()

const props = defineProps({
  chromaticScaleScrollTop: {
    type: Number,
  },
})
const emit = defineEmits(["update:chromaticScaleScrollTop"])
const octaveContainerRef = useTemplateRef("octaveContainerRef")
watch(
  () => props.chromaticScaleScrollTop,
  (newScrollTopVal) => {
    octaveContainerRef.value.scrollTop = newScrollTopVal
  },
)
const chromaticInfo = inject("chromaticInfo")
const chromaticScaleArr = computed(() => {
  return chromaticInfo.value.chromaticScale
})
const octaveInfoArr = computed(() => {
  return chromaticScaleArr.value
    .slice()
    .reverse()
    .map((item, index) => {
      return {
        id: index,
        octaveName: item,
        octaveIndex: chromaticScaleArr.value.length - index,
      }
    })
})

function scrollHandler(event) {
  const scrollTop = event.target.scrollTop
  emit("update:chromaticScaleScrollTop", scrollTop)
}

onMounted(() => {
  octaveContainerRef.value.addEventListener("play-sample", (event) => {
    const pitchName = event.detail.pitchName
    if (pitchName === undefined) return
    try {
      const escapedPitchName = pitchName.includes("#")
        ? pitchName.replace("#", "\\#")
        : pitchName
      const target = octaveContainerRef.value.querySelector(
        `[data-note-name=${escapedPitchName}]`,
      )
      if (!target) return
      target.style.backgroundColor = "purple"
      setTimeout(() => {
        resetState(target)
      }, 100)
    } catch (error) {
      console.log(error)
    }
  })
  noteItemStore.octaveContainerInstance = octaveContainerRef.value
})
function playNote(target) {
  target.style.backgroundColor = "purple"
  const noteName = target.dataset["noteName"]
  audioGenerator.generateAudio(noteName)
}
function isNoteElement(elementTarget) {
  return (
    elementTarget.classList.value === "white-key" ||
    elementTarget.classList.value === "black-key"
  )
}
function playPianoAudioTrack(event) {
  const target = event.target
  if (!target) return
  const noteController = new AbortController()
  let emittedTarget = null
  if (isNoteElement(target)) {
    playNote(target)
    emittedTarget = target
  }
  document.addEventListener(
    "mousemove",
    (event) => {
      const nextNote = event.target
      if (!isNoteElement(nextNote)) {
        resetState(emittedTarget)
        return
      }
      if (nextNote !== emittedTarget) {
        resetState(emittedTarget)
        playNote(nextNote)
        emittedTarget = nextNote
      }
    },
    {
      signal: noteController.signal,
    },
  )
  document.addEventListener(
    "mouseup",
    (event) => {
      resetState(event.target)
      noteController.abort()
    },
    {
      once: true,
    },
  )
}

function resetState(target) {
  if (!target) return
  if (target.classList.value === "white-key") {
    target.style.backgroundColor = "white"
  } else if (target.classList.value === "black-key") {
    target.style.backgroundColor = "black"
  }
}
</script>

<template>
  <div class="chromatic-scale-container scrollbar-settings">
    <div class="fold-button">Fold</div>
    <div
      class="octave-container beatified-scrollbar"
      @scroll="scrollHandler"
      @mousedown="playPianoAudioTrack"
      ref="octaveContainerRef"
    >
      <Octave
        v-for="item in octaveInfoArr"
        :key="item.id"
        :id="item.id"
        :octave-name="item.octaveName"
        :octave-index="item.octaveIndex"
      ></Octave>
    </div>
  </div>
</template>

<style scoped>
@import "src/styles/scrollbar.css";
.chromatic-scale-container {
  box-sizing: border-box;
  width: 100px;
  height: 100%;
  padding-bottom: var(--scrollbar-width);
  background-color: antiquewhite;
  display: flex;
  flex-direction: column;
}
.fold-button {
  width: 100%;
  height: 50px;
  flex-shrink: 0;
  text-align: center;
  align-content: center;
  background-color: palevioletred;
}
.octave-container {
  flex-grow: 1;
  overflow: auto;
  width: 100%;
  box-sizing: border-box;
  scrollbar-width: none; /* Firefox,Chrome,Edge */
}
.octave-container::-webkit-scrollbar {
  display: none; /* Chrome,Edge,Safari */
}
</style>
