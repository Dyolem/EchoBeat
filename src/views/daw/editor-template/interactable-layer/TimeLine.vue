<script setup>
import { computed, onMounted, ref, useTemplateRef, watch } from "vue"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
const trackRulerStore = useTrackRulerStore()
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
  },
  trackZoomRatio: {
    type: Number,
    default: 1,
  },
})

trackRulerStore.timeLineInstanceMap.set(props.id, {
  translateXDistance: 0,
  scrollLeft: 0,
  trackZoomRatio: props.trackZoomRatio,
})
const timeLineTranslateDistance = computed(() => {
  return trackRulerStore.timeLineInstanceMap.get(props.id).translateXDistance
})
onMounted(() => {
  if (!timelineRef.value) return
  let translateXDistance = 0
  trackRulerStore.timelineStateReset()
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
        trackRulerStore.SynchronizeState(props.id, {
          translateXDistance,
          scrollLeft: translateXDistance - left,
          trackZoomRatio: props.trackZoomRatio,
        })

        // props.parentContainer.scrollLeft = translateXDistance - left
        // console.log(translateXDistance - left)
        // timelineRef.value.style.transform = `translateX(${translateXDistance}px)`
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
  position: absolute;
  left: calc(-0px - var(--enlarge-hover-size));
  z-index: 10;
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
