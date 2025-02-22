<script setup>
import { computed, onMounted, useTemplateRef, watchEffect } from "vue"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
import { useBeatControllerStore } from "@/store/daw/beat-controller/index.js"
const trackRulerStore = useTrackRulerStore()
const beatControllerStore = useBeatControllerStore()
const timelineRef = useTemplateRef("timelineRef")
const props = defineProps({
  id: {
    type: String,
    default: "",
  },
  timelineHeight: {
    type: Number,
    default: 600,
  },
  parentContainer: {
    type: Object,
    default: null,
  },
  trackRulerWidth: {
    type: Number,
    default: 0,
  },
  trackRulerViewWidth: {
    type: Number,
  },
  trackZoomRatio: {
    type: Number,
    default: 1,
  },
})

const timeLineTranslateDistance = computed(() => {
  return (
    (trackRulerStore.timelineCurrentTime /
      beatControllerStore.editableTotalTime) *
    beatControllerStore.totalLength(props.id)
  )
})

const pageIndex = computed(() => {
  return Math.floor(timeLineTranslateDistance.value / props.trackRulerViewWidth)
})

let hasChangedScrollLeft = false
const triggerBufferEdge = 3
watchEffect(() => {
  if (!props.parentContainer) return
  if (trackRulerStore.isDraggingTimelineByUser) {
    //用户手动拖动任意编辑器内的时间线时，滚动距离遵循分页算法逻辑，编辑器各自计算滚动距离
    props.parentContainer.scrollLeft =
      pageIndex.value * props.trackRulerViewWidth
  } else {
    //用户未手动拖动时间线，由播放控件控制移动时，所有编辑器的横向滚动距离遵循以下逻辑:
    //当时间线处于当前编辑器视口内时，时间线如果即将进入编辑器的更新触发条件范围（相差值的绝对值小于3px），滚动距离将增加一个编辑器视口宽度
    const absoluteDelta = Math.abs(
      timeLineTranslateDistance.value -
        (props.parentContainer.scrollLeft + props.trackRulerViewWidth),
    )
    if (absoluteDelta <= triggerBufferEdge) {
      //由于触发条件是一个范围值，而检测为多次检测，触发更新后后续不能再更新
      if (!hasChangedScrollLeft) {
        props.parentContainer.scrollLeft += props.trackRulerViewWidth
        hasChangedScrollLeft = true
      }
    } else {
      hasChangedScrollLeft = false
    }
  }
})

onMounted(() => {
  if (!timelineRef.value) return
  let translateXDistance = 0
  timelineRef.value.addEventListener("mousedown", () => {
    if (trackRulerStore.isPlaying) return
    trackRulerStore.updateTimelineDraggingState(true)
    const selectionController = new AbortController()
    document.addEventListener(
      "selectionchange",
      (event) => {
        const selection = window.getSelection()
        if (selection && selection.toString()) {
          // 清空选区，禁用弹出选项
          selection.removeAllRanges()
        }
        console.log("selectionchange")
      },
      {
        // once: true,
        signal: selectionController.signal,
      },
    )

    const controller = new AbortController()
    function mousemoveHandler(event) {
      const left =
        event.clientX - props.parentContainer.getBoundingClientRect().left
      translateXDistance = props.parentContainer.scrollLeft + left
      if (
        translateXDistance >= 0 &&
        translateXDistance <= props.trackRulerWidth
      ) {
        const newTime =
          (translateXDistance / beatControllerStore.totalLength(props.id)) *
          beatControllerStore.editableTotalTime
        trackRulerStore.updateCurrentTime(newTime)
      }
    }
    document.addEventListener("mousemove", mousemoveHandler, {
      signal: controller.signal,
    })
    document.addEventListener(
      "mouseup",
      () => {
        trackRulerStore.updateTimelineDraggingState(false)
        controller.abort()
        selectionController.abort()
      },
      { once: true },
    )
  })
})
</script>

<template>
  <div class="timeline" ref="timelineRef">
    <span class="auto-scroll-hack">i</span>
  </div>
</template>

<style scoped>
.timeline {
  --enlarge-hover-size: 3px;
  box-sizing: content-box;
  position: absolute;
  left: calc(-0px - var(--enlarge-hover-size));
  width: 2px;
  height: v-bind(timelineHeight + "px");
  background-color: red;
  background-clip: content-box;
  border-left: var(--enlarge-hover-size) solid transparent;
  border-right: var(--enlarge-hover-size) solid transparent;
  transform: v-bind("`translateX(${timeLineTranslateDistance}px)`");
}
.timeline:hover {
  cursor: col-resize;
}
.timeline::before {
  content: "";
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #fff;
  border-radius: 50%;
}
.auto-scroll-hack {
  color: gold;
  opacity: 0;
  position: absolute;
  left: 50%;
  transform: translate(-50%, -50%);
}
</style>
