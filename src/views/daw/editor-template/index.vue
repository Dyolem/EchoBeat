<script setup>
import TrackRuler from "@/views/daw/editor-template/track-ruler/index.vue"
import InteractableLayer from "@/views/daw/editor-template/interactable-layer/index.vue"

import {
  computed,
  ref,
  useTemplateRef,
  useId,
  watch,
  onMounted,
  onUnmounted,
  toRefs,
  inject,
  provide,
} from "vue"
import TimeLine from "@/views/daw/editor-template/interactable-layer/TimeLine.vue"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
import {
  DEFAULT_ZOOM_RATIO,
  SCROLLBAR_WIDTH,
  ZIndex,
} from "@/constants/daw/index.js"

const trackRulerStore = useTrackRulerStore()
const BEATS_NUMBER = 95
const INIT_BPM = 120

const BASE_GRID_WIDTH = 20
const MIN_GRID_WIDTH = 20
const BASE_GRID_HEIGHT = 90
const TRACK_ZOOM_RATIO = DEFAULT_ZOOM_RATIO

const MIN_DRAWER_EDITOR_HEIGHT = 300
const MAX_DRAWER_EDITOR_HEIGHT = 700

const MIN_DRAWER_EDITOR_WIDTH = 600
const MAX_DRAWER_EDITOR_WIDTH = 1600

const INIT_DRAWER_EDITOR_HEIGHT = 400
const INIT_DRAWER_EDITOR_WIDTH = 1600

const trackZoomRatio = ref(TRACK_ZOOM_RATIO)
const trackAmount = ref(10)
const minGridWidth = ref(MIN_GRID_WIDTH)

const gridWidth = computed(() => {
  return trackZoomRatio.value * BASE_GRID_WIDTH
})
const gridHeight = ref(BASE_GRID_HEIGHT)

const {
  canvasContentHeight: provideCanvasContentHeight = null,
  updateCanvasContentHeight = null,
} = inject("canvasContentHeight", {})

const canvasContentWidth = computed(() => {
  return gridWidth.value * beatsNumber.value * 4
})
const canvasContentHeight = computed(() => {
  if (props.canvasContentHeightProp !== undefined)
    return props.canvasContentHeightProp
  else if (provideCanvasContentHeight !== null)
    return provideCanvasContentHeight.value
  else return gridHeight.value * trackAmount.value
})

const beatsNumber = ref(BEATS_NUMBER)
const bpm = ref(INIT_BPM)
const secondsPerBeat = computed(() => {
  return 60 / bpm.value
})
const totalTime = computed(() => {
  return secondsPerBeat.value * beatsNumber.value
})

const editorContentContainerRef = useTemplateRef("editorContentContainerRef")
const editorContentRef = useTemplateRef("editorContentRef")
provide("editorContentContainerRef", editorContentContainerRef)

const props = defineProps({
  id: {
    type: String,
  },
  editorViewHeight: {
    type: Number,
    default: INIT_DRAWER_EDITOR_HEIGHT,
  },
  editorViewWidth: {
    type: Number,
    default: INIT_DRAWER_EDITOR_WIDTH,
  },
  trackRulerHeight: {
    type: Number,
    default: 50,
  },
  resizable: {
    type: Boolean,
    default: false,
  },
  resizableEditorHeightRange: {
    type: Array,
    default: () => [MIN_DRAWER_EDITOR_HEIGHT, MAX_DRAWER_EDITOR_HEIGHT],
  },
  resizableEditorWidthRange: {
    type: Array,
    default: () => [MIN_DRAWER_EDITOR_WIDTH, MAX_DRAWER_EDITOR_WIDTH],
  },

  resizeDirection: {
    type: Array,
    default: () => [],
  },
  canvasContentHeightProp: {
    type: Number,
    default: undefined,
  },
  modifyTimelineByClick: {
    type: Boolean,
    default: true,
  },
})
const id = computed(() => {
  return props.id ?? useId()
})
const trackRulerHeight = computed(() => {
  return props.trackRulerHeight
})
const scrollbarWidth = ref(SCROLLBAR_WIDTH)
provide("trackRulerHeight", trackRulerHeight)
const editableViewWidth = computed(() => {
  return props.editorViewWidth
})
const editableViewHeight = computed(() => {
  return props.editorViewHeight - trackRulerHeight.value - scrollbarWidth.value
})
const emit = defineEmits(["update:editorViewWidth", "update:editorViewHeight"])
const trackRulerZIndex = ref(ZIndex.TRACK_RULER)
const editorContentZIndex = ref(ZIndex.EDITOR_CONTENT)
const { resizableEditorWidthRange, resizableEditorHeightRange } = toRefs(props)

