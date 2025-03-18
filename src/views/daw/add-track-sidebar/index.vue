<script setup>
import FeatureBar from "@/views/daw/add-track-sidebar/FeatureBar.vue"
import TrackControllerPad from "@/views/daw/add-track-sidebar/TrackControllerPad.vue"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
import { useTemplateRef, watchEffect } from "vue"
const mixTrackEditorStore = useMixTrackEditorStore()
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
        v-for="[audioTrackId, audioTrack] in mixTrackEditorStore.mixTracksMap"
        :key="audioTrackId"
        :id="audioTrackId"
        :serial-numbering="audioTrack.serialNumbering"
        :audio-track-name="audioTrack.audioTrackName"
        :main-color="audioTrack.mainColor"
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
