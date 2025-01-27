<script setup>
import FeatureBar from "@/views/daw/add-track-sidebar/FeatureBar.vue"
import TrackControllerPad from "@/views/daw/add-track-sidebar/TrackControllerPad.vue"
import { useMixTrackEditorStore } from "@/store/daw/mix-track-editor/index.js"
const mixTrackEditorStore = useMixTrackEditorStore()
</script>

<template>
  <div class="sidebar-container">
    <FeatureBar></FeatureBar>
    <div class="track-controllers-container">
      <TrackControllerPad
        v-for="[
          audioTrackId,
          audioTrack,
        ] in mixTrackEditorStore.mixTrackUnitMap"
        :key="audioTrackId"
        :id="audioTrackId"
        :serial-numbering="audioTrackId"
        :audio-track-name="audioTrack.audioTrackName"
      ></TrackControllerPad>
    </div>
  </div>
</template>

<style scoped>
.sidebar-container {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #000000;
}
.track-controllers-container {
  width: 100%;
  flex-grow: 1;
  background-color: antiquewhite;
}
</style>
