<script setup>
import { inject, onMounted, onUnmounted, ref, useTemplateRef } from "vue"
import { storeToRefs } from "pinia"
import { debounce } from "@/utils/debounce.js"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
import {
  ZOOM_THRESHOLD,
  MIN_ZOOM,
  MAX_ZOOM,
  DEFAULT_ZOOM_RATIO,
  ZIndex,
  SELECTION_RECT_PROPERTIES,
} from "@/constants/daw/index.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
import ContextMenu from "@/views/daw/components/context-menu/ContextMenu.vue"
import { useSelectionStore } from "@/store/daw/selection.js"

const trackRulerStore = useTrackRulerStore()
const beatControllerStore = useBeatControllerStore()
const selectionStore = useSelectionStore()
const { updateSelectionRect, initSelectionMap } = selectionStore
const {
  totalLength,
  editableTotalTime,
  highlightWidth,
  noteGridWidth,
  pixelsPerTick,
} = storeToRefs(beatControllerStore)
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
  canvasHeight: {
    type: Number,
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
initSelectionMap(props.id)
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

const showSelectionBox = ref(false)
const selectionBoxWidth = ref(0)
const selectionBoxHeight = ref(0)
const selectionBoxX = ref(0)
const selectionBoxY = ref(0)
const selectionBoxZIndex = ref(editorBgSvg.value)

function resetSelectionBoxState() {
  selectionBoxWidth.value = 0
  selectionBoxHeight.value = 0
  selectionBoxX.value = 0
  selectionBoxY.value = 0
  selectionBoxZIndex.value = editorBgSvg.value
}
const selectionBoxController = new AbortController()
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
      "mousedown",
      (event) => {
        // 避免contextmenu事件的mousedown被触发，从而使时间线元素位置改变，导致弹起时的元素不再是原来触发contextmenu事件的元素，这会停止触发contextmenu事件
        // 因此只允许主键（鼠标左键）触发的mousedown继续执行
        if (event.button !== 0) return
        document.addEventListener(
          "mouseup",
          (event) => {
            const translateX =
              event.clientX -
              interactableContainerRef.value.getBoundingClientRect().left
            const tickTranslateX = translateX / pixelsPerTick.value(props.id)
            const newTime =
              (tickTranslateX / totalLength.value(props.id)) *
              editableTotalTime.value
            trackRulerStore.updateCurrentTime(newTime)
          },
          { once: true },
        )
      },
      {
        signal: controller.signal,
      },
    )
  }

  interactableContainerRef.value.addEventListener(
    "mousedown",
    (event) => {
      const editorId = props.id
      const top = interactableContainerRef.value.getBoundingClientRect().top
      const left = interactableContainerRef.value.getBoundingClientRect().left

      const maxSelectionWidth =
        props.canvasWidth * pixelsPerTick.value(props.id)
      const maxSelectionHeight = props.canvasHeight
      if (maxSelectionHeight <= 0) return

      const initX = event.clientX - left
      const initY = event.clientY - top
      const moveController = new AbortController()
      showSelectionBox.value = true
      let isCreatedSelection = false
      selectionBoxX.value = initX
      selectionBoxY.value = initY
      document.addEventListener(
        "mousemove",
        (e) => {
          selectionBoxZIndex.value = interactableLayerZIndex.value + 1
          isCreatedSelection = true
          const top = interactableContainerRef.value.getBoundingClientRect().top
          const left =
            interactableContainerRef.value.getBoundingClientRect().left
          const newX = e.clientX - left
          const newY = e.clientY - top
          const deltaX = newX - initX
          const deltaY = newY - initY
          let maxWidth = maxSelectionWidth
          let maxHeight = maxSelectionHeight
          if (deltaX < 0) {
            selectionBoxX.value = Math.max(newX, 0) //避免矩形的x小于0
            maxWidth = initX
          } else {
            maxWidth = maxSelectionWidth - initX
          }
          if (deltaY < 0) {
            selectionBoxY.value = Math.max(newY, 0) //避免矩形的y小于0
            maxHeight = initY
          } else {
            maxHeight = maxSelectionHeight - initY
          }
          const newWidth = Math.abs(newX - initX)
          const newHeight = Math.abs(newY - initY)
          selectionBoxWidth.value = Math.min(newWidth, maxWidth)
          selectionBoxHeight.value = Math.min(newHeight, maxHeight)
          updateSelectionRect(editorId, {
            [SELECTION_RECT_PROPERTIES.WRITABLE.START_X]: selectionBoxX.value,
            [SELECTION_RECT_PROPERTIES.WRITABLE.START_Y]: selectionBoxY.value,
            [SELECTION_RECT_PROPERTIES.WRITABLE.WIDTH]: selectionBoxWidth.value,
            [SELECTION_RECT_PROPERTIES.WRITABLE.HEIGHT]:
              selectionBoxHeight.value,
          })
        },
        { signal: moveController.signal },
      )
      document.addEventListener(
        "mouseup",
        (e) => {
          if (isCreatedSelection) {
            e.stopPropagation()
          }
          moveController.abort()
          showSelectionBox.value = false
          resetSelectionBoxState()
        },
        { once: true, capture: true },
      )
    },
    { signal: selectionBoxController.signal },
  )
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
  selectionBoxController.abort()
})
</script>

<template>
  <context-menu>
    <div
      class="interactable-container"
      ref="interactableContainerRef"
      tabindex="-1"
    >
      <svg
        class="mix-editor-grid"
        :width="canvasWidth * pixelsPerTick(id)"
        :height="svgHeight"
      >
        <defs>
          <pattern
            :id="`${id}-mix-editor-track-grid-pattern`"
            x="0"
            y="0"
            :width="noteGridWidth(id) * pixelsPerTick(id)"
            :height="svgHeight"
            patternUnits="userSpaceOnUse"
            class="is-ignore-second"
          >
            <rect
              width="0.5"
              :height="svgHeight"
              fill="var(--graduation-fill)"
              x="0"
            ></rect>
          </pattern>
          <pattern
            :id="`${id}-mix-editor-track-highlight-pattern`"
            x="0"
            y="0"
            :width="highlightWidth(id) * pixelsPerTick(id)"
            :height="svgHeight"
            patternUnits="userSpaceOnUse"
          >
            <rect
              :width="(highlightWidth(id) * pixelsPerTick(id)) / 2"
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
          width="100%"
          :height="svgHeight"
        ></rect>
        <rect
          :fill="`url(#${id}-mix-editor-track-grid-pattern)`"
          x="0"
          y="0"
          width="100%"
          :height="svgHeight"
        ></rect>
      </svg>
      <svg
        class="selection-svg"
        :width="canvasWidth * pixelsPerTick(id)"
        :height="svgHeight"
      >
        <rect
          class="selection-box"
          :width="selectionBoxWidth"
          :height="selectionBoxHeight"
          :x="selectionBoxX"
          :y="selectionBoxY"
          v-if="showSelectionBox"
        ></rect>
      </svg>

      <div id="interactable-layer">
        <slot name="interactable-layer"> </slot>
      </div>
    </div>
  </context-menu>
</template>

<style scoped>
.interactable-container {
  position: relative;
  width: v-bind(canvasWidth * pixelsPerTick(id) + "px");
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
.selection-svg {
  position: absolute;
  z-index: v-bind(selectionBoxZIndex);
}
.selection-box {
  position: absolute;
  fill: #ffffff44;
  stroke: #ffffff;
  stroke-dasharray: 2 4;
  stroke-linecap: round;
}
</style>