const controller = new AbortController()

const _scrollMovement = ref({
  scrollTop: 0,
  scrollLeft: 0,
})
function _updateScrollMovement({ scrollTop, scrollLeft }) {
  if (scrollTop !== undefined) {
    _scrollMovement.value.scrollTop = scrollTop
  }
  if (scrollLeft !== undefined) {
    _scrollMovement.value.scrollLeft = scrollLeft
  }
}
const { scrollMovement, updateScrollMovement } = inject("scrollMovement", {
  scrollMovement: _scrollMovement,
  updateScrollMovement: _updateScrollMovement,
})

watch(
  scrollMovement,
  (newScrollMovement) => {
    editorContentContainerRef.value.scrollTop = newScrollMovement.scrollTop
    editorContentContainerRef.value.scrollLeft = newScrollMovement.scrollLeft
  },
  { deep: true },
)
onMounted(() => {
  watch(
    () => trackRulerStore.timeLineInstanceMap.get(id.value).scrollLeft,
    (newVal) => {
      editorContentContainerRef.value.scrollLeft = newVal
    },
  )
  watch(
    () => props.editorScrollTop,
    (newVal) => {
      editorContentContainerRef.value.scrollTop = newVal
    },
  )
  if (!props.resizable) return

  const box = editorContentContainerRef.value

  // 鼠标触发区域的边缘宽度
  const edgeWidth = 10

  // 状态跟踪
  let isResizing = false
  let resizeDirection = ""
  let startX, startY, startWidth, startHeight

  // 根据鼠标位置设置光标样式
  box.addEventListener(
    "mousemove",
    (e) => {
      if (isResizing) return // 如果正在拖动，跳过

      const rect = box.getBoundingClientRect()
      const offsetX = e.clientX - rect.left
      const offsetY = e.clientY - rect.top

      if (
        props.resizeDirection.includes("nw") &&
        offsetX < edgeWidth &&
        offsetY < edgeWidth
      ) {
        // 左上角
        box.style.cursor = "nwse-resize"
        resizeDirection = "nw"
      } else if (
        props.resizeDirection.includes("ne") &&
        offsetX > rect.width - edgeWidth &&
        offsetY < edgeWidth
      ) {
        // 右上角
        box.style.cursor = "nesw-resize"
        resizeDirection = "ne"
      } else if (
        props.resizeDirection.includes("sw") &&
        offsetX < edgeWidth &&
        offsetY > rect.height - edgeWidth
      ) {
        // 左下角
        box.style.cursor = "nesw-resize"
        resizeDirection = "sw"
      } else if (
        props.resizeDirection.includes("se") &&
        offsetX > rect.width - edgeWidth &&
        offsetY > rect.height - edgeWidth
      ) {
        // 右下角
        box.style.cursor = "nwse-resize"
        resizeDirection = "se"
      } else if (props.resizeDirection.includes("w") && offsetX < edgeWidth) {
        // 左边
        box.style.cursor = "ew-resize"
        resizeDirection = "w"
      } else if (
        props.resizeDirection.includes("e") &&
        offsetX > rect.width - edgeWidth - 10
      ) {
        // 右边
        box.style.cursor = "ew-resize"
        resizeDirection = "e"
      } else if (props.resizeDirection.includes("n") && offsetY < edgeWidth) {
        // 上边
        box.style.cursor = "ns-resize"
        resizeDirection = "n"
      } else if (
        props.resizeDirection.includes("s") &&
        offsetY > rect.height - edgeWidth - 20 &&
        offsetY < rect.height - edgeWidth - 10
      ) {
        // 下边
        box.style.cursor = "ns-resize"
        resizeDirection = "s"
      } else {
        // 默认
        box.style.cursor = "default"
        resizeDirection = ""
      }
    },
    { signal: controller.signal },
  )

  // 开始拖动
  box.addEventListener(
    "mousedown",
    (e) => {
      if (!resizeDirection) return

      isResizing = true
      startX = e.clientX
      startY = e.clientY
      startWidth = box.getBoundingClientRect().width
      startHeight = box.getBoundingClientRect().height

      document.body.style.cursor = box.style.cursor // 设置全局光标样式
      editorContentRef.value.style.pointerEvents = "none"
    },
    { signal: controller.signal },
  )

  // 拖动调整尺寸
  document.addEventListener(
    "mousemove",
    (e) => {
      if (!isResizing) return

      const dx = e.clientX - startX
      const dy = e.clientY - startY
      const clampLegalValue = (height, range) => {
        const [min, max] = range
        return Math.max(Math.min(height, max), min)
      }
      if (resizeDirection.includes("e")) {
        // box.style.width = `${startWidth + dx}px`
        const width = clampLegalValue(
          startWidth + dx,
          resizableEditorWidthRange.value,
        )
        emit("update:editorViewWidth", width)
      }
      if (resizeDirection.includes("s")) {
        console.log(11)
        const height = clampLegalValue(
          startHeight + dy,
          resizableEditorHeightRange.value,
        )
        emit("update:editorViewHeight", height)
        // drawerEditorHeight.value = height
        // box.style.height = `${height}px`
      }
      if (resizeDirection.includes("w")) {
        // box.style.width = `${startWidth - dx}px`
        const width = clampLegalValue(
          startWidth - dx,
          resizableEditorWidthRange.value,
        )
        emit("update:editorViewWidth", width)
        // drawerEditorWidth.value =width
        // box.style.left = `${box.offsetLeft + dx}px`
      }
      if (resizeDirection.includes("n")) {
        let height = startHeight - dy
        height = clampLegalValue(height, resizableEditorHeightRange.value)
        // box.style.height = `${height}px`
        emit("update:editorViewHeight", height)
        // drawerEditorHeight.value = height
        // box.style.top = `${box.offsetTop + dy}px`
      }
    },
    { signal: controller.signal },
  )

  // 停止拖动
  document.addEventListener(
    "mouseup",
    () => {
      isResizing = false
      resizeDirection = ""
      document.body.style.cursor = "default"
      editorContentRef.value.style.pointerEvents = "initial"
    },
    { signal: controller.signal },
  )
})
function scrollHandler(event) {
  const editorScrollTop = event.target.scrollTop
  const editorScrollLeft = event.target.scrollLeft
  updateScrollMovement({
    scrollTop: editorScrollTop,
    scrollLeft: editorScrollLeft,
  })
}
onUnmounted(() => {
  controller.abort()
})
</script>

