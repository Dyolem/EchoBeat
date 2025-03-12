<script setup>
import { computed, ref } from "vue"
import { storeToRefs } from "pinia"
import ContextMenu from "@/views/daw/components/context-menu/ContextMenu.vue"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import { SERIAL_NUMBER_FONT_SIZE } from "@/constants/daw/index.js"

const beatControllerStore = useBeatControllerStore()
const {
  totalMeasures,
  beatsPerMeasure,
  widthPerMeasure,
  widthPerBeat,
  gridLayerUnitsCount,
  gridLayerWidth,
  splitPow,
  barsCount,
  barWidth,
  isDisplayBeatLine,
  pixelsPerTick,
} = storeToRefs(beatControllerStore)
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
  const _barWidth = barWidth.value(props.id)
  const _isDisplayBeatLine = isDisplayBeatLine.value(props.id)
  let spanWidth = _barWidth
  const barInfo = []
  if (_isDisplayBeatLine) {
    spanWidth = _barWidth / beatsPerMeasure.value
  }
  const serialIncrement = totalMeasures.value / barsCount.value(props.id)
  for (let i = 1; i < totalMeasures.value + 1; i += serialIncrement) {
    barInfo.push({
      id: i,
      serialNumber: i,
      width: spanWidth,
    })
    if (_isDisplayBeatLine) {
      for (let j = 2; j <= beatsPerMeasure.value; j++) {
        barInfo.push({
          id: `${i}.${j}`,
          serialNumber: `${i}.${j}`,
          width: spanWidth,
        })
      }
    }
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
          :style="{ width: item.width * pixelsPerTick(id) + 'px' }"
          >{{ item.serialNumber }}</span
        >
      </div>
      <div class="ruler-grid-boundary"></div>

      <svg
        class="mix-editor-grid"
        :width="trackRulerWidth * pixelsPerTick(id)"
        :height="trackRulerHeight"
      >
        <defs>
          <!--小节层-->
          <pattern
            :id="`${id}-mix-editor-track-ruler-grid-measure-layer-pattern`"
            x="0"
            y="0"
            :width="barWidth(id) * pixelsPerTick(id)"
            :height="trackRulerHeight"
            patternUnits="userSpaceOnUse"
            class="is-ignore-second"
          >
            <rect
              width="0.5"
              :height="trackRulerHeight"
              fill="var(--graduation-fill)"
              :x="0"
              :y="0"
            ></rect>
          </pattern>
          <!--节拍层-->
          <pattern
            :id="`${id}-mix-editor-track-ruler-grid-beat-layer-pattern`"
            x="0"
            y="0"
            :width="widthPerMeasure(id) * pixelsPerTick(id)"
            :height="trackRulerHeight"
            patternUnits="userSpaceOnUse"
            class="is-ignore-second"
          >
            <rect
              v-for="n in beatsPerMeasure"
              width="0.5"
              :height="trackRulerHeight"
              fill="var(--graduation-fill)"
              :x="widthPerBeat(id) * (n - 1) * pixelsPerTick(id)"
              :y="rulerSpanHeight"
            ></rect>
          </pattern>
          <!--网格层-->
          <pattern
            :id="`${id}-mix-editor-track-ruler-grid-layer-pattern`"
            x="0"
            y="0"
            :width="widthPerBeat(id) * pixelsPerTick(id)"
            :height="trackRulerHeight"
            patternUnits="userSpaceOnUse"
            class="is-ignore-second"
          >
            <rect
              v-if="splitPow(id) >= 0"
              v-for="n in gridLayerUnitsCount(id)"
              width="0.5"
              :height="trackRulerHeight"
              fill="var(--graduation-fill)"
              :x="gridLayerWidth(id) * (n - 1) * pixelsPerTick(id)"
              :y="rulerSpanHeight"
            ></rect>
          </pattern>
        </defs>

        <rect
          :fill="`url(#${id}-mix-editor-track-ruler-grid-measure-layer-pattern)`"
          x="0"
          y="0"
          width="100%"
          :height="trackRulerHeight"
        ></rect>
        <rect
          :fill="`url(#${id}-mix-editor-track-ruler-grid-beat-layer-pattern)`"
          x="0"
          y="0"
          width="100%"
          :height="trackRulerHeight"
        ></rect>
        <rect
          :fill="`url(#${id}-mix-editor-track-ruler-grid-layer-pattern)`"
          x="0"
          y="0"
          width="100%"
          :height="trackRulerHeight"
        ></rect>
      </svg>
    </div>
  </ContextMenu>
</template>

<style scoped>
.track-ruler {
  --ruler-span-height: v-bind(rulerSpanHeight + "px");
  --track-ruler-height: v-bind(trackRulerHeight + "px");
  --track-ruler-width: v-bind((trackRulerWidth * pixelsPerTick(id)) + "px");
  --serial-number-font-size: v-bind(SERIAL_NUMBER_FONT_SIZE + "px");
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
  font-size: var(--serial-number-font-size);
}
</style>
