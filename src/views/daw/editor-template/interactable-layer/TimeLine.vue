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
watchEffect(() => {
  if (props.parentContainer) {
    const pageIndex = Math.floor(
      timeLineTranslateDistance.value / props.trackRulerViewWidth,
    )
    props.parentContainer.scrollLeft = pageIndex * props.trackRulerViewWidth
  }
})

onMounted(() => {
  if (!timelineRef.value) return
  let translateXDistance = 0
  timelineRef.value.addEventListener("mousedown", () => {
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