<template>
  <section class="studio-editor" :id="id">
    <div
      class="editor-content-container beatified-scrollbar"
      ref="editorContentContainerRef"
      @scroll="scrollHandler"
    >
      <div class="track-ruler-container">
        <TrackRuler
          :grid-width="gridWidth"
          :grid-height="gridHeight"
          :track-ruler-width="canvasContentWidth"
          :track-ruler-height="trackRulerHeight"
          :track-zoom-ratio="trackZoomRatio"
        ></TrackRuler>
        <TimeLine
          :id="id"
          :timeline-height="canvasContentHeight"
          :parent-container="editorContentContainerRef"
          :track-ruler-width="canvasContentWidth"
          :track-ruler-view-width="editorViewWidth"
          :track-zoom-ratio="trackZoomRatio"
        ></TimeLine>
      </div>

      <div class="editor-content" ref="editorContentRef">
        <InteractableLayer
          :id="id"
          :canvas-width="canvasContentWidth"
          :canvas-height="canvasContentHeight"
          :modify-timeline-by-click="modifyTimelineByClick"
          :grid-width="gridWidth"
          :grid-height="gridHeight"
          :min-grid-width="minGridWidth"
          v-model:track-zoom-ratio="trackZoomRatio"
        >
          <template #interactable-layer>
            <slot
              name="default-interactable-layer"
              :interactableLayerWidth="canvasContentWidth"
              :interactableLayerHeight="canvasContentHeight"
              :editableViewWidth="editableViewWidth"
              :editableViewHeight="editableViewHeight"
              :trackRulerHeight="trackRulerHeight"
              :zoomRatio="trackZoomRatio"
            >
            </slot>
          </template>
        </InteractableLayer>
      </div>
    </div>
  </section>
</template>

<style scoped>
@import "src/styles/scrollbar.css";
.studio-editor {
  display: flex;
  height: v-bind(editorViewHeight + "px");
}

.editor-content-container {
  overflow: auto;
  display: flex;
  flex-direction: column;
  height: v-bind(editorViewHeight + "px");
  width: v-bind(editorViewWidth + "px");
  /**padding-left: 10px;**/
}
.track-ruler-container {
  position: sticky;
  top: 0;
  z-index: v-bind(trackRulerZIndex);
}
.editor-content {
  position: relative;
  width: v-bind(canvasContentWidth + "px");
  height: v-bind(canvasContentHeight + "px");
  flex-grow: 1;
  background-color: black;
  z-index: v-bind(editorContentZIndex);
}
</style>
