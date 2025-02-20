<script setup>
import { useTemplateRef } from "vue"
import { useAudioGeneratorStore } from "@/store/daw/audio/audioGenerator.js"
import { usePianoKeySizeStore } from "@/store/daw/pianoKeySize.js"
import { storeToRefs } from "pinia"
const audioGenerator = useAudioGeneratorStore()
const pianoKeySizeStore = usePianoKeySizeStore()
const props = defineProps({
  id: {
    type: Number,
  },
  octaveName: {
    type: String,
    default: "C",
  },
  octaveIndex: {
    type: Number,
    default: 1,
  },
})
const { pianoKeySize } = storeToRefs(pianoKeySizeStore)

const octaveBoxRef = useTemplateRef("octaveBoxRef")
function getPitchName(noteName) {
  return `${noteName}${props.octaveIndex}`
}
function playNote(target) {
  const noteName = target.dataset["noteName"]
  const pitchName = getPitchName(noteName)
  audioGenerator.generateAudio(pitchName)
}
function playPianoAudioTrack(event) {
  const target = event.target
  if (!target) return
  const noteController = new AbortController()
  if (
    target.classList.value === "white-key" ||
    target.classList.value === "black-key"
  ) {
    target.style.backgroundColor = "purple"
    playNote(target)
    let emittedTarget = target
    document.addEventListener(
      "mousemove",
      (event) => {
        const nextNote = event.target
        if (nextNote !== emittedTarget) {
          resetState(target)
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
      () => {
        noteController.abort()
      },
      {
        once: true,
      },
    )
    // target.addEventListener("mouseleave", () => {
    //   resetState(target)
    // })
  }
}
function endPianoAudioTrack(event) {
  resetState(event.target)
}
function resetState(target) {
  if (target.classList.value === "white-key") {
    target.style.backgroundColor = "white"
  } else if (target.classList.value === "black-key") {
    target.style.backgroundColor = "black"
  }
}
</script>

<template>
  <div class="octave-box" ref="octaveBoxRef">
    <div class="upper-tetra-chord tetra-chord">
      <div class="white-key-block">
        <div class="white-key" :data-note-name="`B${props.octaveIndex}`">B</div>
        <div class="white-key" :data-note-name="`A${props.octaveIndex}`">A</div>
        <div class="white-key" :data-note-name="`G${props.octaveIndex}`">G</div>
        <div class="white-key" :data-note-name="`F${props.octaveIndex}`">F</div>
      </div>
      <div class="black-key-block">
        <div class="black-key" :data-note-name="`A#${props.octaveIndex}`">
          A#
        </div>
        <div class="black-key" :data-note-name="`G#${props.octaveIndex}`">
          G#
        </div>
        <div class="black-key" :data-note-name="`F#${props.octaveIndex}`">
          F#
        </div>
      </div>
    </div>
    <div class="lower-tetra-chord tetra-chord">
      <div class="white-key-block">
        <div class="white-key" :data-note-name="`E${props.octaveIndex}`">E</div>
        <div class="white-key" :data-note-name="`D${props.octaveIndex}`">D</div>
        <div class="white-key" :data-note-name="`C${props.octaveIndex}`">
          {{ `${octaveName}` }}
        </div>
      </div>

      <div class="black-key-block">
        <div class="black-key" :data-note-name="`D#${props.octaveIndex}`">
          D#
        </div>
        <div class="black-key" :data-note-name="`C#${props.octaveIndex}`">
          C#
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.octave-box {
  --black-key-height: v-bind(pianoKeySize.blackKeyHeight + "px");
  --white-key-height: v-bind(pianoKeySize.whiteKeyHeight + "px");
  --white-key-width: v-bind(pianoKeySize.whiteKeyWidth + "px");
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: fit-content;
  background-color: antiquewhite;
  user-select: none;
}

.tetra-chord {
  position: relative;
  display: flex;
  flex-direction: column;
}

.black-key-block {
  position: absolute;
  top: calc(var(--white-key-height) - var(--black-key-height) / 2);
  display: flex;
  flex-direction: column;
  gap: calc(var(--white-key-height) - var(--black-key-height));
  pointer-events: none;
}

.white-key {
  box-sizing: border-box;
  text-align: end;
  background-color: white;
  width: var(--white-key-width);
  height: var(--white-key-height);
  border: 1px solid gray;
  border-top: none;
  font-size: 12px;
}
.black-key {
  overflow: hidden;
  box-sizing: border-box;
  width: calc(var(--white-key-width) * 0.618);
  height: 10px;
  line-height: 10px;
  background-color: black;
  color: white;
  font-size: 10px;
  pointer-events: auto;
}
</style>
