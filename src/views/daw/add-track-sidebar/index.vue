<script setup>
import FeatureBar from "@/views/daw/add-track-sidebar/FeatureBar.vue"
import TrackControllerPad from "@/views/daw/add-track-sidebar/TrackControllerPad.vue"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { useTemplateRef, watchEffect, computed, inject, ref } from "vue"
import { storeToRefs } from "pinia"
const mixTrackEditorStore = useMixTrackEditorStore()
const { mixTracksMap } = storeToRefs(mixTrackEditorStore)
const mainEditorSidebarRef = useTemplateRef("mainEditorSidebarRef")
const mainEditorSidebarScrollTop = defineModel("mainEditorSidebarScrollTop", {
  type: Number,
  default: 0,
})
watchEffect(() => {
  if (mainEditorSidebarRef.value) {
    mainEditorSidebarRef.value.scrollTop = mainEditorSidebarScrollTop.value
  }
})
function scrollHandler() {
  mainEditorSidebarScrollTop.value = mainEditorSidebarRef.value.scrollTop
}
const mixTracksArr = computed({
  get: () => {
    return [...mixTracksMap.value]
  },
  set: (newValue) => {
    mixTracksMap.value = new Map(newValue)
  },
})

function adjustAudioTrackOrder({ direction, order }) {
  const trackArr = mixTracksArr.value.slice()
  const trackCount = trackArr.length
  const targetIndex = order
  if (targetIndex === -1) return
  if (
    (targetIndex === 0 && direction < 0) ||
    (targetIndex === trackCount - 1 && direction > 0)
  )
    return
  const moveDirection = direction > 0 ? 1 : -1

  const temp = mixTracksArr.value[order]
  trackArr[order] = trackArr[order + moveDirection]
  trackArr[order + moveDirection] = temp
  mixTracksArr.value = trackArr
}

const { isFolded, unfoldHeight, foldHeight } = inject("foldedAudioTrack")
</script>

<template>
  <div
    class="sidebar-container"
    ref="mainEditorSidebarRef"
    @scroll="scrollHandler"
  >
    <FeatureBar></FeatureBar>
    <div class="track-controllers-container">
      <TrackControllerPad
        v-for="([audioTrackId, audioTrack], index) in mixTracksArr"
        :key="audioTrackId"
        :id="audioTrackId"
        :serial-numbering="index"
        :audio-track-name="audioTrack.audioTrackName"
        :main-color="audioTrack.mainColor"
        :audio-track-icon="audioTrack.audioTrackIcon"
        :audio-track-type="audioTrack.audioTrackType"
        :height="isFolded(audioTrackId) ? foldHeight : unfoldHeight"
        @update:move="adjustAudioTrackOrder"
      ></TrackControllerPad>
    </div>
  </div>
</template>

<style scoped>
.sidebar-container {
  overflow: auto;
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #000000;
  scrollbar-width: none;
}
.track-controllers-container {
  width: 100%;
  flex-grow: 1;
}
.track-controllers-container::after {
  content: "";
  display: block;
  position: static;
  width: 100%;
  height: 100px;
}
</style>
