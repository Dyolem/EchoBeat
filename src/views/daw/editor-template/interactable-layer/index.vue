<script setup>
import { inject, onMounted, onUnmounted, ref, useTemplateRef } from "vue"
import { debounce } from "@/utils/debounce.js"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
import {
  ZOOM_THRESHOLD,
  MIN_ZOOM,
  MAX_ZOOM,
  DEFAULT_ZOOM_RATIO,
  ZIndex,
} from "@/constants/daw/index.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"

const trackRulerStore = useTrackRulerStore()
const beatControllerStore = useBeatControllerStore()
const interactableContainerRef = useTemplateRef("interactableContainerRef")
const controller = new AbortController()

const props = defineProps({
  id: {
    type: String,
    required: true,
  },
  canvasWidth: {
    type: Number,
    default: 2000,
  },
  editorViewHeight: {
    type: Number,
    default: 5000,
  },
  trackZoomRatio: {
    type: Number,
    default: DEFAULT_ZOOM_RATIO,
  },
  modifyTimelineByClick: {
    type: Boolean,
    default: true,
  },
})
const interactableLayerZIndex = ref(ZIndex.INTERACTABLE_LAYER)
const editorBgSvg = ref(ZIndex.EDITOR_BG_SVG)

const svgHeight = inject("bgSvgHeight", "100%")
const emit = defineEmits(["update:trackZoomRatio"])
function CreateZoomCanvas(
  increment = ZOOM_THRESHOLD,
  zoomScale = [MIN_ZOOM, MAX_ZOOM],
  emit,
) {
  if (!emit) return

  const isClamped = (val, scale) => {
    const [min, max] = scale
    return val >= min && val <= max
  }
  return function (handleZoom) {
    const newZoomVal = handleZoom(increment)
    if (!isClamped(newZoomVal, zoomScale)) {
      return
    }
    emit("update:trackZoomRatio", newZoomVal)
  }
}
const zoomCanvas = CreateZoomCanvas(ZOOM_THRESHOLD, [MIN_ZOOM, MAX_ZOOM], emit)

onMounted(() => {
  const drawDebounce = debounce((event) => {
    if (event.ctrlKey) {
      zoomCanvas((zoomIncrement) => {
        let _zoomIncrement = zoomIncrement
        if (event.deltaY >= 0) {
          _zoomIncrement = -zoomIncrement
        }
        return Number((props.trackZoomRatio + _zoomIncrement).toFixed(1))
      })
    }
  }, 150)
  function drawHandler(event) {
    if (event.ctrlKey) event.preventDefault()
    drawDebounce(event)
  }
  interactableContainerRef.value.addEventListener("wheel", drawHandler, {
    signal: controller.signal,
  })

  interactableContainerRef.value.addEventListener(
    "keydown",
    (e) => {
      zoomCanvas((zoomIncrement) => {
        if (e.ctrlKey) {
          if (e.code === "Equal") {
            return Number((props.trackZoomRatio + zoomIncrement).toFixed(1))
          } else if (e.code === "Minus") {
            return Number((props.trackZoomRatio - zoomIncrement).toFixed(1))
          }
        }
      })
    },
    {
      signal: controller.signal,
    },
  )

  if (props.modifyTimelineByClick) {
    interactableContainerRef.value.addEventListener(
      "click",
      (event) => {
        const translateX =
          event.clientX -
          interactableContainerRef.value.getBoundingClientRect().left
        const newTime =
          (translateX / beatControllerStore.totalLength(props.id)) *
          beatControllerStore.editableTotalTime
        trackRulerStore.updateCurrentTime(newTime)
      },
      {
        signal: controller.signal,
      },
    )
  }
})

window.addEventListener(
  "keydown",
  (e) => {
    // e.preventDefault()
    // zoomCanvas((zoomIncrement) => {
    //   if (e.ctrlKey) {
    //     if (e.code === "Equal") {
    //       return Number((props.trackZoomRatio + zoomIncrement).toFixed(1))
    //     } else if (e.code === "Minus") {
    //       return Number((props.trackZoomRatio - zoomIncrement).toFixed(1))
    //     }
    //   }
    // })
  },
  {
    signal: controller.signal,
  },
)

onUnmounted(() => {
  controller.abort()
})
</script>

<template>
  <div
    class="interactable-container"
    ref="interactableContainerRef"
    tabindex="-1"
  >
    <svg class="mix-editor-grid" :width="canvasWidth" :height="svgHeight">
      <defs>
        <pattern
          :id="`${id}-mix-editor-track-grid-pattern`"
          x="0"
          y="0"
          :width="beatControllerStore.dynamicPerBarWidth(id)"
          :height="svgHeight"
          patternUnits="userSpaceOnUse"
          class="is-ignore-second"
        >
          <rect
            v-for="n in beatControllerStore.beatsPerMeasure"
            width="0.5"
            :height="svgHeight"
            fill="var(--graduation-fill)"
            :x="(n - 1) * beatControllerStore.factualDisplayedGridWidth(id)"
          ></rect>
        </pattern>
        <pattern
          :id="`${id}-mix-editor-track-highlight-pattern`"
          x="0"
          y="0"
          :width="beatControllerStore.highlightWidth(id)"
          :height="svgHeight"
          patternUnits="userSpaceOnUse"
        >
          <rect
            :width="beatControllerStore.dynamicPerBarWidth(id)"
            :height="svgHeight"
            fill="gray"
            x="0"
          ></rect>
        </pattern>
      </defs>
      <rect
        :fill="`url(#${id}-mix-editor-track-highlight-pattern)`"
        x="0"
        y="0"
        :width="canvasWidth"
        :height="svgHeight"
      ></rect>
      <rect
        :fill="`url(#${id}-mix-editor-track-grid-pattern)`"
        x="0"
        y="0"
        :width="canvasWidth"
        :height="svgHeight"
      ></rect>
    </svg>
    <div id="interactable-layer"><slot name="interactable-layer"> </slot></div>
  </div>
</template>

<style scoped>
.interactable-container {
  position: relative;
  width: v-bind(canvasWidth + "px");
  height: v-bind(editorViewHeight + "px");
}
#interactable-layer {
  position: absolute;
  z-index: v-bind(interactableLayerZIndex);
}
.mix-editor-grid {
  position: absolute;
  z-index: v-bind(editorBgSvg);
}
</style>
