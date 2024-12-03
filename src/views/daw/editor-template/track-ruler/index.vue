<script setup>
import { computed, createApp } from "vue"
import ContextMenu from "@/components/ContextMenu.vue"
const BEAT_GRID_RATIO = 4
const props = defineProps({
  trackRulerWidth: {
    type: Number,
    default: 2000,
  },
  gridWidth: {
    type: Number,
  },
  gridHeight: {
    type: Number,
  },
  trackZoomRatio: {
    type: Number,
    default: 1,
  },
})
const dynamicBeatWidth = computed(() => {
  return props.gridWidth * BEAT_GRID_RATIO * props.trackZoomRatio
})
const beatInfo = computed(() => {
  const beatInfoArr = []
  let count = 0
  for (let x = 0; x < props.trackRulerWidth; x += dynamicBeatWidth.value) {
    ++count
    beatInfoArr.push({
      count,
      id: count,
      width: dynamicBeatWidth.value,
    })
  }
  // console.log(beatInfoArr)
  return beatInfoArr
})
</script>

<template>
  <ContextMenu>
    <div class="track-ruler-container">
      <span
        class="beat"
        v-for="item in beatInfo"
        :key="item.id"
        :style="{ width: item.width + 'px' }"
        >{{ item.count }}</span
      >
    </div>
    <template #context-menu>
      <div
        class="context-menu-content"
        style="width: 500px; height: 800px; background-color: antiquewhite"
      >
        <div class="context-menu-item">Option 1</div>
        <div class="context-menu-item">Option 2</div>
        <div class="context-menu-item">Option 3</div>
      </div>
    </template>
  </ContextMenu>
</template>

<style scoped>
.track-ruler-container {
  width: v-bind(trackRulerWidth + "px");
  height: 50px;
  background-color: #f0f0f0;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  color: #333;
  user-select: none;
}
.beat {
  text-align: start;
}
</style>
