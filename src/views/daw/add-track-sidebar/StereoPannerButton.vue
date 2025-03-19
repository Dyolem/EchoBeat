<script setup>
import { ref, computed, useTemplateRef, onMounted, onUnmounted } from "vue"
import clearSelection from "@/utils/clearSelection.js"
import { clamp } from "@/utils/clamp.js"
import { useAudioStore } from "@/store/daw/audio/index.js"
const audioStore = useAudioStore()
const props = defineProps({
  audioTrackId: {
    type: String,
    required: true,
  },
})
const stereoPointerRotationDeg = ref(0)
const stereoPannerButtonRef = useTemplateRef("stereoPannerButtonRef")
const pixelPerDeg = 2
const stereoPerDeg = 1 / 120
const numPerDeg = 50 / 120
const rotationScale = [-120, 120]
const stereoTooltipContent = computed(() => {
  const tooltipContent = Math.round(stereoPointerRotationDeg.value * numPerDeg)
  if (tooltipContent > 0) {
    return `+${tooltipContent}`
  } else {
    return `${tooltipContent}`
  }
})
const tooltipVisible = ref(false)

const controller = new AbortController()
onMounted(() => {
  if (!stereoPannerButtonRef.value) return
  stereoPannerButtonRef.value.addEventListener(
    "mousedown",
    (event) => {
      const moveController = new AbortController()
      const initY = event.clientY
      const initRotationDeg = stereoPointerRotationDeg.value
      const selectController = clearSelection()
      document.body.style.cursor = "ns-resize"
      tooltipVisible.value = true
      document.addEventListener(
        "mousemove",
        (e) => {
          const deltaY = -(e.clientY - initY)
          const newRotationDeg = deltaY / pixelPerDeg
          const clampedDeg = clamp(
            newRotationDeg + initRotationDeg,
            rotationScale,
          )
          stereoPointerRotationDeg.value = clampedDeg
          const stereoVal = clampedDeg * stereoPerDeg
          audioStore.updateAudioTrackStereo({
            audioTrackId: props.audioTrackId,
            stereoValue: stereoVal,
          })
        },
        { signal: moveController.signal },
      )
      window.addEventListener(
        "mouseup",
        () => {
          moveController.abort()
          selectController.abort()
          document.body.style.cursor = "initial"
          tooltipVisible.value = false
        },
        {
          once: true,
        },
      )
    },
    { signal: controller.signal },
  )
})
onUnmounted(() => {
  controller.abort()
})
</script>

<template>
  <div class="stereo-panner-button-container">
    <el-tooltip
      :visible="tooltipVisible"
      effect="dark"
      :content="stereoTooltipContent"
      placement="top"
    >
      <div class="stereo-panner-button" ref="stereoPannerButtonRef">
        <div class="scale-mark">
          <svg width="38" height="38" viewBox="0 0 38 38" fill="none">
            <path
              d="M33.79 27.03h.68L36.61 30h1.05l-2.2-3.01c1.02-.18 1.74-.89 1.74-1.97 0-1.29-.93-2.02-2.25-2.02H32.9v7h.89v-2.97Zm0-3.21h1.15c.8 0 1.36.42 1.36 1.2 0 .77-.56 1.22-1.36 1.22h-1.15v-2.42ZM2.21 23v7h3.6v-.83H3.1V23h-.9.01ZM35 18.5a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0ZM33 10.5a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0ZM28 5.5a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0ZM20 3.5a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0ZM12 5.5a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0ZM6 10.5a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0ZM4 18.5a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0Z"
              fill="currentColor"
            ></path>
          </svg>
        </div>
        <div class="pointer"></div>
      </div>
    </el-tooltip>
  </div>
</template>

<style scoped>
.stereo-panner-button-container {
  padding: 0 16px 0 30px;
}
.stereo-panner-button {
  --stereo-panner-button-width: 24px;
  --stereo-panner-button-height: 24px;
  --pointer-rotation-deg: v-bind(stereoPointerRotationDeg + "deg");
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: var(--stereo-panner-button-width);
  height: var(--stereo-panner-button-height);
  background-color: #ffffff;
  border-radius: 50%;
  color: #ffffff;
  font-size: 10px;
  will-change: transform;
}
.stereo-panner-button:hover {
  cursor: ns-resize;
}
.pointer {
  width: 2px;
  height: 10px;
  background-color: #0f1214;
  translate: 0 -50%;
  rotate: var(--pointer-rotation-deg);
  transform-origin: center bottom;
}
.scale-mark {
  position: absolute;
}
</style>
