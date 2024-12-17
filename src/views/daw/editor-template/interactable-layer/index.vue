<script setup>
import { inject, onMounted, onUnmounted, useTemplateRef, watch } from "vue"
import { debounce } from "@/utils/debounce.js"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
const trackRulerStore = useTrackRulerStore()

const ZOOM_THRESHOLD = 0.1
const MAX_ZOOM = 6
const MIN_ZOOM = 0.8
const interactableContainerRef = useTemplateRef("interactableContainerRef")
const controller = new AbortController()
const drawGrid = inject("drawGrid", defaultDrawGrid)
const props = defineProps({
  id: {
    type: String,
    default: "",
  },
  canvasWidth: {
    type: Number,
    default: 2000,
  },
  canvasHeight: {
    type: Number,
    default: 5000,
  },
  trackZoomRatio: {
    type: Number,
    default: 1,
  },
  gridWidth: {
    type: Number,
    default: 20,
  },
  gridHeight: {
    type: Number,
    default: 90,
  },
  minGridWidth: {
    type: Number,
    default: 20,
  },
  modifyTimelineByClick: {
    type: Boolean,
    default: true,
  },
})

watch(
  () => props.canvasWidth,
  (newCanvasWidth) => {
    drawGrid(canvas, {
      canvasWidth: newCanvasWidth,
      canvasHeight: props.canvasHeight + 1,
      gridWidth: props.gridWidth,
      gridHeight: props.gridHeight,
      minGridWidth: props.minGridWidth,
    })
  },
)
const emit = defineEmits(["update:trackZoomRatio"])
function CreateZoomCanvas(
  increment = 0.1,
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
    trackRulerStore.SynchronizeState(props.id, {
      trackZoomRatio: newZoomVal,
      translateXDistance:
        (trackRulerStore.timeLineInstanceMap.get(props.id).translateXDistance /
          trackRulerStore.timeLineInstanceMap.get(props.id).trackZoomRatio) *
        newZoomVal,
    })
  }
}
const zoomCanvas = CreateZoomCanvas(ZOOM_THRESHOLD, [MIN_ZOOM, MAX_ZOOM], emit)

// 绘制轨道格子
function defaultDrawGrid(
  target,
  {
    canvasWidth,
    canvasHeight,
    gridWidth = props.gridWidth,
    gridHeight = props.gridHeight,
    minGridWidth = props.minGridWidth,
  },
) {
  if (!target) return
  const ctx = target.getContext("2d")
  target.width = canvasWidth
  target.height = canvasHeight + 1

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  ctx.beginPath()

  //Draw vertical lines
  const isAliquot = gridWidth % minGridWidth === 0

  for (let x = 0; x <= canvasWidth; x += gridWidth) {
    ctx.strokeStyle = "#ddd"
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvasHeight)
    if (isAliquot && gridWidth !== minGridWidth) {
      const integralMultiple = gridWidth / minGridWidth
      for (let i = 1; i < integralMultiple; i++) {
        const drawnX = x - i * minGridWidth
        ctx.moveTo(drawnX, 0)
        ctx.lineTo(drawnX, canvasHeight)
      }
    }
  }
  ctx.stroke()
  // Draw horizontal lines
  for (let y = 0; y < canvasHeight; y += gridHeight) {
    ctx.strokeStyle = "#ddd"
    ctx.moveTo(0, y)
    ctx.lineTo(canvasWidth, y)
  }

  ctx.stroke()
}
let canvas = null
let interactableLayer = null
const canvasBackgroundRef = useTemplateRef("canvasBackgroundRef")

onMounted(() => {
  // canvas = document.getElementById("background")
  canvas = canvasBackgroundRef.value
  interactableLayer = document.getElementById("interactable-layer")

  drawGrid(canvas, {
    canvasWidth: props.canvasWidth,
    canvasHeight: props.canvasHeight + 1,
    gridWidth: props.gridWidth,
    gridHeight: props.gridHeight,
  })
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
      console.log(11)
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
        trackRulerStore.SynchronizeState(props.id, {
          translateXDistance: translateX,
        })
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
    e.preventDefault()
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
    <canvas
      id="background"
      ref="canvasBackgroundRef"
      style="position: absolute; top: 0; left: 0; z-index: 1"
    ></canvas>
    <div id="interactable-layer"><slot name="interactable-layer"> </slot></div>
  </div>
</template>

<style scoped>
.interactable-container {
  position: relative;
  width: v-bind(canvasWidth + "px");
  height: v-bind(canvasHeight + "px");
}
#interactable-layer {
  position: absolute;
  z-index: 10;
}
</style>
