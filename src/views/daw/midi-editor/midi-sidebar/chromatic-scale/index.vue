<script setup>
import Octave from "@/views/daw/midi-editor/midi-sidebar/chromatic-scale/octave/index.vue"
import { computed, inject, useTemplateRef, watch } from "vue"
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
      return { id: index, octaveName: item }
    })
})

function scrollHandler(event) {
  const scrollTop = event.target.scrollTop
  emit("update:chromaticScaleScrollTop", scrollTop)
}
</script>

<template>
  <div class="chromatic-scale-container scrollbar-settings">
    <div class="fold-button">Fold</div>
    <div
      class="octave-container beatified-scrollbar"
      @scroll="scrollHandler"
      ref="octaveContainerRef"
    >
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
