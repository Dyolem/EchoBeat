<script setup>
import Octave from "@/views/daw/midi-editor/midi-sidebar/chromatic-scale/octave/index.vue"
import { computed, inject, onMounted, useTemplateRef, watch } from "vue"
import { useAudioGeneratorStore } from "@/store/daw/audio/audioGenerator.js"
import { useNoteItemStore } from "@/store/daw/note-editor/noteItem.js"
import { storeToRefs } from "pinia"
import { usePianoKeySizeStore } from "@/store/daw/pianoKeySize.js"
import MixEditorButton from "@/views/daw/mix-editor-button/MixEditorButton.vue"

const audioGenerator = useAudioGeneratorStore()
const noteItemStore = useNoteItemStore()
const pianoKeySizeStore = usePianoKeySizeStore()

const props = defineProps({
  chromaticScaleScrollTop: {
    type: Number,
  },
})
const { chromaticInfo } = storeToRefs(pianoKeySizeStore)

const mainColor = inject("mainColor")
const emit = defineEmits(["update:chromaticScaleScrollTop"])
const workspacePlaceHolderHeight = inject("workspacePlaceHolderHeight", 20)
const octaveContainerRef = useTemplateRef("octaveContainerRef")
watch(
  () => props.chromaticScaleScrollTop,
  (newScrollTopVal) => {
    octaveContainerRef.value.scrollTop = newScrollTopVal
  },
)
const chromaticScaleArr = computed(() => {
  return chromaticInfo.value.chromaticScale
})
const octaveInfoArr = computed(() => {
  return chromaticScaleArr.value
    .slice()
    .reverse()
    .map((item) => {
      const octaveIndex = item.split("")[1]
      return {
        id: item,
        octaveName: item,
        octaveIndex: octaveIndex,
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
    const stopPlaySignal = event.detail.audioSignal
    try {
      const escapedPitchName = pitchName.includes("#")
        ? pitchName.replace("#", "\\#")
        : pitchName
      const target = octaveContainerRef.value.querySelector(
        `[data-note-name="${escapedPitchName}"]`,
      )
      if (!target) return
      target.style.backgroundColor = mainColor.value
      if (!stopPlaySignal) {
        setTimeout(() => {
          resetState(target)
        }, 100)
      } else {
        stopPlaySignal.addEventListener(
          "abort",
          () => {
            resetState(target)
          },
          { once: true },
        )
      }
    } catch (error) {
      console.log(error)
    }
  })
  noteItemStore.octaveContainerInstance = octaveContainerRef.value
})
function playNote(target) {
  target.style.backgroundColor = mainColor.value
  const noteName = target.dataset["noteName"]
  return audioGenerator.generateAudio(noteName)
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
  let emittedAudioController = null
  if (isNoteElement(target)) {
    emittedTarget = target
    emittedAudioController = playNote(target)
  }
  document.addEventListener(
    "mousemove",
    (event) => {
      const nextNote = event.target
      if (!isNoteElement(nextNote)) {
        resetState(emittedTarget)
        emittedAudioController
          ?.then((controller) => {
            controller.abort()
          })
          .catch((error) => {
            console.error("Failed to abort emittedAudioController:", error)
          })
        return
      }
      if (nextNote !== emittedTarget) {
        resetState(emittedTarget)
        emittedAudioController
          ?.then((controller) => {
            controller.abort()
          })
          .catch((error) => {
            console.error("Failed to abort emittedAudioController:", error)
          })

        emittedTarget = nextNote
        emittedAudioController = playNote(nextNote)
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
      emittedAudioController
        ?.then((controller) => {
          controller.abort()
        })
        .catch((error) => {
          console.error("Failed to abort emittedAudioController:", error)
        })
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
    <div class="fold-button">
      <MixEditorButton circle size="small">Fold</MixEditorButton>
    </div>
    <span class="workspace-placeHolder"></span>
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
  width: 80px;
  height: 100%;
  padding-bottom: var(--scrollbar-width);
  display: flex;
  flex-direction: column;
}
.workspace-placeHolder {
  width: 100%;
  height: v-bind(workspacePlaceHolderHeight + "px");
  flex-shrink: 0;
}
.fold-button {
  width: 100%;
  height: 50px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
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
