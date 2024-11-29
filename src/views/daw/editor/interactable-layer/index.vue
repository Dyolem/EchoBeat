<script setup>
import { onMounted, onUnmounted, useTemplateRef, watch, watchEffect } from "vue"
import { debounce } from "@/utils/debounce.js"
import TimeLine from "@/views/daw/editor/interactable-layer/TimeLine.vue"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
const trackRulerStore = useTrackRulerStore()

const ZOOM_THRESHOLD = 0.1
const interactableContainerRef = useTemplateRef("interactableContainerRef")
const controller = new AbortController()
const props = defineProps({
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
})

watch(
  () => props.canvasWidth,
  (newCanvasWidth) => {
    drawGrid(canvas, {
      canvasWidth: newCanvasWidth,
      canvasHeight: props.canvasHeight + 1,
      gridWidth: props.gridWidth,
      gridHeight: props.gridHeight,
    })
  },
)
const emit = defineEmits(["update:trackZoomRatio"])
function CreateZoomCanvas(increment = 0.1, emit) {
  if (!emit) return
  const isInClamp = (val) => {
    const min = 0.8
    const max = 3
    return val >= min && val <= max
  }
  return function (handleZoom) {
    const newZoomVal = handleZoom(increment)
    if (!isInClamp(newZoomVal)) {
      return
    }
    emit("update:trackZoomRatio", newZoomVal)
  }
}
const zoomCanvas = CreateZoomCanvas(ZOOM_THRESHOLD, emit)

// 绘制轨道格子
function drawGrid(
  target,
  { canvasWidth, canvasHeight, gridWidth = 20, gridHeight = 90 },
) {
  if (!target) return
  const ctx = target.getContext("2d")
  target.width = canvasWidth
  target.height = canvasHeight + 1

  ctx.clearRect(0, 0, canvasWidth, canvasHeight)

  ctx.beginPath()
  ctx.strokeStyle = "#ddd"

  for (let x = 0; x < canvasWidth; x += gridWidth) {
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvasHeight)
  }

  for (let y = 0; y < canvasHeight; y += gridHeight) {
    ctx.moveTo(0, y)
    ctx.lineTo(canvasWidth, y)
  }

  ctx.stroke()
}
let canvas = null
let interactableLayer = null

onMounted(() => {
  canvas = document.getElementById("background")
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
    "click",
    (event) => {
      const translateX =
        event.clientX -
        interactableContainerRef.value.getBoundingClientRect().left
      trackRulerStore.timeLineTranslateDistance = translateX
    },
    {
      signal: controller.signal,
    },
  )
})

window.addEventListener(
  "keydown",
  (e) => {
    e.preventDefault()
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

onUnmounted(() => {
  controller.abort()
})
</script>

<template>
  <div class="interactable-container" ref="interactableContainerRef">
    <canvas
      id="background"
      style="position: absolute; top: 0; left: 0; z-index: 1"
    ></canvas>
    <div id="interactable-layer"></div>
  </div>
</template>

<style scoped>
.interactable-container {
  position: relative;
  width: v-bind(canvasWidth + "px");
  height: v-bind(canvasHeight + "px");
}
</style>
