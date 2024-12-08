<script setup>
import Octave from "@/views/daw/midi-editor/midi-sidebar/chromatic-scale/octave/index.vue"
import { computed, ref } from "vue"
const chromaticScaleArr = ref(["C1", "C2", "C3", "C4", "C5", "C6", "C7"])
const octaveInfoArr = computed(() => {
  return chromaticScaleArr.value
    .slice()
    .reverse()
    .map((item, index) => {
      return { id: index, octaveName: item }
    })
})
</script>

<template>
  <div class="chromatic-scale-container">
    <div class="fold-button">Fold</div>
    <div class="octave-boxes beatified-scrollbar">
      <Octave
        v-for="item in octaveInfoArr"
        :key="item.id"
        :id="item.id"
        :octave-name="item.octaveName"
      ></Octave>
    </div>
  </div>
</template>

<style scoped>
@import "src/styles/scrollbar.css";
.chromatic-scale-container {
  width: 100px;
  height: 100%;
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
.octave-boxes {
  flex-grow: 1;
  overflow: auto;
  width: 100%;
  box-sizing: border-box;
}
</style>
