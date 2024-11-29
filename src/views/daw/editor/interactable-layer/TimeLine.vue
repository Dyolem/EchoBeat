<script setup>
import { onMounted, ref, useTemplateRef, watch } from "vue"
import { useTrackRulerStore } from "@/store/daw/trackRuler/timeLine.js"
const trackRulerStore = useTrackRulerStore()
const timelineRef = useTemplateRef("timelineRef")
const props = defineProps({
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
})
// watch(
//   () => trackRulerStore.timeLineTranslateDistance,
//   (newVal) => {
//     timelineRef.value.style.transform = `translateX(${newVal}px)`
//   },
// )
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
        signal: selectionController.signal,
      },
    )

    const controller = new AbortController()

    document.addEventListener(
      "mousemove",
      (event) => {
        const left =
          event.clientX - props.parentContainer.getBoundingClientRect().left
        translateXDistance = props.parentContainer.scrollLeft + left
        if (
          translateXDistance >= 0 &&
          translateXDistance <= props.trackRulerWidth
        ) {
          trackRulerStore.timeLineTranslateDistance = translateXDistance
          // timelineRef.value.style.transform = `translateX(${translateXDistance}px)`
        }
      },
      {
        signal: controller.signal,
      },
    )
    document.addEventListener("mouseup", () => {
      console.log("mouseup")
      controller.abort()
      selectionController.abort()
    })
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
  height: v-bind("timelineHeight + 'px'");
  background-color: red;
  background-clip: content-box;
  border-left: var(--enlarge-hover-size) solid transparent;
  border-right: var(--enlarge-hover-size) solid transparent;
  transform: v-bind(
    "`translateX(${trackRulerStore.timeLineTranslateDistance}px)`"
  );
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
