<script setup>
import { computed, ref } from "vue"
import ContextMenu from "@/components/ContextMenu.vue"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"

const beatControllerStore = useBeatControllerStore()
const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  trackRulerWidth: {
    type: Number,
    default: 2000,
  },
  trackRulerHeight: {
    type: Number,
    default: 50,
  },
  trackZoomRatio: {
    type: Number,
    default: 1,
  },
})

const dynamicBarInfo = computed(() => {
  const barWidth = beatControllerStore.dynamicPerBarWidth(props.id)
  const barInfo = []
  const serialIncrement =
    beatControllerStore.totalMeasures /
    beatControllerStore.dynamicBarsCount(props.id)
  for (
    let i = 1;
    i < beatControllerStore.totalMeasures + 1;
    i += serialIncrement
  ) {
    barInfo.push({
      id: i,
      serialNumber: i,
      width: barWidth,
    })
  }
  return barInfo
})
const rulerSpanHeight = ref(36)
</script>

<template>
  <ContextMenu>
    <div class="track-ruler">
      <div class="ruler-span-container">
        <span
          class="measure"
          v-for="item in dynamicBarInfo"
          :key="item.id"
          :style="{ width: item.width + 'px' }"
          >{{ item.serialNumber }}</span
        >
      </div>
      <div class="ruler-grid-boundary"></div>

      <svg
        class="mix-editor-grid"
        :width="trackRulerWidth"
        :height="trackRulerHeight"
      >
        <defs>
          <pattern
            :id="`${id}-mix-editor-track-ruler-grid-pattern`"
            x="0"
            y="0"
            :width="beatControllerStore.dynamicPerBarWidth(id)"
            :height="trackRulerHeight"
            patternUnits="userSpaceOnUse"
            class="is-ignore-second"
          >
            <rect
              v-for="n in beatControllerStore.beatsPerMeasure"
              width="0.5"
              :height="trackRulerHeight"
              fill="var(--graduation-fill)"
              :x="(n - 1) * beatControllerStore.factualDisplayedGridWidth(id)"
              :y="n === 1 ? 0 : rulerSpanHeight"
            ></rect>
          </pattern>
        </defs>

        <rect
          :fill="`url(#${id}-mix-editor-track-ruler-grid-pattern)`"
          x="0"
          y="0"
          :width="trackRulerWidth"
          :height="trackRulerHeight"
        ></rect>
      </svg>
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
.track-ruler {
  --ruler-span-height: v-bind(rulerSpanHeight + "px");
  --track-ruler-height: v-bind(trackRulerHeight + "px");
  --track-ruler-width: v-bind(trackRulerWidth + "px");
  width: var(--track-ruler-width);
  height: var(--track-ruler-height);
  background-color: #000000;
  position: relative;
  display: flex;
  flex-direction: column;
  user-select: none;
}
.ruler-span-container {
  width: 100%;
  height: var(--ruler-span-height);
  display: flex;
  align-items: center;
  background-color: #0f1214;
}
.ruler-grid-boundary {
  width: 100%;
  height: calc(100% - var(--ruler-span-height));
  background-color: #000000;
}
.mix-editor-grid {
  position: absolute;
  top: 0;
}
.measure {
  padding-left: 4px;
  text-align: start;
  color: #ffffff;
  font-size: 14px;
}
</style>
