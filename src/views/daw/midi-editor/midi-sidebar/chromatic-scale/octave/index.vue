<script setup>
import { computed, inject } from "vue"

const props = defineProps({
  id: {
    type: Number,
  },
  octaveName: {
    type: String,
    default: "C",
  },
})
const pianoKeySize = inject("pianoKeySize")
const whiteKeyWidth = computed(() => {
  return pianoKeySize.value.whiteKeyWidth
})
const whiteKeyHeight = computed(() => {
  return pianoKeySize.value.whiteKeyHeight
})
const blackKeyHeight = computed(() => {
  return pianoKeySize.value.blackKeyHeight
})
</script>

<template>
  <div class="octave-box">
    <div class="upper-tetra-chord tetra-chord">
      <div class="white-key-block">
        <div class="white-key">B</div>
        <div class="white-key">A</div>
        <div class="white-key">G</div>
        <div class="white-key">F</div>
      </div>
      <div class="black-key-block">
        <div class="black-key">A#</div>
        <div class="black-key">G#</div>
        <div class="black-key">F#</div>
      </div>
    </div>
    <div class="lower-tetra-chord tetra-chord">
      <div class="white-key-block">
        <div class="white-key">E</div>
        <div class="white-key">D</div>
        <div class="white-key">{{ `${octaveName}` }}</div>
      </div>

      <div class="black-key-block">
        <div class="black-key">D#</div>
        <div class="black-key">C#</div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.octave-box {
  --black-key-height: v-bind(blackKeyHeight + "px");
  --white-key-height: v-bind(whiteKeyHeight + "px");
  --white-key-width: v-bind(whiteKeyWidth + "px");
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  height: fit-content;
  background-color: antiquewhite;
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
}

.white-key {
  box-sizing: border-box;
  text-align: end;
  background-color: white;
  width: var(--white-key-width);
  height: v-bind(whiteKeyHeight + "px");
  border: 1px solid gray;
  border-top: none;
  font-size: 12px;
}
.black-key {
  box-sizing: border-box;
  width: calc(var(--white-key-width) * 0.618);
  height: 10px;
  background-color: black;
  color: white;
  font-size: 12px;
}
</style>
